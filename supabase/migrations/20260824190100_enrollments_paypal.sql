-- Polar rejected the account on 2026-08-19: "The product includes 1:1 video
-- sessions and live group sessions, which makes it a coaching/consulting
-- service rather than a pure digital product. Human services are not
-- eligible." That is not a Polar quirk -- Paddle bans "pure consulting or
-- advisory services, including coaching" and Lemon Squeezy bans "services of
-- any kind". The 4 private sessions ARE the offer, so no merchant of record
-- will take it and there is no point shopping for another one.
--
-- So the first cohort is invoiced by hand (PayPal, one-time) and activated by
-- hand. This widens the provider whitelist so that payment can be recorded as
-- evidence instead of living as an unexplained UPDATE on profiles.role that
-- nobody can account for in three months.
--
-- Still a whitelist, not free text: `provider` picks which webhook wrote the
-- row, and an unknown value would mean nobody did.
alter table public.enrollments
  drop constraint if exists enrollments_provider_check;

alter table public.enrollments
  add constraint enrollments_provider_check
  check (provider in ('polar', 'paypal'));

-- A manual enrollment has no webhook behind it, so the columns that a webhook
-- would fill stay null and `provider_reference` carries the invoice id. It is
-- unique per provider, which is what stops the same invoice being recorded
-- twice on a second attempt.
comment on column public.enrollments.provider is
  '''polar'' = written by the Polar webhook. ''paypal'' = manual invoice, '
  'recorded by hand; provider_reference is the PayPal invoice id and there is '
  'no webhook to renew it -- kind must be ''one_time''.';
