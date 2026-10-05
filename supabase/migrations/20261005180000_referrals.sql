-- NEXULEX AI — WAVE J: "give 1, get 1" invite codes.
-- A signed-in user has one short invite code. A friend who signs up and enters it (within 7 days of
-- creating the account, e-mail verified) gets +1 free analysis, and so does the inviter (up to 5 times).
-- Nothing about contracts is stored here. Only the two account ids, the friend's device id (to stop one
-- device from collecting the bonus again) and timestamps.
-- Apply: supabase db push   (or paste into the SQL Editor)

create table if not exists public.referral_codes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  code text not null unique check (code ~ '^[A-HJKMNP-Z2-9]{8}$'),
  created_at timestamptz not null default now()
);

-- Kept after an account is deleted (ids become null) so the same device cannot collect the bonus again.
create table if not exists public.referral_redemptions (
  id bigint generated always as identity primary key,
  referrer_id uuid references auth.users (id) on delete set null,
  referee_id uuid references auth.users (id) on delete set null,
  referee_device text,
  referrer_rewarded boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists referral_redemptions_referee_key
  on public.referral_redemptions (referee_id) where referee_id is not null;
create unique index if not exists referral_redemptions_device_key
  on public.referral_redemptions (referee_device) where referee_device is not null;
create index if not exists referral_redemptions_referrer_idx
  on public.referral_redemptions (referrer_id) where referrer_id is not null;

alter table public.referral_codes enable row level security;
alter table public.referral_redemptions enable row level security;
-- Deliberately no policies: the app only talks to the two SECURITY DEFINER functions below.
revoke all on table public.referral_codes from public, anon, authenticated;
revoke all on table public.referral_redemptions from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_my_referral(): returns {code, rewards, cap, redeemed}. Creates the code on first call.
-- ---------------------------------------------------------------------------
create or replace function public.get_my_referral()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_code text;
  v_rewards integer;
  v_redeemed boolean;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select code into v_code from public.referral_codes where user_id = v_user;

  if v_code is null then
    for i in 1..6 loop
      begin
        insert into public.referral_codes (user_id, code)
        values (
          v_user,
          (select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', 1 + floor(random() * 31)::int, 1), '')
             from generate_series(1, 8))
        )
        on conflict (user_id) do nothing;
        exit;
      exception when unique_violation then
        null; -- code collision: try another one
      end;
    end loop;
    select code into v_code from public.referral_codes where user_id = v_user;
  end if;

  select count(*) into v_rewards
    from public.referral_redemptions
   where referrer_id = v_user and referrer_rewarded;

  select exists (select 1 from public.referral_redemptions where referee_id = v_user)
    into v_redeemed;

  return jsonb_build_object('code', v_code, 'rewards', v_rewards, 'cap', 5, 'redeemed', v_redeemed);
end;
$$;

revoke all on function public.get_my_referral() from public;
grant execute on function public.get_my_referral() to authenticated;

-- ---------------------------------------------------------------------------
-- redeem_referral(p_code): friend enters an invite code. Returns {ok, left}.
-- Errors: NOT_AUTHENTICATED, EMAIL_NOT_VERIFIED, CODE_WINDOW_CLOSED, ALREADY_REDEEMED,
--         INVALID_CODE, SELF_REFERRAL, SAME_DEVICE, DEVICE_USED, NO_PROFILE
-- ---------------------------------------------------------------------------
create or replace function public.redeem_referral(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  v_verified boolean;
  v_created timestamptz;
  v_referrer uuid;
  v_device text;
  v_referrer_device text;
  v_rewards integer;
  v_reward_referrer boolean;
  v_left integer;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select (u.email_confirmed_at is not null), u.created_at
    into v_verified, v_created
    from auth.users u
   where u.id = v_user;

  if not coalesce(v_verified, false) then
    raise exception 'EMAIL_NOT_VERIFIED';
  end if;
  if v_created < now() - interval '7 days' then
    raise exception 'CODE_WINDOW_CLOSED';
  end if;
  if exists (select 1 from public.referral_redemptions where referee_id = v_user) then
    raise exception 'ALREADY_REDEEMED';
  end if;

  select user_id into v_referrer from public.referral_codes where code = v_code;
  if v_referrer is null then
    raise exception 'INVALID_CODE';
  end if;
  if v_referrer = v_user then
    raise exception 'SELF_REFERRAL';
  end if;

  select device_id into v_device from public.profiles where id = v_user;
  select device_id into v_referrer_device from public.profiles where id = v_referrer;
  if v_device is not null and v_device = v_referrer_device then
    raise exception 'SAME_DEVICE';
  end if;
  if v_device is not null and exists (
    select 1 from public.referral_redemptions where referee_device = v_device
  ) then
    raise exception 'DEVICE_USED';
  end if;

  select count(*) into v_rewards
    from public.referral_redemptions
   where referrer_id = v_referrer and referrer_rewarded;
  v_reward_referrer := v_rewards < 5;

  update public.profiles
     set free_analyses_left = free_analyses_left + 1,
         updated_at = now()
   where id = v_user
  returning free_analyses_left into v_left;
  if v_left is null then
    raise exception 'NO_PROFILE';
  end if;

  insert into public.referral_redemptions (referrer_id, referee_id, referee_device, referrer_rewarded)
  values (v_referrer, v_user, v_device, v_reward_referrer);

  if v_reward_referrer then
    update public.profiles
       set free_analyses_left = free_analyses_left + 1,
           updated_at = now()
     where id = v_referrer;
  end if;

  return jsonb_build_object('ok', true, 'left', v_left);
end;
$$;

revoke all on function public.redeem_referral(text) from public;
grant execute on function public.redeem_referral(text) to authenticated;
