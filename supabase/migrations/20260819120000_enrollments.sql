-- Paid enrollments: the auditable record of who paid, through which provider,
-- and what they are entitled to. `profiles.role` stays the authorization
-- source of truth — this table is the evidence that justifies it.
--
-- IDENTITY IS THE EMAIL, with user_id attached when known — the same call
-- mentoring_sessions made, for the same reason: someone can pay before they
-- ever create an account, and handle_new_user() must find that payment the
-- day they sign up. externalCustomerId on the Polar checkout carries the
-- user_id for buyers who were logged in, so the common case never has to
-- guess.
--
-- RECURRING: one row per subscription (provider_reference = subscription id).
-- Polar renewals update the SAME row via webhook — a new row per payment
-- would make "is she still entitled?" a MAX() query over duplicates.

create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null check (provider in ('polar')),
  -- Subscription id for kind='subscription', order id for kind='one_time'.
  -- unique(provider, provider_reference) is what makes webhook retries
  -- idempotent: Polar delivers at-least-once, so replays are upserts.
  provider_reference text not null,
  kind         text not null default 'subscription' check (kind in ('subscription', 'one_time')),
  -- Lowercased at the boundary AND enforced here: two rows differing only by
  -- case would split one person's payment history into two timelines.
  person_email text not null check (person_email = lower(person_email) and person_email <> ''),
  -- Nullable on purpose: payment can precede the account. Filled from
  -- Polar's externalCustomerId when the buyer was logged in, or by
  -- handle_new_user() when the account is created afterwards.
  user_id      uuid references auth.users (id) on delete set null,
  product_id   text,
  -- Mirrors the provider's status verbatim ('active', 'canceled', 'revoked',
  -- 'paid', ...). The entitled check below is the ONLY place that interprets
  -- it, so a new provider status fails closed (not entitled) until added.
  status       text not null,
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  currency     text,
  -- 'canceled' means "won't renew but still entitled until this instant".
  -- Null for one_time: a paid one-time enrollment never expires.
  current_period_end timestamptz,
  raw_payload  jsonb,
  paid_at      timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (provider, provider_reference)
);

create index if not exists enrollments_person_idx
  on public.enrollments (person_email);

create index if not exists enrollments_user_idx
  on public.enrollments (user_id) where user_id is not null;

-- The single entitlement rule, shared by the signup trigger below and
-- mirrored by the webhook's role sync. 'canceled' still counts: Polar keeps
-- access until the end of the paid period, and the period-end guard is what
-- expires it. 'past_due' counts as a grace window while dunning runs.
create or replace function private.is_entitled(
  p_status text,
  p_current_period_end timestamptz
)
returns boolean
language sql
-- STABLE, not IMMUTABLE: the body reads now(). IMMUTABLE would license the
-- planner to evaluate this once for constant arguments and reuse the result
-- across executions of a prepared statement — an entitlement that expires
-- mid-session would keep answering true from a cached plan. STABLE is the
-- honest contract: fixed within a statement, re-read on the next one.
stable
set search_path = ''
as $$
  select p_status in ('paid', 'active', 'trialing', 'past_due', 'canceled')
     and (p_current_period_end is null or p_current_period_end > now());
$$;

comment on function private.is_entitled(text, timestamptz) is
  'Single place that decides whether an enrollment status grants access. '
  'Fails closed: an unrecognized status is NOT entitled.';

alter table public.enrollments enable row level security;

-- Buyers can see their own payment record; nothing else. All writes go
-- through the webhook with the secret key (RLS-bypassed), so there is
-- deliberately no insert/update/delete policy and no write grant.
create policy "enrollments_select_own"
  on public.enrollments for select to authenticated
  using ( (select auth.uid()) = user_id );

create policy "enrollments_select_admin"
  on public.enrollments for select to authenticated
  using ( private.is_admin() );

revoke all on public.enrollments from anon, authenticated;
grant select on public.enrollments to authenticated;

-- Signup after payment: if a paid enrollment is waiting under this email,
-- the account starts as 'student' instead of landing in 'waitlist' and
-- having to be promoted by hand.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_waitlist public.waitlist%rowtype;
  v_locale   text;
  v_role     text := 'waitlist';
begin
  select * into v_waitlist
  from public.waitlist
  where lower(email) = lower(new.email)
  limit 1;

  v_locale := coalesce(
    nullif(new.raw_user_meta_data ->> 'locale', ''),
    v_waitlist.locale,
    'en'
  );
  if v_locale not in ('en', 'es') then
    v_locale := 'en';
  end if;

  -- A paid enrollment under this email means the account arrives entitled.
  -- Distinct from the waitlist path: payment is a stronger signal than a
  -- signup form, and it is checked in a table users cannot write to.
  if exists (
    select 1
    from public.enrollments e
    where e.person_email = lower(new.email)
      and private.is_entitled(e.status, e.current_period_end)
  ) then
    v_role := 'student';
  end if;

  insert into public.profiles (id, email, role, locale, full_name, waitlist_id)
  values (
    new.id,
    new.email,
    v_role,
    v_locale,
    coalesce(
      nullif(v_waitlist.full_name, ''),
      nullif(new.raw_user_meta_data ->> 'full_name', '')
    ),
    v_waitlist.id
  )
  on conflict (id) do nothing;

  -- Attach the dangling payment(s) to the account that just showed up.
  update public.enrollments
  set user_id = new.id, updated_at = now()
  where person_email = lower(new.email)
    and user_id is null;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create or replace function private.touch_enrollment()
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

revoke execute on function private.touch_enrollment() from public, anon, authenticated;

drop trigger if exists enrollments_touch on public.enrollments;
create trigger enrollments_touch
  before update on public.enrollments
  for each row execute function private.touch_enrollment();
