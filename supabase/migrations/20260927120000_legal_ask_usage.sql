-- NEXULEX AI — WAVE LR.3: server-side daily quota for the legal-ask edge function.
-- Stores only a per-user daily counter. Question and answer text are never stored on the server.
-- Apply: supabase db push   (or paste into the SQL Editor)

create table if not exists public.legal_ask_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default ((now() at time zone 'utc')::date),
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

alter table public.legal_ask_usage enable row level security;

-- Users may read their own counters; nobody writes directly (no insert/update/delete policies).
drop policy if exists "legal_ask_usage_select_own" on public.legal_ask_usage;
create policy "legal_ask_usage_select_own" on public.legal_ask_usage
  for select using (auth.uid() = user_id);

-- Atomically consumes one question for today (UTC) if the user is under p_limit.
create or replace function public.consume_legal_ask(p_user uuid, p_limit integer)
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

  insert into public.legal_ask_usage as u (user_id, day, used)
  values (p_user, v_day, 1)
  on conflict (user_id, day) do update
     set used = u.used + 1,
         updated_at = now()
   where u.used < p_limit
  returning u.used into v_used;

  if v_used is null then
    select u.used into v_used
      from public.legal_ask_usage u
     where u.user_id = p_user and u.day = v_day;
    return jsonb_build_object('allowed', false, 'used', coalesce(v_used, p_limit), 'limit', p_limit);
  end if;

  return jsonb_build_object('allowed', true, 'used', v_used, 'limit', p_limit);
end;
$$;

-- Gives today's question back when the AI call failed after the quota was consumed.
create or replace function public.refund_legal_ask(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.legal_ask_usage u
     set used = greatest(u.used - 1, 0),
         updated_at = now()
   where u.user_id = p_user
     and u.day = (now() at time zone 'utc')::date;
end;
$$;

-- Read-only counter for the app's "questions left today" line.
create or replace function public.legal_ask_used_today(p_user uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select u.used from public.legal_ask_usage u
      where u.user_id = p_user and u.day = (now() at time zone 'utc')::date),
    0
  );
$$;

-- Only the edge function (service role) may call these; the user id always comes from the verified JWT there.
revoke all on function public.consume_legal_ask(uuid, integer) from public, anon, authenticated;
revoke all on function public.refund_legal_ask(uuid) from public, anon, authenticated;
revoke all on function public.legal_ask_used_today(uuid) from public, anon, authenticated;
grant execute on function public.consume_legal_ask(uuid, integer) to service_role;
grant execute on function public.refund_legal_ask(uuid) to service_role;
grant execute on function public.legal_ask_used_today(uuid) to service_role;

-- Old counters are useless after the day ends.
create index if not exists legal_ask_usage_day_idx on public.legal_ask_usage (day);
