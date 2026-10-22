-- NEXULEX AI - stop collecting phone numbers (data minimisation: GDPR Art. 5(1)(c), KVKK Art. 4).
--
-- Why: the sign-up phone number was never verified (no SMS code), so it did not stop anyone from claiming a
-- second free quota (any digits passed) while it stored personal data we did not need. The free quota is now
-- guarded by the three checks that actually hold:
--   1. a verified e-mail address (no grant before the confirmation link is opened),
--   2. one grant per device id (free_quota_claims.device_id is unique and survives account deletion),
--   3. one grant per account (a claim row for this user blocks a second grant, e.g. after a reinstall).
-- No device id => no grant (a direct RPC call without a device can no longer mint free analyses).
--
-- Compatibility: claim_free_quota keeps its (p_phone text, p_device text) signature so builds that still send
-- a phone number keep working; the value is ignored and never stored. Current builds send p_phone = null.
-- The legacy columns stay (always null) until every client build that still selects them is retired; they can be
-- dropped in a later migration.

create or replace function public.claim_free_quota(p_phone text, p_device text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_verified boolean;
  v_already_claimed boolean;
  v_device_for_profile text;
  v_grant integer := 0;
  v_profile public.profiles;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  -- p_phone is intentionally ignored (see the header): phone numbers are no longer collected.
  p_device := nullif(btrim(coalesce(p_device, '')), '');

  select u.email, (u.email_confirmed_at is not null)
    into v_email, v_verified
    from auth.users u
   where u.id = v_user;

  -- Already claimed on this device, or already claimed by this account on any device.
  select exists (
    select 1
      from public.free_quota_claims c
     where (p_device is not null and c.device_id = p_device)
        or c.user_id = v_user
  ) into v_already_claimed;

  -- profiles.device_id is unique in production (idx_unique_profiles_device_id): only store it when free.
  v_device_for_profile := p_device;
  if p_device is not null and exists (
    select 1 from public.profiles p where p.device_id = p_device and p.id <> v_user
  ) then
    v_device_for_profile := null;
  end if;

  insert into public.profiles as p (id, email, device_id, free_analyses_left)
  values (v_user, v_email, v_device_for_profile, 0)
  on conflict (id) do update
     set email = excluded.email,
         device_id = coalesce(excluded.device_id, p.device_id),
         updated_at = now()
  returning * into v_profile;

  -- Verified e-mail + a device nobody claimed yet + an account that never claimed => 2 free analyses.
  if v_verified and p_device is not null and not v_already_claimed then
    v_grant := 2;

    insert into public.free_quota_claims (user_id, device_id)
    values (v_user, p_device)
    on conflict do nothing;

    update public.profiles
       set free_analyses_left = v_grant,
           updated_at = now()
     where id = v_user
    returning * into v_profile;
  end if;

  return v_profile;
end;
$$;

revoke all on function public.claim_free_quota(text, text) from public;
grant execute on function public.claim_free_quota(text, text) to authenticated;

-- Erase every phone number that earlier builds stored, and the uniqueness indexes that only existed for it.
update public.profiles set phone_number = null where phone_number is not null;
update public.free_quota_claims set phone_number = null where phone_number is not null;
update auth.users
   set raw_user_meta_data = raw_user_meta_data - 'phone_number'
 where raw_user_meta_data ? 'phone_number';

drop index if exists public.profiles_phone_number_key;
drop index if exists public.free_quota_claims_phone_key;

comment on column public.profiles.phone_number is 'DEPRECATED: no longer collected, always null. Drop once no client build selects it.';
comment on column public.free_quota_claims.phone_number is 'DEPRECATED: no longer collected, always null. Drop once no client build selects it.';
