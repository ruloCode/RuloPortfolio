-- Per-user lesson completion for the study platform.
--
-- Row exists = lesson completed. Un-completing is a DELETE, so completed_at
-- always means "when", with no "row exists but means nothing" state.

create table if not exists public.lesson_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  -- Matches the MDX filename in src/app/[locale]/dashboard/lessons/<locale>/.
  -- Deliberately no foreign key: lessons live in the repo, not the DB. This
  -- CHECK is the only thing standing between this table and arbitrary junk.
  lesson_slug  text not null check (lesson_slug ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  completed_at timestamptz not null default now(),
  -- User-first, so "all progress for this user" is an index scan. Also serves
  -- as the conflict target for upserts — no extra index needed.
  primary key (user_id, lesson_slug)
);

alter table public.lesson_progress enable row level security;

-- `TO authenticated` alone would be authentication without authorization (BOLA):
-- it checks the role but not which rows. The ownership predicate is what scopes
-- it. `(select auth.uid())` — not bare auth.uid() — so it runs once per
-- statement as an InitPlan instead of once per row.
create policy "lesson_progress_select_own"
  on public.lesson_progress for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "lesson_progress_insert_own"
  on public.lesson_progress for insert to authenticated
  with check ( (select auth.uid()) = user_id );

-- UPDATE needs BOTH clauses: with only USING, a user could reassign a row's
-- user_id to someone else's account.
create policy "lesson_progress_update_own"
  on public.lesson_progress for update to authenticated
  using      ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

create policy "lesson_progress_delete_own"
  on public.lesson_progress for delete to authenticated
  using ( (select auth.uid()) = user_id );

revoke all on public.lesson_progress from anon, authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;
