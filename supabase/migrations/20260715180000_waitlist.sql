-- Waitlist signups for the AI Shift Challenge — the top of the funnel, and the
-- source of truth for who asked to be told when the cohort opens.
--
-- RECONSTRUCTED 2026-08-19. This table was originally created outside the repo,
-- so `supabase/migrations/` never contained it even though 20260715190000_profiles
-- already depends on it. That gap made the schema impossible to rebuild from
-- scratch. Reconstructed from: the live PostgREST schema, the columns
-- /api/waitlist writes, and what the later migrations assume about it.
--
-- Ordered BEFORE profiles on purpose: profiles.waitlist_id carries a foreign key
-- to this table, so it has to exist first.

create table if not exists public.waitlist (
  id     uuid primary key default gen_random_uuid(),
  -- UNIQUE is load-bearing, not decorative: /api/waitlist posts with
  -- `on_conflict=email` + `resolution=ignore-duplicates`, and reads the empty
  -- response to know a repeat signup must NOT get a second welcome email.
  -- Without the constraint that request errors instead of deduping.
  email  text not null unique,
  -- Which language to greet them in. Checked rather than free text because
  -- handle_new_user() copies it straight into profiles.locale, which is itself
  -- constrained to the same two values.
  locale text not null default 'en' check (locale in ('en', 'es')),
  -- Referer path of the form that captured them, for attribution. Nullable:
  -- direct hits and stripped referers are normal, not errors.
  source text,
  -- Stamped once the welcome email actually goes out, so a failed send can be
  -- retried later without double-sending the successes.
  -- See scripts/backfill-welcome-emails.ts.
  welcome_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- full_name is added by 20260715210000_waitlist_full_name, not here: keeping the
-- reconstruction faithful to the real history means a fresh database goes
-- through the same states the production one did.

comment on table public.waitlist is
  'AI Shift Challenge signups. Server-only: every write goes through '
  '/api/waitlist with the secret key. Admins can read it via the '
  'waitlist_select_admin policy added in the admin_role migration.';

create index if not exists waitlist_created_idx
  on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- No policies and no grants here by design — this table holds the email
-- addresses of people who never created an account, so nothing signed-in may
-- read it. RLS with zero policies denies everyone; the secret key bypasses RLS,
-- which is how /api/waitlist writes. 20260726120000_admin_role later opens a
-- read path for the owner alone.
revoke all on public.waitlist from anon, authenticated;
