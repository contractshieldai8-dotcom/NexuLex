-- NEXULEX AI - WAVE ECON.3: per-user daily call cap for the analyze-contract function.
-- That function is the app's most expensive AI path (images / PDF / long output) and used to have no server-side limit:
-- any signed-in account could call it directly, as often as it liked. The cap is an ABUSE BACKSTOP, not a product quota:
-- one contract analysis is several calls (OCR batches, the analysis itself, a continuation), so the limits are generous.
-- Only a user id, a UTC day and a counter are stored. Contract text and AI output are never stored or logged.
-- Apply: supabase db push   (before deploying the analyze-contract function that calls these)

create table if not exists public.analyze_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  calls integer not null default 0 check (calls >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.analyze_usage enable row level security;
revoke all on table public.analyze_usage from public, anon, authenticated;

create index if not exists analyze_usage_day_idx on public.analyze_usage (day);

-- Counts one call and says whether it may go ahead. Atomic per user (advisory lock), like consume_pro_tool_v2.
create or replace function public.consume_analyze_call(p_user uuid, p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_used integer;
begin
  if p_user is null or p_limit is null or p_limit < 1 then
    raise exception 'INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('analyze_user:' || p_user::text, 0));

  select u.calls into v_used
    from public.analyze_usage u
   where u.user_id = p_user and u.day = v_today;
  v_used := coalesce(v_used, 0);

  if v_used >= p_limit then
    return jsonb_build_object('allowed', false, 'used', v_used, 'limit', p_limit);
  end if;

  insert into public.analyze_usage as u (user_id, day, calls)
  values (p_user, v_today, 1)
  on conflict (user_id, day) do update
     set calls = u.calls + 1,
         updated_at = now();

  return jsonb_build_object('allowed', true, 'used', v_used + 1, 'limit', p_limit);
end;
$$;

-- Gives a call back when the upstream model refused it (nothing was billed). Never goes below zero.
create or replace function public.refund_analyze_call(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.analyze_usage u
     set calls = greatest(u.calls - 1, 0),
         updated_at = now()
   where u.user_id = p_user
     and u.day = (now() at time zone 'utc')::date;
end;
$$;

revoke all on function public.consume_analyze_call(uuid, integer) from public, anon, authenticated;
revoke all on function public.refund_analyze_call(uuid) from public, anon, authenticated;
grant execute on function public.consume_analyze_call(uuid, integer) to service_role;
grant execute on function public.refund_analyze_call(uuid) to service_role;
