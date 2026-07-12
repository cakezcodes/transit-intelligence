-- Phase D step 2: schedule the daily sky snapshot.
-- pg_cron fires at 00:10 UTC and pg_net POSTs to the sky-snapshot edge
-- function, which writes 12 rows to sky_positions (idempotent upsert).
-- The bearer token is the project's public anon key (verify_jwt gate only;
-- the function writes with its own service-role env).

create extension if not exists pg_cron;
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'sky-snapshot-daily') then
    perform cron.unschedule('sky-snapshot-daily');
  end if;
end
$$;

select cron.schedule(
  'sky-snapshot-daily',
  '10 0 * * *',
  $$
  select net.http_post(
    url := 'https://lfukxvbcfetdzbauigxe.supabase.co/functions/v1/sky-snapshot',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmdWt4dmJjZmV0ZHpiYXVpZ3hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MzA2NzYsImV4cCI6MjA5ODAwNjY3Nn0.W46BcSTYy8gw0b3D8jSliCaK8KyDuK81N4vmgGMLRvs'
    ),
    body := '{}'::jsonb
  );
  $$
);
