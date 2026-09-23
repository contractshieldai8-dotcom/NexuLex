-- NexuLex AI — Living Shield: birleşik kalkan metni ve sözleşme yaşam döngüsü.
-- Mevcut analyses satırları silinmez; yeni kolonlar varsayılan / NULLABLE.

do $$
begin
  if to_regclass('public.analyses') is null then
    return;
  end if;

  alter table public.analyses
    add column if not exists revised_contract_text text;

  alter table public.analyses
    add column if not exists lifecycle text default 'draft';

  update public.analyses
    set lifecycle = 'draft'
    where lifecycle is null;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'analyses_lifecycle_check'
  ) then
    alter table public.analyses
      add constraint analyses_lifecycle_check
      check (lifecycle is null or lifecycle in ('draft', 'negotiating', 'signed'));
  end if;
end $$;
