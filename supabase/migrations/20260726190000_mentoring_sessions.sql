-- Per-student session notes: what happened, and what each side owes after it.
--
-- IDENTITY IS THE EMAIL, not a user id. The first person who needs a session
-- logged (Evelyn) is on the waitlist with no auth.users row at all, so a
-- foreign key to profiles would make it impossible to record the very session
-- this table exists for. Email is already the join key the rest of this schema
-- uses -- handle_new_user() matches waitlist to auth on lower(email) -- so a
-- note written before someone signs up stays attached the day they do.

create table if not exists public.mentoring_sessions (
  id           uuid primary key default gen_random_uuid(),
  -- Lowercased at the boundary AND enforced here: two rows differing only by
  -- case would silently split one person's history into two timelines.
  person_email text not null check (person_email = lower(person_email) and person_email <> ''),
  session_date date not null default (now() at time zone 'utc')::date,
  title        text not null check (char_length(title) between 1 and 200),
  -- Plain text, rendered as paragraphs and "- " bullets by the app. Not MDX:
  -- these notes are pasted prose, and a stray brace in a client's quote must
  -- never be able to blow up the page it appears on.
  summary      text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists mentoring_sessions_person_idx
  on public.mentoring_sessions (person_email, session_date desc);

-- Action items live in their own table rather than a jsonb blob on the session
-- so "what is still open across every student" is one indexed query instead of
-- a scan that unpacks JSON.
create table if not exists public.session_actions (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.mentoring_sessions (id) on delete cascade,
  -- Who owes it. The whole point of follow-up is telling "she still hasn't
  -- sent the files" apart from "I still haven't sent the quote".
  owner      text not null default 'student' check (owner in ('coach', 'student')),
  title      text not null check (char_length(title) between 1 and 300),
  done       boolean not null default false,
  done_at    timestamptz,
  -- Author's ordering, since these are a checklist and not a set.
  position   smallint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists session_actions_session_idx
  on public.session_actions (session_id, position);

-- Open items across everyone, which is the query the follow-up view is built
-- around. Partial, so it stays small as completed work accumulates.
create index if not exists session_actions_open_idx
  on public.session_actions (session_id) where not done;

alter table public.mentoring_sessions enable row level security;
alter table public.session_actions    enable row level security;

-- Admin-only, all four commands. These are the coach's private notes about a
-- client: students must not read them, which is why there is deliberately no
-- "own rows" policy here the way lesson_progress has one.
create policy "mentoring_sessions_admin_all"
  on public.mentoring_sessions for all to authenticated
  using      ( private.is_admin() )
  with check ( private.is_admin() );

create policy "session_actions_admin_all"
  on public.session_actions for all to authenticated
  using      ( private.is_admin() )
  with check ( private.is_admin() );

-- FOR ALL needs both clauses: USING alone gates which rows you may touch but
-- lets an UPDATE rewrite one into a shape you could no longer select.
revoke all on public.mentoring_sessions from anon, authenticated;
revoke all on public.session_actions    from anon, authenticated;
grant select, insert, update, delete on public.mentoring_sessions to authenticated;
grant select, insert, update, delete on public.session_actions    to authenticated;

create or replace function private.touch_mentoring_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function private.touch_mentoring_session() from public, anon, authenticated;

drop trigger if exists mentoring_sessions_touch on public.mentoring_sessions;
create trigger mentoring_sessions_touch
  before update on public.mentoring_sessions
  for each row execute function private.touch_mentoring_session();
