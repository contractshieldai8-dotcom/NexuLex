-- NexuLex AI — Wave C: eksik kalkan, güç eğimi, BATNA, hukuk çatışması, avukat soruları ve sessiz doğrulama.
-- Mevcut analyses satırları silinmez; yeni kolonlar varsayılan / NULLABLE.

do $$
begin
  if to_regclass('public.analyses') is null then
    return;
  end if;

  alter table public.analyses
    add column if not exists missing_protections jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists power_tilt jsonb default null;

  alter table public.analyses
    add column if not exists batna_ladder jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists governing_law_conflict jsonb default null;

  alter table public.analyses
    add column if not exists lawyer_questions jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists sign_conditions jsonb default '[]'::jsonb;

  alter table public.analyses
    add column if not exists sign_status jsonb default null;

  alter table public.analyses
    add column if not exists contract_text text;
end $$;
