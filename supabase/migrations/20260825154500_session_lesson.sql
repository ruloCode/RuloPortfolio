-- A session teaches a class. Until now nothing said which one, so the deck
-- lived at a URL the coach had to remember and type while a client watched.
--
-- The slug, not a foreign key: lessons are MDX files in the repo, not rows.
-- The app resolves it — an unknown slug renders no button rather than an
-- error, which is the right failure for a link that is decoration on a note.
alter table public.mentoring_sessions
  add column if not exists lesson_slug text;

comment on column public.mentoring_sessions.lesson_slug is
  'Slug of the lesson this session teaches, e.g. clase-1-tu-copiloto. Points '
  'the session card at the class and its deck. Visible to the student — it is '
  'the same class they already have access to.';

-- RETURNS TABLE is part of the signature, so adding a column means dropping
-- first: CREATE OR REPLACE refuses to change a function's return type.
drop function if exists public.my_upcoming_session();

create function public.my_upcoming_session()
returns table (
  title        text,
  session_date date,
  starts_at    timestamptz,
  meeting_url  text,
  prep_note    text,
  lesson_slug  text
)
language sql
stable
security definer
set search_path = ''
as $$
  select s.title, s.session_date, s.starts_at, s.meeting_url, s.prep_note, s.lesson_slug
  from public.mentoring_sessions s
  join public.profiles p on lower(p.email) = s.person_email
  where p.id = (select auth.uid())
    and s.status = 'planned'
    -- Bogota, not UTC: after 7pm there it is already tomorrow in UTC, and the
    -- card for today's class must not disappear during the evening.
    and s.session_date >= (now() at time zone 'America/Bogota')::date
  order by s.session_date asc, s.starts_at asc nulls last
  limit 1;
$$;

comment on function public.my_upcoming_session() is
  'The caller''s own next planned session: when, where, what to bring and '
  'which class it teaches. Deliberately omits summary and action items, which '
  'stay coach-only.';

-- Grants do not survive the drop, and Postgres hands EXECUTE to PUBLIC on
-- every new function — so both halves have to be restated.
revoke execute on function public.my_upcoming_session() from public, anon;
grant  execute on function public.my_upcoming_session() to authenticated;
