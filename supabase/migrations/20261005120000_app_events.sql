-- NEXULEX AI — WAVE G: anonymous product events + error reports.
-- No user id, no email, no contract text. `install_id` is a random value created on the device
-- (not a hardware id) and is never linked to an account. Rows are written only by the `log-event`
-- edge function (service role). Nobody can read or write this table from the app.
-- Apply: supabase db push   (or paste into the SQL Editor)

create table if not exists public.app_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  day date not null default ((now() at time zone 'utc')::date),
  install_id text not null check (install_id ~ '^[a-f0-9]{16,64}$'),
  event text not null check (char_length(event) between 2 and 40),
  props jsonb not null default '{}'::jsonb,
  app_version text,
  platform text,
  lang text
);

alter table public.app_events enable row level security;
-- Deliberately no policies: anon and authenticated users cannot select, insert, update or delete.
revoke all on table public.app_events from public, anon, authenticated;

create index if not exists app_events_day_event_idx on public.app_events (day, event);
create index if not exists app_events_install_day_idx on public.app_events (install_id, day);

-- Daily funnel counts (events and distinct installs). Read it from the SQL Editor / dashboard.
create or replace view public.app_funnel_daily as
select day, event, count(*) as events, count(distinct install_id) as installs
  from public.app_events
 group by day, event;
revoke all on public.app_funnel_daily from public, anon, authenticated;

-- Day-N retention by install cohort (first day an install was seen).
create or replace view public.app_retention_daily as
with first_seen as (
  select install_id, min(day) as cohort from public.app_events group by install_id
)
select f.cohort,
       (e.day - f.cohort) as day_n,
       count(distinct e.install_id) as installs
  from first_seen f
  join public.app_events e on e.install_id = f.install_id
 group by f.cohort, (e.day - f.cohort);
revoke all on public.app_retention_daily from public, anon, authenticated;

-- Keeps the table small: raw events older than p_days are removed. Schedule with pg_cron if available.
create or replace function public.purge_old_app_events(p_days integer default 180)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.app_events where created_at < now() - make_interval(days => greatest(p_days, 30));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
revoke all on function public.purge_old_app_events(integer) from public, anon, authenticated;
grant execute on function public.purge_old_app_events(integer) to service_role;
