-- CareRoute AI — milestone 2: staff access
-- Staff are granted by email allow-list. A confirmed auth user whose email is on the
-- allow-list automatically gets a row in public.staff (which gates all staff RLS).
-- Allow-list entries are data (personal emails) and are NOT stored in this file;
-- add them with: insert into public.staff_allowlist (email, display_name) values (...);

create table public.staff_allowlist (
  email        text primary key check (email = lower(email)),
  display_name text,
  role         text not null default 'staff' check (role in ('staff', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.staff_allowlist enable row level security;
revoke all on public.staff_allowlist from anon, authenticated;
-- No policies: only the database owner / dashboard can manage the allow-list.

create function private.grant_staff_from_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and new.email is not null then
    insert into public.staff (user_id, display_name, role)
    select new.id, a.display_name, a.role
    from public.staff_allowlist a
    where a.email = lower(new.email)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.grant_staff_from_allowlist() from public;

create trigger on_auth_user_grant_staff
after insert or update of email, email_confirmed_at on auth.users
for each row execute function private.grant_staff_from_allowlist();

-- When an allow-list entry is added, grant any matching confirmed user immediately.
create function private.apply_allowlist_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.staff (user_id, display_name, role)
  select u.id, new.display_name, new.role
  from auth.users u
  where lower(u.email) = new.email and u.email_confirmed_at is not null
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.apply_allowlist_entry() from public;

create trigger on_allowlist_insert
after insert on public.staff_allowlist
for each row execute function private.apply_allowlist_entry();

-- Staff can see the staff directory (to show who changed a status).
create policy "Staff can view staff directory" on public.staff
  for select to authenticated using ((select private.is_staff()));

-- A request can never be moved back to 'submitted'.
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
    insert into public.request_events (request_id, event_type, from_status, to_status, actor_user_id)
    values (new.id, 'status_changed', old.status, new.status, (select auth.uid()));
  end if;
  return new;
end;
$$;
