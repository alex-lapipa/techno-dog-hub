-- Add scheduled job for API Guardian agent (runs every 6 hours)
SELECT cron.schedule(
  'api-guardian-audit',
  '0 */6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://bshyeweljerupobpmmes.supabase.co/functions/v1/api-guardian',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
  $$
);