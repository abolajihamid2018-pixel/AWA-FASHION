-- CareRoute AI — appointment reminder emails (day before + 1 hour before), Africa/Lagos time.
-- A pg_cron job calls the send-notification Edge Function every 5 minutes with a secret
-- stored in Supabase Vault; the function claims due reminders here and emails them.

create extension if not exists pg_cron;
create extension if not exists pg_net;

alter table public.requests
  add column reminder_day_sent_at  timestamptz,
  add column reminder_hour_sent_at timestamptz;

grant select (reminder_day_sent_at, reminder_hour_sent_at) on public.requests to authenticated;

-- Secret shared by the cron job and the Edge Function (never exposed to the browser).
select vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'careroute_cron_secret',
                           'Authorises the CareRoute reminder cron call');

create function public.check_cron_secret(p_secret text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(p_secret = (select decrypted_secret from vault.decrypted_secrets where name = 'careroute_cron_secret'), false);
$$;
revoke all on function public.check_cron_secret(text) from public, anon, authenticated;
grant execute on function public.check_cron_secret(text) to service_role;

-- Atomically marks due reminders as sent and returns them (so each is sent once).
create function public.claim_due_reminders()
returns table (request_id uuid, kind text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  return query
  with appts as (
    select r.id,
           ((r.preferred_date + r.appointment_time) at time zone 'Africa/Lagos') as appt_at,
           r.reminder_day_sent_at, r.reminder_hour_sent_at, r.updated_at
    from public.requests r
    where r.status = 'approved' and r.appointment_time is not null and r.preferred_date is not null
  ),
  hour_due as (
    update public.requests r set reminder_hour_sent_at = now()
    from appts a
    where r.id = a.id and a.reminder_hour_sent_at is null
      and now() >= a.appt_at - interval '1 hour' and now() < a.appt_at
    returning r.id, 'hour'::text as kind
  ),
  day_due as (
    update public.requests r set reminder_day_sent_at = now()
    from appts a
    where r.id = a.id and a.reminder_day_sent_at is null
      and now() >= a.appt_at - interval '24 hours' and now() < a.appt_at - interval '1 hour'
      and a.updated_at < now() - interval '30 minutes'   -- don't follow the approval email immediately
    returning r.id, 'day'::text as kind
  )
  select * from hour_due union all select * from day_due;
end;
$$;
revoke all on function public.claim_due_reminders() from public, anon, authenticated;
grant execute on function public.claim_due_reminders() to service_role;

-- Every 5 minutes.
select cron.schedule(
  'careroute-reminders',
  '*/5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://gqusrnpziawyzglrkiga.supabase.co/functions/v1/send-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'careroute_cron_secret')
    ),
    body := '{"mode":"reminders"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $cron$
);
