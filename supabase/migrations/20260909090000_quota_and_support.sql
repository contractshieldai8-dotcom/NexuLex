-- NEXULEX AI — Ücretsiz hak koruması, destek formu ve geçmiş silme için şema.
-- Uygulama:  supabase db push     (veya SQL Editor'e yapıştırıp çalıştırın)

-- ---------------------------------------------------------------------------
-- 1) profiles: telefon (UNIQUE), cihaz kimliği ve ücretsiz analiz hakkı
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists device_id text;
alter table public.profiles add column if not exists free_analyses_left integer not null default 0;
alter table public.profiles add column if not exists is_pro boolean not null default false;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

-- Bir telefon numarası yalnızca tek bir hesapta bulunabilir.
create unique index if not exists profiles_phone_number_key
  on public.profiles (phone_number)
  where phone_number is not null;

create index if not exists profiles_device_id_idx
  on public.profiles (device_id)
  where device_id is not null;

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Kullanıcı kendi profilini güncelleyebilir ama ücretsiz hak / pro alanlarını
-- kendi kendine yükseltemez; bu alanlar yalnızca SECURITY DEFINER fonksiyonlarla değişir.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 2) free_quota_claims: hangi cihaz / telefon ücretsiz haktan yararlandı
--    (Hesap silinse bile kayıt kalır, böylece hak sıfırlanamaz.)
-- ---------------------------------------------------------------------------
create table if not exists public.free_quota_claims (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  device_id text,
  phone_number text,
  claimed_at timestamptz not null default now()
);

create unique index if not exists free_quota_claims_device_key
  on public.free_quota_claims (device_id)
  where device_id is not null;

create unique index if not exists free_quota_claims_phone_key
  on public.free_quota_claims (phone_number)
  where phone_number is not null;

alter table public.free_quota_claims enable row level security;
-- İstemciye doğrudan erişim verilmez; yalnızca SECURITY DEFINER fonksiyon yazar.

-- ---------------------------------------------------------------------------
-- 3) claim_free_quota: kayıt / giriş sonrası profili kurar ve hakkı belirler
--    E-postası doğrulanmış + cihazı ve telefonu ilk kez görülen kullanıcıya 2 hak.
--    Aksi halde free_analyses_left = 0.
-- ---------------------------------------------------------------------------
create or replace function public.claim_free_quota(p_phone text, p_device text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text;
  v_verified boolean;
  v_already_claimed boolean;
  v_grant integer := 0;
  v_profile public.profiles;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  p_phone := nullif(btrim(coalesce(p_phone, '')), '');
  p_device := nullif(btrim(coalesce(p_device, '')), '');

  select u.email, (u.email_confirmed_at is not null)
    into v_email, v_verified
    from auth.users u
   where u.id = v_user;

  -- Telefon numarası başka bir hesaba aitse kayıt reddedilir.
  if p_phone is not null and exists (
    select 1 from public.profiles p where p.phone_number = p_phone and p.id <> v_user
  ) then
    raise exception 'PHONE_TAKEN';
  end if;

  select exists (
    select 1
      from public.free_quota_claims c
     where (p_device is not null and c.device_id = p_device)
        or (p_phone is not null and c.phone_number = p_phone)
  ) into v_already_claimed;

  insert into public.profiles as p (id, email, phone_number, device_id, free_analyses_left)
  values (v_user, v_email, p_phone, p_device, 0)
  on conflict (id) do update
     set email = excluded.email,
         phone_number = coalesce(excluded.phone_number, p.phone_number),
         device_id = coalesce(excluded.device_id, p.device_id),
         updated_at = now()
  returning * into v_profile;

  -- Yeni cihaz + yeni telefon + doğrulanmış e-posta => 2 ücretsiz hak.
  if v_verified and not v_already_claimed then
    v_grant := 2;

    insert into public.free_quota_claims (user_id, device_id, phone_number)
    values (v_user, p_device, p_phone)
    on conflict do nothing;

    update public.profiles
       set free_analyses_left = v_grant,
           updated_at = now()
     where id = v_user
    returning * into v_profile;
  end if;

  return v_profile;
end;
$$;

revoke all on function public.claim_free_quota(text, text) from public;
grant execute on function public.claim_free_quota(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4) consume_free_analysis: bir analiz hakkı düşer, kalan hakkı döndürür
-- ---------------------------------------------------------------------------
create or replace function public.consume_free_analysis()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_left integer;
  v_pro boolean;
begin
  if v_user is null then
    raise exception 'NOT_AUTHENTICATED';
  end if;

  select free_analyses_left, is_pro into v_left, v_pro
    from public.profiles where id = v_user;

  if v_pro then
    return -1; -- sınırsız
  end if;

  if coalesce(v_left, 0) <= 0 then
    raise exception 'QUOTA_EXHAUSTED';
  end if;

  update public.profiles
     set free_analyses_left = free_analyses_left - 1,
         updated_at = now()
   where id = v_user
  returning free_analyses_left into v_left;

  return v_left;
end;
$$;

revoke all on function public.consume_free_analysis() from public;
grant execute on function public.consume_free_analysis() to authenticated;

-- ---------------------------------------------------------------------------
-- 5) support_messages: destek ve hata bildirimleri
-- ---------------------------------------------------------------------------
create table if not exists public.support_messages (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  email text,
  subject text,
  message text not null,
  locale text,
  platform text,
  app_version text,
  device_id text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists support_messages_user_idx on public.support_messages (user_id);
create index if not exists support_messages_status_idx on public.support_messages (status);

alter table public.support_messages enable row level security;

drop policy if exists "support_insert_own" on public.support_messages;
create policy "support_insert_own" on public.support_messages
  for insert with check (auth.uid() = user_id);

drop policy if exists "support_select_own" on public.support_messages;
create policy "support_select_own" on public.support_messages
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 6) analyses: kullanıcının kendi kaydını silebilmesi (Geçmiş temizleme)
-- ---------------------------------------------------------------------------
alter table if exists public.analyses enable row level security;

drop policy if exists "analyses_delete_own" on public.analyses;
create policy "analyses_delete_own" on public.analyses
  for delete using (auth.uid() = user_id);

-- Gelişmiş analiz alanları (yoksa eklenir).
alter table if exists public.analyses add column if not exists jurisdiction jsonb;
alter table if exists public.analyses add column if not exists red_flags jsonb;
alter table if exists public.analyses add column if not exists negotiation_tips jsonb;
alter table if exists public.analyses add column if not exists glossary jsonb;
alter table if exists public.analyses add column if not exists key_takeaways jsonb;
