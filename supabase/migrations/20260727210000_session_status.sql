-- A session is either the agenda for the next class or the record of one that
-- already happened. Without this distinction the timeline reads as history and
-- a plan sitting in it is a lie: it claims a class occurred that has not.
--
-- Action items work unchanged either way — on a planned session they are the
-- prep checklist, on a held one they are the commitments that came out of it.
-- Both should count as open work, which is why the roster badge needs no change.

alter table public.mentoring_sessions
  add column if not exists status text not null default 'held'
    check (status in ('planned', 'held'));

comment on column public.mentoring_sessions.status is
  '''planned'' = agenda for an upcoming class, ''held'' = record of one that '
  'happened. Defaults to ''held'' so every row that predates this column keeps '
  'its original meaning.';

-- The detail page always asks for one person's sessions and wants the upcoming
-- one first, so status leads the index.
drop index if exists public.mentoring_sessions_person_idx;
create index mentoring_sessions_person_idx
  on public.mentoring_sessions (person_email, status, session_date desc);
