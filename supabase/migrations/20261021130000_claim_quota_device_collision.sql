-- NEXULEX AI - claim_free_quota: never fail when the device id is already stored on another profile.
--
-- Field report: a second account signing in on a device that already belongs to another profile hit
--   duplicate key value violates unique constraint "idx_unique_profiles_device_id"
-- inside claim_free_quota. The client swallowed the error (profile + quota stayed unsynced).
--
-- Fix: when another profile already holds this device id, the new profile simply does not store it.
-- Abuse prevention is unchanged: free_quota_claims (unique on device_id / phone_number) still records the
-- device, so v_already_claimed stays true and no second free grant is given. Nothing else changes.

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

  p_phone := nullif(btrim(coalesce(p_phone, '')), '');
  p_device := nullif(btrim(coalesce(p_device, '')), '');

  select u.email, (u.email_confirmed_at is not null)
    into v_email, v_verified
    from auth.users u
   where u.id = v_user;

  -- A phone number can belong to one account only.
  if p_phone is not null and exists (
    select 1 from public.profiles p where p.phone_number = p_phone and p.id <> v_user
  ) then
    raise exception 'PHONE_TAKEN';
  end if;

  select exists (
    select 1
      from public.free_quota_claims c
     where (p_device is not null and c.device_id = p_device)
        or (p_phone is not null and c.phone_number = p_phone)
  ) into v_already_claimed;

  -- profiles.device_id is unique in production (idx_unique_profiles_device_id): only store it when free.
  v_device_for_profile := p_device;
  if p_device is not null and exists (
    select 1 from public.profiles p where p.device_id = p_device and p.id <> v_user
  ) then
    v_device_for_profile := null;
  end if;

  insert into public.profiles as p (id, email, phone_number, device_id, free_analyses_left)
  values (v_user, v_email, p_phone, v_device_for_profile, 0)
  on conflict (id) do update
     set email = excluded.email,
         phone_number = coalesce(excluded.phone_number, p.phone_number),
         device_id = coalesce(excluded.device_id, p.device_id),
         updated_at = now()
  returning * into v_profile;

  -- New device + new phone + verified e-mail => 2 free analyses.
  if v_verified and not v_already_claimed then
    v_grant := 2;

    insert into public.free_quota_claims (user_id, device_id, phone_number)
    values (v_user, p_device, p_phone)
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
