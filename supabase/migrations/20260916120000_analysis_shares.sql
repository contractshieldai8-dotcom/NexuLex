-- NexuLex AI — view-only share briefs. analyses.contract_text politikası değişmez.

create table if not exists public.analysis_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid null references public.analyses (id) on delete set null,
  code text not null unique,
  audience text not null check (audience in ('household', 'advisor', 'counterparty')),
  snapshot jsonb not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  revoked_at timestamptz null,
  created_at timestamptz default now()
);

create index if not exists analysis_shares_code_active_idx
  on public.analysis_shares (code)
  where revoked_at is null;

create index if not exists analysis_shares_owner_active_idx
  on public.analysis_shares (owner_id)
  where revoked_at is null;

alter table public.analysis_shares enable row level security;

drop policy if exists "analysis_shares_select_own" on public.analysis_shares;
create policy "analysis_shares_select_own" on public.analysis_shares
  for select using (auth.uid() = owner_id);

drop policy if exists "analysis_shares_insert_own" on public.analysis_shares;
create policy "analysis_shares_insert_own" on public.analysis_shares
  for insert with check (auth.uid() = owner_id);

drop policy if exists "analysis_shares_update_own" on public.analysis_shares;
create policy "analysis_shares_update_own" on public.analysis_shares
  for update using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
