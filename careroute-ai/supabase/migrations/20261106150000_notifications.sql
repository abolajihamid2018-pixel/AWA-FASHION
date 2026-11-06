-- CareRoute AI — milestone 4: track patient email notifications per event.
-- notified_at set  + notify_error null  => email sent
-- notified_at null + notify_error set   => sending failed / not configured (can be retried)
alter table public.request_events
  add column notified_at  timestamptz,
  add column notify_error text;
