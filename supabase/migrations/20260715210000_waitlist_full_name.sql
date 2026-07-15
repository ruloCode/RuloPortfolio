-- Ask for the name at signup so the welcome email and the dashboard can use it.
--
-- Nullable on purpose: rows that predate this column stay valid, and every
-- consumer already falls back to the email's local part.

alter table public.waitlist
  add column if not exists full_name text;

comment on column public.waitlist.full_name is
  'Display name given at signup. Free text, may be null for older rows.';

-- Carry it into the profile at signup. raw_user_meta_data is user-controlled,
-- so it is used for display only — never for authorization.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_waitlist public.waitlist%rowtype;
  v_locale   text;
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

  insert into public.profiles (id, email, role, locale, full_name, waitlist_id)
  values (
    new.id,
    new.email,
    'waitlist',
    v_locale,
    -- Prefer what they typed at signup; fall back to the auth metadata.
    coalesce(
      nullif(v_waitlist.full_name, ''),
      nullif(new.raw_user_meta_data ->> 'full_name', '')
    ),
    v_waitlist.id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

-- Existing accounts: adopt the name if the waitlist has one and the profile
-- doesn't.
update public.profiles p
set full_name = w.full_name
from public.waitlist w
where lower(w.email) = lower(p.email)
  and p.full_name is null
  and nullif(w.full_name, '') is not null;
