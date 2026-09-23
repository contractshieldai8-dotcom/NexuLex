-- WAVE O2: public HTML brief viewer. analyses / analysis_shares unchanged.

insert into storage.buckets (id, name, public)
values ('brief-web', 'brief-web', true)
on conflict (id) do update
set public = true;

drop policy if exists "brief_web_select_anon" on storage.objects;
create policy "brief_web_select_anon"
on storage.objects
for select
to anon
using (bucket_id = 'brief-web');

drop policy if exists "brief_web_select_authenticated" on storage.objects;
create policy "brief_web_select_authenticated"
on storage.objects
for select
to authenticated
using (bucket_id = 'brief-web');
