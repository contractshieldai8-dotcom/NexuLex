-- NEXULEX AI - append-only consent ledger (GDPR Art. 7(1): the controller must be able to demonstrate consent;
-- KVKK Art. 5; App Store Review Guideline 5.1.1(i)).
--
-- One row per consent decision. The current state of a consent is its newest row, so withdrawing is a new row with
-- granted = false, never an update. Rows hold no contract text and no free text: only who, what, which wording
-- version, granted or withdrawn, and when.
--
-- Access model
--   * a signed-in user can read and insert ONLY their own rows (RLS, insert check on auth.uid());
--   * there is no UPDATE or DELETE policy, and a trigger rejects UPDATE even for privileged roles;
--   * deleting the auth user removes the rows (ON DELETE CASCADE), which is the account-deletion erasure path;
--   * created_at is always the server clock (a client-supplied value is overwritten).
--
-- Client contract (services/aiConsent.js): the device record is authoritative offline. If the insert fails, the
-- device consent stays valid and the write is retried later; this table is the audit trail, not a gate.

create table if not exists public.consents (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  consent_type text not null check (consent_type in ('ai_processing')),
  version integer not null check (version >= 1),
  granted boolean not null,
  created_at timestamptz not null default now()
);

create index if not exists consents_user_type_created_idx
  on public.consents (user_id, consent_type, created_at desc, id desc);

alter table public.consents enable row level security;

revoke all on table public.consents from public, anon, authenticated;
grant select, insert on table public.consents to authenticated;

drop policy if exists consents_select_own on public.consents;
create policy consents_select_own on public.consents
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists consents_insert_own on public.consents;
create policy consents_insert_own on public.consents
  for insert to authenticated
  with check (user_id = auth.uid());

-- Deliberately no UPDATE or DELETE policy: with RLS enabled that means "denied" for every app user.

-- Server clock only: ignore whatever created_at a client sends.
create or replace function public.consents_stamp()
returns trigger
language plpgsql
as $$
begin
  new.created_at := now();
  return new;
end;
$$;

drop trigger if exists consents_stamp_trg on public.consents;
create trigger consents_stamp_trg
  before insert on public.consents
  for each row execute function public.consents_stamp();

-- Append-only even for privileged roles (service role, SQL editor). Account deletion still works because it
-- removes rows through the foreign key cascade, which is a DELETE and is not blocked here.
create or replace function public.consents_block_update()
returns trigger
language plpgsql
as $$
begin
  raise exception 'CONSENTS_APPEND_ONLY' using errcode = 'P0001';
end;
$$;

drop trigger if exists consents_no_update_trg on public.consents;
create trigger consents_no_update_trg
  before update on public.consents
  for each row execute function public.consents_block_update();
