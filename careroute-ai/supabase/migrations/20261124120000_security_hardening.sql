-- CareRoute AI — security hardening
-- 1. Rate limits per device (IP, stored only as a hash) and site-wide, not just per email.
-- 2. Names may not contain links, @, slashes, digits or markup (stops phishing text in emails).

alter table public.requests add column client_ip_hash text;
create index requests_ip_created_idx on public.requests (client_ip_hash, created_at desc);
create index requests_created_idx on public.requests (created_at desc);

create or replace function public.submit_request(
  p_service_id     uuid,
  p_name           text,
  p_email          text,
  p_phone          text,
  p_preferred_date date,
  p_preferred_time text,
  p_enquiry        text,
  p_consent        boolean
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_service    public.services%rowtype;
  v_name       text := nullif(btrim(coalesce(p_name, '')), '');
  v_email      text := lower(nullif(btrim(coalesce(p_email, '')), ''));
  v_phone      text := nullif(btrim(coalesce(p_phone, '')), '');
  v_enquiry    text := nullif(btrim(coalesce(p_enquiry, '')), '');
  v_time       text := coalesce(nullif(btrim(coalesce(p_preferred_time, '')), ''), 'any');
  v_headers    jsonb := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::jsonb;
  v_ip         text;
  v_ip_hash    text;
  v_token      text;
  v_reference  text;
  v_request_id uuid;
begin
  if p_consent is distinct from true then
    raise exception 'consent_required';
  end if;

  select * into v_service from public.services where id = p_service_id and is_active;
  if not found then
    raise exception 'invalid_service';
  end if;

  -- Names only: no links, emails, paths, digits or markup (they appear in outgoing emails).
  if v_name is null or char_length(v_name) not between 2 and 100
     or v_name ~* '(https?|www\.|\.(com|net|org|ng|io|ly|xyz|info)\M|[@/\\<>:;{}\[\]=_|~^$#%*+0-9])' then
    raise exception 'invalid_name';
  end if;

  if v_email is null or char_length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid_email';
  end if;

  if v_phone is not null and (char_length(v_phone) > 30 or v_phone !~ '^[0-9+()\-. ]{6,30}$') then
    raise exception 'invalid_phone';
  end if;

  if v_time not in ('morning', 'afternoon', 'any') then
    raise exception 'invalid_time';
  end if;

  if v_service.kind = 'appointment' and p_preferred_date is null then
    raise exception 'date_required';
  end if;

  if p_preferred_date is not null
     and (p_preferred_date < current_date or p_preferred_date > current_date + 180) then
    raise exception 'invalid_date';
  end if;

  if v_enquiry is not null and char_length(v_enquiry) > 500 then
    raise exception 'enquiry_too_long';
  end if;

  -- Abuse guards: per email, per device and site-wide.
  v_ip := coalesce(v_headers->>'cf-connecting-ip', split_part(v_headers->>'x-forwarded-for', ',', 1));
  if nullif(btrim(v_ip), '') is not null then
    v_ip_hash := encode(extensions.digest('careroute:' || btrim(v_ip), 'sha256'), 'hex');
  end if;

  if (select count(*) from public.requests
      where lower(patient_email) = v_email and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;
  if v_ip_hash is not null and (select count(*) from public.requests
      where client_ip_hash = v_ip_hash and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited';
  end if;
  if (select count(*) from public.requests where created_at > now() - interval '1 hour') >= 200 then
    raise exception 'busy';
  end if;

  v_token     := encode(extensions.gen_random_bytes(24), 'hex');
  v_reference := private.generate_reference_code();

  insert into public.requests (
    reference_code, status_token_hash, service_id, patient_name, patient_email,
    patient_phone, preferred_date, preferred_time, enquiry, client_ip_hash
  ) values (
    v_reference, encode(extensions.digest(v_token, 'sha256'), 'hex'), v_service.id, v_name, v_email,
    v_phone, p_preferred_date, v_time, v_enquiry, v_ip_hash
  )
  returning id into v_request_id;

  insert into public.request_events (request_id, event_type, to_status)
  values (v_request_id, 'created', 'submitted');

  return jsonb_build_object('reference_code', v_reference, 'status_token', v_token);
end;
$$;

revoke all on function public.submit_request(uuid, text, text, text, date, text, text, boolean) from public;
grant execute on function public.submit_request(uuid, text, text, text, date, text, text, boolean) to anon, authenticated;

-- Staff never need the device hash.
revoke select on public.requests from authenticated;
grant select (
  id, reference_code, service_id, patient_name, patient_email, patient_phone, preferred_date, preferred_time,
  appointment_time, enquiry, status, ai_status, ai_summary, ai_suggested_service_id, ai_confidence,
  ai_needs_review, ai_reason, ai_error, ai_processed_at, created_at, updated_at
) on public.requests to authenticated;
