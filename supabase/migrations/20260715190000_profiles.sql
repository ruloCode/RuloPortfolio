-- Profiles for the AI Shift Challenge study platform.
--
-- Auth is magic-link only; a profile is created by trigger on signup and holds
-- the authorization role. Roles are granted by the owner, never by the user.

-- SECURITY DEFINER helpers live here, never in `public`: Postgres grants
-- EXECUTE to PUBLIC by default, which would make each one a public endpoint
-- callable by anon/authenticated.
create schema if not exists private;
revoke all on schema private from anon, authenticated;

create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null default 'waitlist' check (role in ('waitlist', 'student')),
  locale      text not null default 'en'       check (locale in ('en', 'es')),
  full_name   text,
  -- Provenance: which waitlist signup this account came from. Nullable —
  -- someone can sign in without ever having joined the waitlist.
  waitlist_id uuid references public.waitlist (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.profiles.role is
  'Authorization source of truth. Granted manually by the owner (SQL editor or '
  'secret key). Never user-writable — enforced by the column grants and the '
  'profiles_guard_role trigger below, NOT by RLS.';

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using ( (select auth.uid()) = id );

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using      ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id );

-- No INSERT policy: rows come from the on_auth_user_created trigger.
-- No DELETE policy: rows die with the auth.users cascade. No policy == denied.

-- The privilege-escalation trap this guards against:
-- Supabase ships `alter default privileges in schema public grant all on tables
-- to anon, authenticated`, and RLS is row-level, not column-level. With only the
-- policy above, `update profiles set role='student' where id = auth.uid()`
-- SUCCEEDS — the row is yours, so USING and WITH CHECK both pass, and every
-- waitlist user promotes themselves into the paid cohort. These grants are what
-- actually stop it: RLS cannot express "any column except role", because
-- WITH CHECK only ever sees NEW, never OLD.
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, locale) on public.profiles to authenticated;

-- Defense in depth, in case a later migration re-grants UPDATE broadly.
create or replace function private.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- auth.uid() is NULL for the secret key and the dashboard SQL editor — that is
  -- how the owner promotes someone. It is non-NULL for any signed-in user, who
  -- may never touch their own role.
  if new.role is distinct from old.role and (select auth.uid()) is not null then
    raise exception 'profiles.role is not user-editable';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before update on public.profiles
  for each row execute function private.guard_profile_role();

-- Profile creation on signup.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer     -- must read public.waitlist, which is RLS-locked to server-only
set search_path = '' -- everything below is schema-qualified; blocks search_path hijack
as $$
declare
  v_waitlist public.waitlist%rowtype;
  v_locale   text;
begin
  select * into v_waitlist
  from public.waitlist
  where lower(email) = lower(new.email)
  limit 1;

  -- raw_user_meta_data is USER-CONTROLLED: used for i18n only, never for
  -- authorization. Falls back to the waitlist row, then 'en'.
  v_locale := coalesce(
    nullif(new.raw_user_meta_data ->> 'locale', ''),
    v_waitlist.locale,
    'en'
  );
  if v_locale not in ('en', 'es') then
    v_locale := 'en';
  end if;

  insert into public.profiles (id, email, role, locale, full_name, waitlist_id)
  values (
    new.id,
    new.email,
    'waitlist',   -- everyone starts here; 'student' is granted by the owner
    v_locale,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    v_waitlist.id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Backfill for any account that predates this migration.
insert into public.profiles (id, email, role, locale, waitlist_id)
select u.id,
       u.email,
       'waitlist',
       case when w.locale in ('en', 'es') then w.locale else 'en' end,
       w.id
from auth.users u
left join public.waitlist w on lower(w.email) = lower(u.email)
on conflict (id) do nothing;
