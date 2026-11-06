-- CareRoute AI — milestone 1 schema
-- Patients never touch tables directly: they use two SECURITY DEFINER RPCs.
-- Staff (milestone 2) read/update requests through RLS gated by public.staff.

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.request_status as enum ('submitted', 'in_review', 'approved', 'declined', 'cancelled');
create type public.ai_status as enum ('pending', 'completed', 'failed', 'skipped');
create type public.service_kind as enum ('appointment', 'administrative');

-- ---------------------------------------------------------------------------
-- Private schema for helpers (not exposed through the Data API)
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table public.services (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null,
  kind        public.service_kind not null default 'appointment',
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create table public.staff (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role         text not null default 'staff' check (role in ('staff', 'admin')),
  created_at   timestamptz not null default now()
);

create table public.requests (
  id                       uuid primary key default gen_random_uuid(),
  reference_code           text not null unique,
  status_token_hash        text not null unique,
  service_id               uuid not null references public.services (id),
  patient_name             text not null check (char_length(patient_name) between 2 and 100),
  patient_email            text not null check (char_length(patient_email) <= 254),
  patient_phone            text check (char_length(patient_phone) <= 30),
  preferred_date           date,
  preferred_time           text not null default 'any' check (preferred_time in ('morning', 'afternoon', 'any')),
  enquiry                  text check (char_length(enquiry) <= 500),
  status                   public.request_status not null default 'submitted',
  -- AI fields: written only by the server-side Edge Function (milestone 3)
  ai_status                public.ai_status not null default 'pending',
  ai_summary               text,
  ai_suggested_service_id  uuid references public.services (id),
  ai_confidence            text check (ai_confidence in ('high', 'medium', 'low')),
  ai_needs_review          boolean,
  ai_reason                text,
  ai_error                 text,
  ai_processed_at          timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index requests_status_created_idx on public.requests (status, created_at desc);
create index requests_email_created_idx on public.requests (lower(patient_email), created_at desc);
create index requests_service_idx on public.requests (service_id);
create index requests_ai_service_idx on public.requests (ai_suggested_service_id);

create table public.request_events (
  id            bigint generated always as identity primary key,
  request_id    uuid not null references public.requests (id) on delete cascade,
  event_type    text not null check (event_type in ('created', 'status_changed', 'ai_completed', 'ai_failed')),
  from_status   public.request_status,
  to_status     public.request_status,
  actor_user_id uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

create index request_events_request_idx on public.request_events (request_id, created_at);
create index request_events_actor_idx on public.request_events (actor_user_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()));
$$;
revoke all on function private.is_staff() from public;
grant execute on function private.is_staff() to authenticated;

create function private.generate_reference_code()
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I/L
  code text;
begin
  loop
    code := 'CR-';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.requests where reference_code = code);
  end loop;
  return code;
end;
$$;
revoke all on function private.generate_reference_code() from public;

-- Keeps updated_at fresh and logs every status change (with the acting staff user).
create function private.on_request_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    insert into public.request_events (request_id, event_type, from_status, to_status, actor_user_id)
    values (new.id, 'status_changed', old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;
revoke all on function private.on_request_update() from public;

create trigger requests_before_update
before update on public.requests
for each row execute function private.on_request_update();

-- ---------------------------------------------------------------------------
-- Row-Level Security + explicit grants (defence in depth)
-- ---------------------------------------------------------------------------
alter table public.services       enable row level security;
alter table public.staff          enable row level security;
alter table public.requests       enable row level security;
alter table public.request_events enable row level security;

revoke all on public.services, public.staff, public.requests, public.request_events from anon, authenticated;

-- services: anyone can read active services; staff can also see inactive ones
grant select on public.services to anon, authenticated;
create policy "Anyone can view active services" on public.services
  for select to anon using (is_active);
create policy "Authenticated users view active services, staff view all" on public.services
  for select to authenticated using (is_active or (select private.is_staff()));

-- staff: a signed-in user can see only their own staff row
grant select on public.staff to authenticated;
create policy "Users can view their own staff row" on public.staff
  for select to authenticated using (user_id = (select auth.uid()));

-- requests: staff only. Patients have no table access at all.
grant select on public.requests to authenticated;
grant update (status) on public.requests to authenticated;
create policy "Staff can view requests" on public.requests
  for select to authenticated using ((select private.is_staff()));
create policy "Staff can update request status" on public.requests
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- request_events: staff read-only (rows are written by trigger / RPC)
grant select on public.request_events to authenticated;
create policy "Staff can view request events" on public.request_events
  for select to authenticated using ((select private.is_staff()));

-- ---------------------------------------------------------------------------
-- Patient RPCs
-- ---------------------------------------------------------------------------

-- Validates and saves a request. Returns the reference code and a one-time
-- status token (only its SHA-256 hash is stored).
create function public.submit_request(
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

  if v_name is null or char_length(v_name) not between 2 and 100 then
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

  -- Simple abuse guard for a no-login form
  if (select count(*) from public.requests
      where lower(patient_email) = v_email and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited';
  end if;

  v_token     := encode(extensions.gen_random_bytes(24), 'hex');
  v_reference := private.generate_reference_code();

  insert into public.requests (
    reference_code, status_token_hash, service_id, patient_name, patient_email,
    patient_phone, preferred_date, preferred_time, enquiry
  ) values (
    v_reference, encode(extensions.digest(v_token, 'sha256'), 'hex'), v_service.id, v_name, v_email,
    v_phone, p_preferred_date, v_time, v_enquiry
  )
  returning id into v_request_id;

  insert into public.request_events (request_id, event_type, to_status)
  values (v_request_id, 'created', 'submitted');

  return jsonb_build_object('reference_code', v_reference, 'status_token', v_token);
end;
$$;

-- Returns minimal, non-identifying status info for the holder of a valid token.
create function public.get_request_status(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{48}$' then
    return null;
  end if;

  select jsonb_build_object(
    'reference_code', r.reference_code,
    'service_name',   s.name,
    'service_kind',   s.kind,
    'preferred_date', r.preferred_date,
    'preferred_time', r.preferred_time,
    'status',         r.status,
    'created_at',     r.created_at,
    'updated_at',     r.updated_at,
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('status', e.to_status, 'at', e.created_at) order by e.created_at)
      from public.request_events e
      where e.request_id = r.id and e.event_type in ('created', 'status_changed')
    ), '[]'::jsonb)
  )
  into v_result
  from public.requests r
  join public.services s on s.id = r.service_id
  where r.status_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');

  return v_result;
end;
$$;

revoke all on function public.submit_request(uuid, text, text, text, date, text, text, boolean) from public, anon, authenticated;
revoke all on function public.get_request_status(text) from public, anon, authenticated;
grant execute on function public.submit_request(uuid, text, text, text, date, text, text, boolean) to anon, authenticated;
grant execute on function public.get_request_status(text) to anon, authenticated;
