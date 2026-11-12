-- Schedules the automatic post-delivery reminder (48h window).
-- Run ONCE per Supabase project, in the SQL editor, AFTER the
-- 20261112200200_delivery_48h_reminders.sql migration.
--
-- Prerequisite: pg_cron extension enabled
--   Supabase dashboard → Database → Extensions → pg_cron → Enable
-- (or the `create extension` line below, if your role allows it).
--
-- Then check:  select * from cron.job;
--              select * from cron.job_run_details order by start_time desc limit 10;
-- Disable:     select cron.unschedule('trustlink-delivery-reminders');

create extension if not exists pg_cron;

-- Cleanly reschedules if the job already exists (runs every 15 minutes).
select cron.unschedule(jobid) from cron.job where jobname = 'trustlink-delivery-reminders';
select cron.schedule(
  'trustlink-delivery-reminders',
  '*/15 * * * *',
  $$ select public.send_delivery_reminders(); $$
);
