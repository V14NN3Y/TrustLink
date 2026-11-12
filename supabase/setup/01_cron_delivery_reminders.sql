-- Planification du rappel automatique après livraison (fenêtre de 48h).
-- À exécuter UNE FOIS par projet Supabase, dans l'éditeur SQL, APRÈS la
-- migration 20261112200200_delivery_48h_reminders.sql.
--
-- Prérequis : extension pg_cron activée
--   Dashboard Supabase → Database → Extensions → pg_cron → Enable
-- (ou la ligne `create extension` ci-dessous, si votre rôle le permet).
--
-- Vérifier ensuite :  select * from cron.job;
--                     select * from cron.job_run_details order by start_time desc limit 10;
-- Désactiver :        select cron.unschedule('trustlink-delivery-reminders');

create extension if not exists pg_cron;

-- Re-planifie proprement si le job existe déjà (exécution toutes les 15 minutes).
select cron.unschedule(jobid) from cron.job where jobname = 'trustlink-delivery-reminders';
select cron.schedule(
  'trustlink-delivery-reminders',
  '*/15 * * * *',
  $$ select public.send_delivery_reminders(); $$
);
