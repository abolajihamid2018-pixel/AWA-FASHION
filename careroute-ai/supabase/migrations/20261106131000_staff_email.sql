-- Store the staff member's email on public.staff so the dashboard can label actors
-- without exposing auth.users.
alter table public.staff add column email text;

update public.staff s set email = lower(u.email) from auth.users u where u.id = s.user_id;

create or replace function private.grant_staff_from_allowlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and new.email is not null then
    insert into public.staff (user_id, email, display_name, role)
    select new.id, lower(new.email), a.display_name, a.role
    from public.staff_allowlist a
    where a.email = lower(new.email)
    on conflict (user_id) do update set email = excluded.email;
  end if;
  return new;
end;
$$;

create or replace function private.apply_allowlist_entry()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.staff (user_id, email, display_name, role)
  select u.id, lower(u.email), new.display_name, new.role
  from auth.users u
  where lower(u.email) = new.email and u.email_confirmed_at is not null
  on conflict (user_id) do nothing;
  return new;
end;
$$;
