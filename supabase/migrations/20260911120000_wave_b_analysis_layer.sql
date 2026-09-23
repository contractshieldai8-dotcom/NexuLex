-- NexuLex AI — İmza anı karar, TBK/BGB geçersizlik, tuzak takvimi ve hatırlatıcılar.
-- Mevcut analyses satırları silinmez; yeni kolonlar varsayılan / NULLABLE.

-- ---------------------------------------------------------------------------
-- 1) analyses: yeni analiz alanları (tablo yoksa sessizce atlanır)
-- ---------------------------------------------------------------------------
do $$
begin
  if to_regclass('public.analyses') is null then
    return;
  end if;

  alter table public.analyses
    add column if not exists user_party_role varchar(50) default 'neutral';

  alter table public.analyses
    add column if not exists decision_card jsonb default '{}'::jsonb;

  alter table public.analyses
    add column if not exists hidden_costs jsonb default '{}'::jsonb;

  alter table public.analyses
    add column if not exists counter_proposals jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists invalid_clauses jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists contract_events jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists obligations jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists integrity_checks jsonb default '{}'::jsonb;

  alter table public.analyses
    add column if not exists contract_category varchar(50) default 'general';
end $$;

-- ---------------------------------------------------------------------------
-- 2) Hatırlatıcılar ve yükümlülük takvimi
-- ---------------------------------------------------------------------------
create table if not exists public.contract_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  analysis_id uuid,
  title varchar(255) not null,
  event_date timestamptz not null,
  reminder_type varchar(50) not null,
  status varchar(20) not null default 'pending',
  created_at timestamptz not null default now()
);

do $$
begin
  if to_regclass('public.analyses') is not null then
    begin
      alter table public.contract_reminders
        add constraint contract_reminders_analysis_id_fkey
        foreign key (analysis_id) references public.analyses (id) on delete cascade;
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

create index if not exists contract_reminders_user_date_idx
  on public.contract_reminders (user_id, event_date);

create index if not exists contract_reminders_analysis_idx
  on public.contract_reminders (analysis_id);

alter table public.contract_reminders enable row level security;

drop policy if exists "Kullanıcı kendi hatırlatıcılarını görebilir" on public.contract_reminders;
create policy "Kullanıcı kendi hatırlatıcılarını görebilir"
  on public.contract_reminders
  for select
  using (auth.uid() = user_id);

drop policy if exists "Kullanıcı kendi hatırlatıcılarını ekleyebilir" on public.contract_reminders;
create policy "Kullanıcı kendi hatırlatıcılarını ekleyebilir"
  on public.contract_reminders
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Kullanıcı kendi hatırlatıcılarını güncelleyebilir" on public.contract_reminders;
create policy "Kullanıcı kendi hatırlatıcılarını güncelleyebilir"
  on public.contract_reminders
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update on public.contract_reminders to authenticated;
