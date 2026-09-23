-- NexuLex AI — durable Pro advisor seats. analyses RLS unchanged (owner-only).

create table if not exists public.advisor_seats (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  member_id uuid null references auth.users (id) on delete cascade,
  code text not null unique check (code ~ '^[0-9A-HJKMNP-TV-Z]{8}$'),
  revoked_at timestamptz null,
  created_at timestamptz default now()
);

create unique index if not exists advisor_seats_owner_member_active_idx
  on public.advisor_seats (owner_id, member_id)
  where revoked_at is null and member_id is not null;

create unique index if not exists advisor_seats_one_pending_idx
  on public.advisor_seats (owner_id)
  where revoked_at is null and member_id is null;

create index if not exists advisor_seats_owner_active_idx
  on public.advisor_seats (owner_id)
  where revoked_at is null;

create index if not exists advisor_seats_member_active_idx
  on public.advisor_seats (member_id)
  where revoked_at is null and member_id is not null;

create table if not exists public.advisor_briefs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  member_id uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid null references public.analyses (id) on delete set null,
  snapshot jsonb not null,
  created_at timestamptz default now(),
  revoked_at timestamptz null,
  constraint advisor_briefs_no_source_keys check (
    not (snapshot ? 'contract_text')
    and not (snapshot ? 'contractText')
    and not (snapshot ? 'originalText')
    and not (snapshot ? 'original_text')
  )
);

create index if not exists advisor_briefs_member_active_idx
  on public.advisor_briefs (member_id)
  where revoked_at is null;

create index if not exists advisor_briefs_owner_idx
  on public.advisor_briefs (owner_id)
  where revoked_at is null;

alter table public.advisor_seats enable row level security;
alter table public.advisor_briefs enable row level security;

drop policy if exists "advisor_seats_select_own" on public.advisor_seats;
create policy "advisor_seats_select_own" on public.advisor_seats
  for select using (auth.uid() = owner_id or auth.uid() = member_id);

drop policy if exists "advisor_briefs_select_own" on public.advisor_briefs;
create policy "advisor_briefs_select_own" on public.advisor_briefs
  for select using (auth.uid() = owner_id or auth.uid() = member_id);

revoke insert, update, delete on public.advisor_seats from anon, authenticated;
revoke insert, update, delete on public.advisor_briefs from anon, authenticated;
grant select on public.advisor_seats to authenticated;
grant select on public.advisor_briefs to authenticated;
