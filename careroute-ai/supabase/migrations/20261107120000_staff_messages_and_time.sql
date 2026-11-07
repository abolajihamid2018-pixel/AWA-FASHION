-- CareRoute AI — staff messages to patients + confirmed appointment time.

-- Confirmed time (the patient already chose the date).
alter table public.requests add column appointment_time time;

-- Patient-visible message attached to a history event.
alter table public.request_events add column message text check (char_length(message) <= 500);

alter table public.request_events drop constraint request_events_event_type_check;
alter table public.request_events add constraint request_events_event_type_check
  check (event_type in ('created', 'status_changed', 'ai_completed', 'ai_failed', 'staff_message'));

-- Status changes pick up an optional message set by public.staff_set_status (same transaction).
create or replace function private.on_request_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    if new.status = 'submitted' then
      raise exception 'invalid_status_transition';
    end if;
    insert into public.request_events (request_id, event_type, from_status, to_status, actor_user_id, message)
    values (new.id, 'status_changed', old.status, new.status, (select auth.uid()),
            nullif(current_setting('careroute.status_message', true), ''));
  end if;
  return new;
end;
$$;

grant update (appointment_time) on public.requests to authenticated;

-- Staff: change status, optionally with a confirmed time and a message to the patient.
-- SECURITY INVOKER: Row-Level Security and column grants still apply.
create function public.staff_set_status(
  p_request_id       uuid,
  p_status           public.request_status,
  p_appointment_time time default null,
  p_message          text default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_kind    public.service_kind;
  v_current public.request_status;
  v_msg     text := nullif(btrim(coalesce(p_message, '')), '');
begin
  if not (select private.is_staff()) then
    raise exception 'forbidden';
  end if;
  if v_msg is not null and char_length(v_msg) > 500 then
    raise exception 'message_too_long';
  end if;

  select s.kind, r.status into v_kind, v_current
  from public.requests r join public.services s on s.id = r.service_id
  where r.id = p_request_id;
  if not found then
    raise exception 'not_found';
  end if;
  if v_current = p_status then
    raise exception 'status_unchanged';
  end if;
  if p_status = 'approved' and v_kind = 'appointment' and p_appointment_time is null then
    raise exception 'time_required';
  end if;

  perform set_config('careroute.status_message', coalesce(v_msg, ''), true);
  update public.requests
     set status = p_status,
         appointment_time = case when p_status = 'approved' then p_appointment_time else null end
   where id = p_request_id;
  perform set_config('careroute.status_message', '', true);
end;
$$;

-- Staff: send a message without changing the status. Returns the new event id.
create function public.staff_send_message(p_request_id uuid, p_message text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_msg text := nullif(btrim(coalesce(p_message, '')), '');
  v_id  bigint;
begin
  if not (select private.is_staff()) then
    raise exception 'forbidden';
  end if;
  if v_msg is null then
    raise exception 'message_required';
  end if;
  if char_length(v_msg) > 500 then
    raise exception 'message_too_long';
  end if;
  if not exists (select 1 from public.requests where id = p_request_id) then
    raise exception 'not_found';
  end if;
  insert into public.request_events (request_id, event_type, actor_user_id, message)
  values (p_request_id, 'staff_message', (select auth.uid()), v_msg)
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.staff_set_status(uuid, public.request_status, time, text) from public, anon, authenticated;
revoke all on function public.staff_send_message(uuid, text) from public, anon, authenticated;
grant execute on function public.staff_set_status(uuid, public.request_status, time, text) to authenticated;
grant execute on function public.staff_send_message(uuid, text) to authenticated;

-- Patient status view: add the confirmed time and staff messages to the history.
create or replace function public.get_request_status(p_token text)
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
    'reference_code',   r.reference_code,
    'service_name',     s.name,
    'service_kind',     s.kind,
    'preferred_date',   r.preferred_date,
    'preferred_time',   r.preferred_time,
    'appointment_time', to_char(r.appointment_time, 'HH24:MI'),
    'status',           r.status,
    'created_at',       r.created_at,
    'updated_at',       r.updated_at,
    'history', coalesce((
      select jsonb_agg(jsonb_build_object(
               'type', e.event_type, 'status', e.to_status, 'at', e.created_at, 'message', e.message
             ) order by e.created_at, e.id)
      from public.request_events e
      where e.request_id = r.id and e.event_type in ('created', 'status_changed', 'staff_message')
    ), '[]'::jsonb)
  )
  into v_result
  from public.requests r
  join public.services s on s.id = r.service_id
  where r.status_token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');

  return v_result;
end;
$$;
