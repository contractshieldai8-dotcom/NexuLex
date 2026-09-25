-- NEXULEX AI — WAVE LR.5: Professional tier, server-verified plans, Professional tool quota.
-- Apply: supabase db push   (or paste into the SQL Editor)
--
-- Plans are written only by the sync-entitlement edge function (service role), which asks RevenueCat.
-- The app can no longer write profiles directly: before this migration any signed-in user could
-- update their own is_pro / free_analyses_left because profiles_update_own had no column limits.
-- To grant a complimentary plan by hand, set plan, is_pro and plan_source = 'manual' in the dashboard;
-- manual plans are never downgraded by the sync.

alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles add column if not exists plan_source text not null default 'none';
alter table public.profiles add column if not exists plan_expires_at timestamptz;
alter table public.profiles add column if not exists plan_synced_at timestamptz;

do $$
begin
  alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'pro', 'professional'));
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.profiles add constraint profiles_plan_source_check check (plan_source in ('none', 'store', 'legacy', 'manual'));
exception when duplicate_object then null;
end $$;

-- Existing Pro rows were written by the app itself; the next sync confirms or removes them.
update public.profiles
   set plan = 'pro', plan_source = 'legacy'
 where is_pro and plan = 'free';

-- Profiles are created by claim_free_quota (security definer) and changed only by security definer
-- functions or the service role. Reads stay allowed through profiles_select_own.
revoke insert, update, delete on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- ---------------------------------------------------------------------------
-- Professional tools (chronology, issue list, research memo): daily counter only.
-- The case material and the AI output are never stored on the server.
-- ---------------------------------------------------------------------------
create table if not exists public.pro_tool_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.pro_tool_usage enable row level security;

drop policy if exists "pro_tool_usage_select_own" on public.pro_tool_usage;
create policy "pro_tool_usage_select_own" on public.pro_tool_usage
  for select using (auth.uid() = user_id);

revoke insert, update, delete on public.pro_tool_usage from anon, authenticated;

create or replace function public.consume_pro_tool(p_user uuid, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'utc')::date;
  v_used integer;
begin
  if p_user is null or p_limit is null or p_limit < 1 then
    raise exception 'INVALID';
  end if;

  insert into public.pro_tool_usage as u (user_id, day, used)
  values (p_user, v_day, 1)
  on conflict (user_id, day) do update
     set used = u.used + 1,
         updated_at = now()
   where u.used < p_limit
  returning u.used into v_used;

  if v_used is null then
    select u.used into v_used
      from public.pro_tool_usage u
     where u.user_id = p_user and u.day = v_day;
    return jsonb_build_object('allowed', false, 'used', coalesce(v_used, p_limit), 'limit', p_limit);
  end if;

  return jsonb_build_object('allowed', true, 'used', v_used, 'limit', p_limit);
end;
$$;

create or replace function public.refund_pro_tool(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.pro_tool_usage u
     set used = greatest(u.used - 1, 0),
         updated_at = now()
   where u.user_id = p_user
     and u.day = (now() at time zone 'utc')::date;
end;
$$;

create or replace function public.pro_tool_used_today(p_user uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select u.used from public.pro_tool_usage u
      where u.user_id = p_user and u.day = (now() at time zone 'utc')::date),
    0
  );
$$;

revoke all on function public.consume_pro_tool(uuid, integer) from public, anon, authenticated;
revoke all on function public.refund_pro_tool(uuid) from public, anon, authenticated;
revoke all on function public.pro_tool_used_today(uuid) from public, anon, authenticated;
grant execute on function public.consume_pro_tool(uuid, integer) to service_role;
grant execute on function public.refund_pro_tool(uuid) to service_role;
grant execute on function public.pro_tool_used_today(uuid) to service_role;

create index if not exists pro_tool_usage_day_idx on public.pro_tool_usage (day);
