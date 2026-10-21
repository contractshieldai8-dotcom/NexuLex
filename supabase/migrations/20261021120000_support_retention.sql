-- Retention enforcement for the published Privacy Policy (section 17 "Retention periods").
--   * Support messages are kept at most 24 months.
--   * Anonymous usage and error reports are kept at most 180 days (purge_old_app_events already exists).
-- The functions below only delete rows; they are callable by service_role only.

create or replace function public.purge_old_support_messages(p_months integer default 24)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  -- Never shorter than 12 months by accident; the policy promises "at most 24 months".
  delete from public.support_messages
  where created_at < now() - make_interval(months => greatest(p_months, 12));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_old_support_messages(integer) from public, anon, authenticated;
grant execute on function public.purge_old_support_messages(integer) to service_role;

-- Schedule both purges daily when pg_cron is enabled (Supabase: Database -> Extensions -> pg_cron).
-- If pg_cron is not enabled this block does nothing; enable it and re-run, or call the functions from a cron job.
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule(jobid) from cron.job where jobname in ('nexulex-purge-support-messages', 'nexulex-purge-app-events');
    perform cron.schedule('nexulex-purge-support-messages', '17 3 * * *', 'select public.purge_old_support_messages(24)');
    perform cron.schedule('nexulex-purge-app-events', '27 3 * * *', 'select public.purge_old_app_events(180)');
  end if;
end
$$;
