-- A planned session lives entirely in the coach's notes: the student cannot
-- see that a class exists, when it is, or how to join it. Three columns and
-- one function turn it into the thing that should greet a paying student the
-- moment she logs in -- cuándo, dónde y qué tener abierto.
--
-- Why not just add an "own rows" RLS policy to mentoring_sessions? Because
-- `summary` and `session_actions` are the coach's private notes ABOUT a
-- client; the admin-only policy there is deliberate, and the admin form
-- promises it in writing. This exposes the handful of fields that are hers,
-- and nothing else -- the promise stays true for everything it does not name.

alter table public.mentoring_sessions
  -- Nullable: a session logged after the fact never had a scheduled time, and
  -- session_date alone stays the truth of when it happened.
  add column if not exists starts_at   timestamptz,
  add column if not exists meeting_url text,
  add column if not exists prep_note   text;

comment on column public.mentoring_sessions.starts_at is
  'Scheduled start of a planned class, absolute. session_date remains the day '
  'it belongs to; this is what the student card renders a clock from.';

comment on column public.mentoring_sessions.prep_note is
  'Plain text, one item per line, rendered as a "have this open" checklist. '
  'THE ONLY COLUMN ON THIS TABLE THE STUDENT CAN READ -- summary and '
  'session_actions are private to the coach. Label it as visible wherever it '
  'is written.';

-- Rejected at the boundary too, but enforced here because this string ends up
-- as an href: an unchecked value is one paste away from a javascript: URL.
alter table public.mentoring_sessions
  drop constraint if exists mentoring_sessions_meeting_url_check;
alter table public.mentoring_sessions
  add constraint mentoring_sessions_meeting_url_check
  check (meeting_url is null or meeting_url ~ '^https://');

-- The student's own next class, and only the fields that are hers. SECURITY
-- DEFINER because the table's policies are admin-only by design; the
-- auth.uid() predicate below is therefore the entire gate -- it must never
-- grow a parameter, since anything the caller can pass, the caller can forge.
create or replace function public.my_upcoming_session()
returns table (
  title       text,
  session_date date,
  starts_at   timestamptz,
  meeting_url text,
  prep_note   text
)
language sql
-- STABLE: the body reads now(). Same reasoning as private.is_entitled().
stable
security definer
set search_path = ''
as $$
  select s.title, s.session_date, s.starts_at, s.meeting_url, s.prep_note
  from public.mentoring_sessions s
  join public.profiles p on lower(p.email) = s.person_email
  where p.id = (select auth.uid())
    and s.status = 'planned'
    -- Bogota, not UTC: after 7pm in Bogota it is already tomorrow in UTC, and
    -- the card for today's class must not disappear during the evening it is
    -- most likely to be looked at.
    and s.session_date >= (now() at time zone 'America/Bogota')::date
  order by s.session_date asc, s.starts_at asc nulls last
  limit 1;
$$;

comment on function public.my_upcoming_session() is
  'The caller''s own next planned session: when, where, and what to bring. '
  'Deliberately omits summary and action items, which stay coach-only.';

-- Postgres grants EXECUTE to PUBLIC on every new function, so the revoke is
-- what makes the grant below mean anything.
revoke execute on function public.my_upcoming_session() from public, anon;
grant  execute on function public.my_upcoming_session() to authenticated;
