-- Owner-facing admin: read every student's profile and progress.
--
-- The admin dashboard reads through the OWNER'S OWN SESSION, not the secret
-- key, so the database — not the Next.js route — decides what an admin may see.
-- A missing `notFound()` in app code then leaks nothing: RLS still returns one
-- row. That is the whole point of doing this here instead of in TypeScript.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('waitlist', 'student', 'admin'));

comment on column public.profiles.role is
  'Authorization source of truth. Granted manually by the owner (SQL editor or '
  'secret key). Never user-writable — enforced by the column grants and the '
  'profiles_guard_role trigger, NOT by RLS. ''admin'' additionally unlocks the '
  'read-everything policies below.';

-- The recursion trap: a policy ON profiles whose predicate SELECTs FROM
-- profiles re-enters the same policy and Postgres raises
-- "infinite recursion detected in policy for relation profiles" — every read
-- 500s, including the user's own. SECURITY DEFINER is the fix, not a
-- convenience: it runs as the owner, who is exempt from RLS, so the lookup
-- inside never re-triggers the policy that called it.
create or replace function private.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

comment on function private.is_admin() is
  'True when the caller is an admin. Leaks nothing: it only ever reports on '
  'auth.uid(), so a non-admin calling it directly just gets false.';

-- Unlike the trigger functions in this schema, a policy predicate is evaluated
-- as the QUERYING role, not the owner — so `authenticated` genuinely needs
-- USAGE + EXECUTE here or every admin read fails with "permission denied for
-- schema private". Triggers never needed it: their EXECUTE is checked once, at
-- CREATE TRIGGER time.
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

-- ...but USAGE on the schema re-opens the hole the original migration closed:
-- Postgres grants EXECUTE to PUBLIC on every new function, so the NEXT helper
-- added to `private` would silently become callable by any signed-in user.
-- Lock the existing ones explicitly and change the default for future ones.
revoke execute on function private.handle_new_user() from public, anon, authenticated;
revoke execute on function private.guard_profile_role() from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public;

-- Policies are OR'd, so these stack on top of the "own row" policies rather
-- than replacing them: an admin sees everything, everyone else still sees self.
create policy "profiles_select_admin"
  on public.profiles for select to authenticated
  using ( private.is_admin() );

-- SELECT only, deliberately. Nothing in the admin UI writes, and an admin who
-- cannot UPDATE profiles cannot promote anyone — role changes stay a manual,
-- audited act by the owner (the profiles_guard_role trigger enforces the same
-- rule from the other side).
create policy "lesson_progress_select_admin"
  on public.lesson_progress for select to authenticated
  using ( private.is_admin() );

-- The waitlist holds emails of people who never created an account, and until
-- now `authenticated` had no grant on it at all — it was server-key-only.
-- Granting SELECT trades one layer of that defense for the funnel view
-- ("signed up but never activated"), leaving RLS as the sole gate. Acceptable
-- because it is the same single gate that already protects `profiles`, which
-- holds the same emails.
grant select on public.waitlist to authenticated;

create policy "waitlist_select_admin"
  on public.waitlist for select to authenticated
  using ( private.is_admin() );

-- The first admin. Chicken-and-egg: no admin exists to grant this, and RLS
-- cannot be used to bootstrap itself, so it is seeded here. Idempotent, and
-- auth.uid() is NULL during a migration, so profiles_guard_role allows it.
update public.profiles
set role = 'admin'
where lower(email) = 'rulocode7@gmail.com'
  and role <> 'admin';
