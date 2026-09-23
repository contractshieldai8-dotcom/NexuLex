-- PGRST204: "Could not find the 'app_version' column of 'support_messages'".
--
-- Önceki migration `create table if not exists` kullandığı için, tablo daha önce
-- elle oluşturulmuş kurulumlarda yeni sütunlar eklenmedi. Bu migration eksik
-- sütunları tek tek tamamlar ve PostgREST şema önbelleğini tazeler.

alter table public.support_messages add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.support_messages add column if not exists email text;
alter table public.support_messages add column if not exists subject text;
alter table public.support_messages add column if not exists locale text;
alter table public.support_messages add column if not exists platform text;
alter table public.support_messages add column if not exists app_version varchar(20) default '1.0.0';
alter table public.support_messages add column if not exists device_id text;
alter table public.support_messages add column if not exists status text not null default 'new';
alter table public.support_messages add column if not exists created_at timestamptz not null default now();

create index if not exists support_messages_user_idx on public.support_messages (user_id);
create index if not exists support_messages_status_idx on public.support_messages (status);

alter table public.support_messages enable row level security;

drop policy if exists "support_insert_own" on public.support_messages;
create policy "support_insert_own" on public.support_messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "support_select_own" on public.support_messages;
create policy "support_select_own" on public.support_messages
  for select using (auth.uid() = user_id);

-- PostgREST şema önbelleğini yeniden yükle (Dashboard'daki "Reload schema cache"
-- düğmesiyle aynı işi yapar).
notify pgrst, 'reload schema';
