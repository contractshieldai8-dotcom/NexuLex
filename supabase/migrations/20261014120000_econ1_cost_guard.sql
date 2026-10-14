-- NEXULEX AI — WAVE ECON.1: cost guard for the AI functions.
--   1. Free legal questions: 3 to start, then 1 per rolling 7 days, counted per DEVICE (kept after account deletion).
--   2. Paid plans: a monthly cap on top of the daily one (legal questions and Professional tools).
--   3. Cost telemetry: anonymous token totals per day / feature / plan / model. No user id, no text.
-- Question, answer and case text are never stored. Counters are kept per day (UTC); monthly totals are sums of them.
-- Apply: supabase db push   (before deploying the legal-ask and pro-tools functions that call these)

-- ---------------------------------------------------------------------------
-- Free questions, keyed by device id (or 'user:<id>' when the profile has none).
-- No foreign key on purpose: like free_quota_claims, the row survives account deletion so the free
-- allowance cannot be reset by deleting and re-creating an account on the same device.
-- ---------------------------------------------------------------------------
create table if not exists public.legal_ask_free_usage (
  subject text not null check (char_length(subject) between 1 and 200),
  day date not null default ((now() at time zone 'utc')::date),
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (subject, day)
);

alter table public.legal_ask_free_usage enable row level security;
revoke all on table public.legal_ask_free_usage from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Read-only counters for the app (through the edge function) and for the consume function below.
-- Returns day_used, month_used (this user), free_total, free_recent (last 7 UTC days) and free_next_day.
-- ---------------------------------------------------------------------------
create or replace function public.legal_ask_counters(p_user uuid, p_device text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_month date := date_trunc('month', now() at time zone 'utc')::date;
  v_subject text;
  v_day_used integer;
  v_month_used integer;
  v_free_total integer;
  v_free_recent integer;
  v_free_last date;
begin
  if p_user is null then
    raise exception 'INVALID';
  end if;
  v_subject := coalesce(nullif(btrim(coalesce(p_device, '')), ''), 'user:' || p_user::text);

  select coalesce(sum(u.used) filter (where u.day = v_today), 0)::integer,
         coalesce(sum(u.used), 0)::integer
    into v_day_used, v_month_used
    from public.legal_ask_usage u
   where u.user_id = p_user and u.day >= v_month;

  select coalesce(sum(f.used), 0)::integer,
         coalesce(sum(f.used) filter (where f.day > v_today - 7), 0)::integer,
         max(f.day) filter (where f.used > 0 and f.day > v_today - 7)
    into v_free_total, v_free_recent, v_free_last
    from public.legal_ask_free_usage f
   where f.subject = v_subject;

  return jsonb_build_object(
    'day_used', v_day_used,
    'month_used', v_month_used,
    'free_total', v_free_total,
    'free_recent', v_free_recent,
    'free_next_day', case when v_free_last is null then null else to_char(v_free_last + 7, 'YYYY-MM-DD') end
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Atomically consumes one legal question.
--   free:  allowed while the device has used fewer than p_free_lifetime questions in total, afterwards while it
--          has used fewer than p_free_weekly in the last 7 UTC days. p_daily still caps a single day.
--   paid:  allowed while today is under p_daily AND this UTC month is under p_monthly.
-- Returns the counters after the call plus allowed / reason ('DAILY' | 'MONTHLY' | 'FREE').
-- Advisory locks make concurrent calls for the same user or device wait for each other.
-- ---------------------------------------------------------------------------
create or replace function public.consume_legal_ask_v2(
  p_user uuid,
  p_device text,
  p_free boolean,
  p_daily integer,
  p_monthly integer,
  p_free_lifetime integer,
  p_free_weekly integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_subject text;
  v_counters jsonb;
  v_reason text := null;
begin
  if p_user is null or p_daily is null or p_daily < 1 then
    raise exception 'INVALID';
  end if;
  if coalesce(p_free, false) then
    if p_free_lifetime is null or p_free_lifetime < 0 or p_free_weekly is null or p_free_weekly < 0 then
      raise exception 'INVALID';
    end if;
  elsif p_monthly is null or p_monthly < 1 then
    raise exception 'INVALID';
  end if;

  v_subject := coalesce(nullif(btrim(coalesce(p_device, '')), ''), 'user:' || p_user::text);
  if coalesce(p_free, false) then
    perform pg_advisory_xact_lock(hashtextextended('legal_ask_free:' || v_subject, 0));
  end if;
  perform pg_advisory_xact_lock(hashtextextended('legal_ask_user:' || p_user::text, 0));

  v_counters := public.legal_ask_counters(p_user, p_device);

  if (v_counters->>'day_used')::integer >= p_daily then
    v_reason := 'DAILY';
  elsif coalesce(p_free, false) then
    if (v_counters->>'free_total')::integer >= p_free_lifetime
       and (v_counters->>'free_recent')::integer >= p_free_weekly then
      v_reason := 'FREE';
    end if;
  elsif (v_counters->>'month_used')::integer >= p_monthly then
    v_reason := 'MONTHLY';
  end if;

  if v_reason is null then
    insert into public.legal_ask_usage as u (user_id, day, used)
    values (p_user, v_today, 1)
    on conflict (user_id, day) do update
       set used = u.used + 1,
           updated_at = now();

    if coalesce(p_free, false) then
      insert into public.legal_ask_free_usage as f (subject, day, used)
      values (v_subject, v_today, 1)
      on conflict (subject, day) do update
         set used = f.used + 1,
             updated_at = now();
    end if;

    v_counters := public.legal_ask_counters(p_user, p_device);
  end if;

  return v_counters || jsonb_build_object('allowed', v_reason is null, 'reason', v_reason);
end;
$$;

-- Gives today's free question back when the AI call failed after it was consumed
-- (the per-user daily row is refunded by the existing refund_legal_ask).
create or replace function public.refund_legal_ask_free(p_user uuid, p_device text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_user is null then
    raise exception 'INVALID';
  end if;
  update public.legal_ask_free_usage f
     set used = greatest(f.used - 1, 0),
         updated_at = now()
   where f.subject = coalesce(nullif(btrim(coalesce(p_device, '')), ''), 'user:' || p_user::text)
     and f.day = (now() at time zone 'utc')::date;
end;
$$;

-- ---------------------------------------------------------------------------
-- Professional tools: daily AND monthly cap.
-- ---------------------------------------------------------------------------
create or replace function public.pro_tool_counters(p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_month date := date_trunc('month', now() at time zone 'utc')::date;
  v_day_used integer;
  v_month_used integer;
begin
  if p_user is null then
    raise exception 'INVALID';
  end if;
  select coalesce(sum(u.used) filter (where u.day = v_today), 0)::integer,
         coalesce(sum(u.used), 0)::integer
    into v_day_used, v_month_used
    from public.pro_tool_usage u
   where u.user_id = p_user and u.day >= v_month;
  return jsonb_build_object('day_used', v_day_used, 'month_used', v_month_used);
end;
$$;

create or replace function public.consume_pro_tool_v2(p_user uuid, p_daily integer, p_monthly integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_counters jsonb;
  v_reason text := null;
begin
  if p_user is null or p_daily is null or p_daily < 1 or p_monthly is null or p_monthly < 1 then
    raise exception 'INVALID';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('pro_tool_user:' || p_user::text, 0));
  v_counters := public.pro_tool_counters(p_user);

  if (v_counters->>'day_used')::integer >= p_daily then
    v_reason := 'DAILY';
  elsif (v_counters->>'month_used')::integer >= p_monthly then
    v_reason := 'MONTHLY';
  end if;

  if v_reason is null then
    insert into public.pro_tool_usage as u (user_id, day, used)
    values (p_user, v_today, 1)
    on conflict (user_id, day) do update
       set used = u.used + 1,
           updated_at = now();
    v_counters := public.pro_tool_counters(p_user);
  end if;

  return v_counters || jsonb_build_object('allowed', v_reason is null, 'reason', v_reason);
end;
$$;

-- ---------------------------------------------------------------------------
-- Cost telemetry: anonymous token totals. Dimensions are day, feature, plan and model only.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_cost_daily (
  day date not null default ((now() at time zone 'utc')::date),
  feature text not null check (char_length(feature) between 1 and 40),
  plan text not null check (plan in ('free', 'pro', 'professional')),
  model text not null check (char_length(model) between 1 and 80),
  calls integer not null default 0,
  input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  truncated integer not null default 0,
  failed integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (day, feature, plan, model)
);

alter table public.ai_cost_daily enable row level security;
revoke all on table public.ai_cost_daily from public, anon, authenticated;

create or replace function public.record_ai_cost(
  p_feature text,
  p_plan text,
  p_model text,
  p_input integer,
  p_output integer,
  p_truncated boolean,
  p_failed boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ai_cost_daily as c (day, feature, plan, model, calls, input_tokens, output_tokens, truncated, failed)
  values (
    (now() at time zone 'utc')::date,
    left(coalesce(p_feature, 'unknown'), 40),
    p_plan,
    left(coalesce(p_model, 'unknown'), 80),
    1,
    greatest(coalesce(p_input, 0), 0),
    greatest(coalesce(p_output, 0), 0),
    case when coalesce(p_truncated, false) then 1 else 0 end,
    case when coalesce(p_failed, false) then 1 else 0 end
  )
  on conflict (day, feature, plan, model) do update
     set calls = c.calls + 1,
         input_tokens = c.input_tokens + excluded.input_tokens,
         output_tokens = c.output_tokens + excluded.output_tokens,
         truncated = c.truncated + excluded.truncated,
         failed = c.failed + excluded.failed,
         updated_at = now();
end;
$$;

-- Monthly roll-up for the dashboard (service role / SQL editor only). Multiply by your current token prices.
create or replace view public.ai_cost_monthly as
  select date_trunc('month', day)::date as month,
         feature,
         plan,
         model,
         sum(calls)::bigint as calls,
         sum(input_tokens)::bigint as input_tokens,
         sum(output_tokens)::bigint as output_tokens,
         round(sum(input_tokens)::numeric / nullif(sum(calls), 0)) as avg_input_per_call,
         round(sum(output_tokens)::numeric / nullif(sum(calls), 0)) as avg_output_per_call,
         sum(truncated)::bigint as truncated,
         sum(failed)::bigint as failed
    from public.ai_cost_daily
   group by 1, 2, 3, 4;

revoke all on public.ai_cost_monthly from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Only the edge functions (service role) may call these; the user id always comes from the verified JWT there.
-- ---------------------------------------------------------------------------
revoke all on function public.legal_ask_counters(uuid, text) from public, anon, authenticated;
revoke all on function public.consume_legal_ask_v2(uuid, text, boolean, integer, integer, integer, integer) from public, anon, authenticated;
revoke all on function public.refund_legal_ask_free(uuid, text) from public, anon, authenticated;
revoke all on function public.pro_tool_counters(uuid) from public, anon, authenticated;
revoke all on function public.consume_pro_tool_v2(uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.record_ai_cost(text, text, text, integer, integer, boolean, boolean) from public, anon, authenticated;
grant execute on function public.legal_ask_counters(uuid, text) to service_role;
grant execute on function public.consume_legal_ask_v2(uuid, text, boolean, integer, integer, integer, integer) to service_role;
grant execute on function public.refund_legal_ask_free(uuid, text) to service_role;
grant execute on function public.pro_tool_counters(uuid) to service_role;
grant execute on function public.consume_pro_tool_v2(uuid, integer, integer) to service_role;
grant execute on function public.record_ai_cost(text, text, text, integer, integer, boolean, boolean) to service_role;
