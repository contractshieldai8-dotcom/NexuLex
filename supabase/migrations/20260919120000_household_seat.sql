-- WAVE S — one durable household seat. analyses RLS unchanged.

alter table public.advisor_seats
  add column if not exists role text;

update public.advisor_seats
  set role = 'advisor'
  where role is null or role not in ('advisor', 'household');

alter table public.advisor_seats
  alter column role set default 'advisor';

alter table public.advisor_seats
  alter column role set not null;

alter table public.advisor_seats
  drop constraint if exists advisor_seats_role_check;

alter table public.advisor_seats
  add constraint advisor_seats_role_check check (role in ('advisor', 'household'));

drop index if exists advisor_seats_one_pending_idx;

create unique index if not exists advisor_seats_one_pending_role_idx
  on public.advisor_seats (owner_id, role)
  where revoked_at is null and member_id is null;
