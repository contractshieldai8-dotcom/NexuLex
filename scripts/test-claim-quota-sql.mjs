// claim_free_quota on a real in-process Postgres (PGlite).
//   - 20261021130000: second account on a device must not crash on idx_unique_profiles_device_id.
//   - 20261021150000: phone numbers are no longer collected; legacy phone data is erased; the free quota is guarded
//     by verified e-mail + one grant per device + one grant per account (and never without a device id).
// Run: node scripts/test-claim-quota-sql.mjs   (needs devDependency @electric-sql/pglite)
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';

const root = new URL('../supabase/migrations/', import.meta.url);
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth;
  create table auth.users (
    id uuid primary key, email text, email_confirmed_at timestamptz,
    raw_user_meta_data jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
  );
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
  create table public.analyses (id uuid primary key default gen_random_uuid(), user_id uuid);
`);
await db.exec(fs.readFileSync(new URL('20260909090000_quota_and_support.sql', root), 'utf8'));
// Production carries this unique index although no repo migration creates it; mirror it so the bug is reproducible.
await db.exec('create unique index idx_unique_profiles_device_id on public.profiles (device_id) where device_id is not null;');
await db.exec(fs.readFileSync(new URL('20261021130000_claim_quota_device_collision.sql', root), 'utf8'));

let pass = 0;
let fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const U = (n) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`;

// ---- Legacy data written by builds that still collected phone numbers --------------------------------------------
await db.exec(`
  insert into auth.users (id, email, email_confirmed_at, raw_user_meta_data) values
    ('${U(90)}', 'legacy90@x.com', now(), '{"phone_number":"+905550000090","keep":"yes"}'),
    ('${U(91)}', 'legacy91@x.com', now(), '{"phone_number":"+905550000091"}');
  insert into public.profiles (id, email, phone_number, device_id, free_analyses_left) values
    ('${U(90)}', 'legacy90@x.com', '+905550000090', 'android:LEGACY', 1),
    ('${U(91)}', 'legacy91@x.com', '+905550000091', null, 2);
  insert into public.free_quota_claims (user_id, device_id, phone_number) values
    ('${U(90)}', 'android:LEGACY', '+905550000090'),
    ('${U(91)}', 'android:LEGACY2', '+905550000091');
`);

const before = await db.query("select count(*)::int c from pg_proc where proname = 'claim_free_quota'");
await db.exec(fs.readFileSync(new URL('20261021150000_remove_phone_collection.sql', root), 'utf8'));
const after = await db.query("select count(*)::int c from pg_proc where proname = 'claim_free_quota'");
ok(before.rows[0].c === 1 && after.rows[0].c === 1, 'the migration replaces the function (no overload left behind)');

// ---- Erasure of legacy phone data ---------------------------------------------------------------------------------
ok((await db.query('select count(*)::int c from public.profiles where phone_number is not null')).rows[0].c === 0, 'profiles: every phone number erased');
ok((await db.query('select count(*)::int c from public.free_quota_claims where phone_number is not null')).rows[0].c === 0, 'claims: every phone number erased');
ok((await db.query("select count(*)::int c from auth.users where raw_user_meta_data ? 'phone_number'")).rows[0].c === 0, 'auth metadata: phone_number key removed');
ok((await db.query(`select raw_user_meta_data->>'keep' k from auth.users where id = '${U(90)}'`)).rows[0].k === 'yes', 'auth metadata: other keys untouched');
ok((await db.query("select count(*)::int c from pg_indexes where indexname in ('profiles_phone_number_key','free_quota_claims_phone_key')")).rows[0].c === 0, 'phone uniqueness indexes dropped');
ok((await db.query("select count(*)::int c from public.free_quota_claims where device_id in ('android:LEGACY','android:LEGACY2')")).rows[0].c === 2, 'legacy device claims survive the erasure');

const claim = async (user, phone, device) => {
  await db.exec(`select set_config('app.uid', '${user}', false)`);
  try {
    const r = await db.query('select * from public.claim_free_quota($1, $2)', [phone, device]);
    return { row: r.rows[0] };
  } catch (e) {
    return { error: String(e.message) };
  }
};
const addUser = (n, verified = true) =>
  db.exec(`insert into auth.users (id, email, email_confirmed_at) values ('${U(n)}', 'u${n}@x.com', ${verified ? 'now()' : 'null'})`);

for (let i = 1; i <= 8; i++) await addUser(i, i !== 5);

// First account on a device gets two free analyses and stores the device (current builds send no phone).
let r = await claim(U(1), null, 'android:A');
ok(!r.error && r.row.free_analyses_left === 2 && r.row.device_id === 'android:A', 'first account: 2 free analyses, device stored ' + JSON.stringify(r));
ok(r.row && r.row.phone_number === null, 'no phone number is stored');

// Calling again (every sign-in) is idempotent for the same account.
r = await claim(U(1), null, 'android:A');
ok(!r.error && r.row.free_analyses_left === 2, 'same account again: still 2, no error ' + JSON.stringify(r));

// A second account on the same device gets nothing and never crashes (device collision regression).
r = await claim(U(2), null, 'android:A');
ok(!r.error && r.row && r.row.free_analyses_left === 0 && r.row.device_id === null, 'second account on the same device: 0, device stays on the first profile ' + JSON.stringify(r));

// A phone sent by an older build is ignored: never stored, never rejected, never a second grant on the same device.
r = await claim(U(3), '+905550000099', 'android:A');
ok(!r.error && r.row.free_analyses_left === 0 && r.row.phone_number === null, 'legacy build sending a phone: ignored, same device still 0 ' + JSON.stringify(r));

// Two accounts that "share" a phone number are no longer rejected (PHONE_TAKEN is gone); each new device earns its grant.
r = await claim(U(4), '+905550000099', 'android:B');
ok(!r.error && r.row.free_analyses_left === 2 && r.row.phone_number === null, 'new device earns the grant even with a repeated phone ' + JSON.stringify(r));
r = await claim(U(6), '+905550000099', 'android:D');
ok(!r.error && r.row.free_analyses_left === 2, 'a repeated phone number is not a reason to reject ' + JSON.stringify(r));

// Unverified e-mail never gets a grant.
r = await claim(U(5), null, 'android:C');
ok(!r.error && r.row.free_analyses_left === 0, 'unverified e-mail: 0');

// No device id => no grant (a direct RPC call cannot mint free analyses).
r = await claim(U(7), null, null);
ok(!r.error && r.row.free_analyses_left === 0, 'no device id: 0 ' + JSON.stringify(r));
r = await claim(U(7), null, '   ');
ok(!r.error && r.row.free_analyses_left === 0, 'blank device id: 0');

// One grant per account: the same account on a new device (reinstall) never gets its quota reset to 2.
await db.exec(`update public.profiles set free_analyses_left = 1 where id = '${U(4)}'`);
r = await claim(U(4), null, 'android:B2');
ok(!r.error && r.row.free_analyses_left === 1, 'same account on a new device keeps its remaining quota (no reset) ' + JSON.stringify(r));

// A legacy account's claimed device stays claimed even though its phone was erased.
r = await claim(U(8), null, 'android:LEGACY');
ok(!r.error && r.row.free_analyses_left === 0, 'legacy claimed device stays claimed ' + JSON.stringify(r));

// The first profile keeps its device and its quota untouched by the later claims.
const first = (await db.query(`select device_id, free_analyses_left from public.profiles where id = '${U(1)}'`)).rows[0];
ok(first.device_id === 'android:A' && first.free_analyses_left === 2, 'first profile untouched ' + JSON.stringify(first));

// Deleting the first account keeps the claim row (abuse prevention), so the device cannot be farmed again.
await db.exec(`delete from auth.users where id = '${U(1)}'`);
await addUser(9);
r = await claim(U(9), null, 'android:A');
ok(!r.error && r.row.free_analyses_left === 0, 'device already claimed stays claimed after deletion, and no error ' + JSON.stringify(r));
ok((await db.query(`select count(*)::int c from public.free_quota_claims where device_id = 'android:A' and user_id is null`)).rows[0].c === 1, 'after deletion the claim row has no account link');

// ---- consents: append-only consent ledger (20261022120000) ----------------------------------------------------------
await db.exec(fs.readFileSync(new URL('20261022120000_consents_ledger.sql', root), 'utf8'));
await db.exec('grant usage on schema auth to authenticated; grant usage on schema public to authenticated;');
for (const n of [20, 21]) await addUser(n);

// Run a statement as a signed-in app user (RLS applies) and always return to the owner role.
const asUser = async (uid, sql, params = []) => {
  await db.exec(`select set_config('app.uid', '${uid}', false); set role authenticated;`);
  try {
    const r = await db.query(sql, params);
    return { rows: r.rows, count: r.affectedRows ?? r.rows.length };
  } catch (e) {
    return { error: String(e.message) };
  } finally {
    await db.exec('reset role;');
  }
};

let c = await asUser(U(20), "insert into public.consents (user_id, consent_type, version, granted) values ($1, 'ai_processing', 1, true)", [U(20)]);
ok(!c.error, 'consents: a user can append a grant for themselves ' + JSON.stringify(c));
c = await asUser(U(20), "insert into public.consents (user_id, consent_type, version, granted) values ($1, 'ai_processing', 1, true)", [U(21)]);
ok(!!c.error && /row-level security/i.test(c.error), 'consents: inserting a row for someone else is refused by RLS ' + JSON.stringify(c));
c = await asUser(U(21), "insert into public.consents (user_id, consent_type, version, granted) values ($1, 'ai_processing', 1, true)", [U(21)]);
ok(!c.error, 'consents: second user can append their own row');

c = await asUser(U(20), 'select user_id from public.consents');
ok(!c.error && c.rows.length === 1 && c.rows[0].user_id === U(20), 'consents: a user only reads their own rows ' + JSON.stringify(c));

// created_at is the server clock even when the client tries to backdate it.
c = await asUser(U(20), "insert into public.consents (user_id, consent_type, version, granted, created_at) values ($1, 'ai_processing', 1, false, '2001-01-01') returning created_at", [U(20)]);
ok(!c.error && new Date(c.rows[0].created_at).getFullYear() >= 2024, 'consents: client-supplied created_at is overwritten by the server clock ' + JSON.stringify(c));

// Append-only for the app user: UPDATE and DELETE touch nothing (no policy) ...
c = await asUser(U(20), 'update public.consents set granted = false where user_id = $1', [U(20)]);
ok((c.error || c.count === 0), 'consents: UPDATE by the owner changes no row ' + JSON.stringify(c));
c = await asUser(U(20), 'delete from public.consents where user_id = $1', [U(20)]);
ok((c.error || c.count === 0), 'consents: DELETE by the owner removes no row ' + JSON.stringify(c));
ok((await db.query(`select count(*)::int c from public.consents where user_id = '${U(20)}'`)).rows[0].c === 2, 'consents: both of the owner rows are intact after UPDATE/DELETE attempts');
// ... and not even a privileged role can rewrite history.
try {
  await db.exec(`update public.consents set granted = false where user_id = '${U(20)}'`);
  ok(false, 'consents: privileged UPDATE must be rejected');
} catch (e) {
  ok(/CONSENTS_APPEND_ONLY/.test(String(e.message)), 'consents: privileged UPDATE is rejected by the append-only trigger');
}

// Constraints: only known types, positive versions.
c = await asUser(U(21), "insert into public.consents (user_id, consent_type, version, granted) values ($1, 'marketing', 1, true)", [U(21)]);
ok(!!c.error, 'consents: unknown consent_type is rejected');
c = await asUser(U(21), "insert into public.consents (user_id, consent_type, version, granted) values ($1, 'ai_processing', 0, true)", [U(21)]);
ok(!!c.error, 'consents: version below 1 is rejected');

// Newest row wins: grant (v1) then withdraw gives the current state "not granted".
const latest = (await db.query(`select granted, version from public.consents where user_id = '${U(20)}' and consent_type = 'ai_processing' order by created_at desc, id desc limit 1`)).rows[0];
ok(latest.granted === false, 'consents: the newest row is the current state (withdrawal after grant)');

// anon cannot touch the ledger at all.
await db.exec('set role anon;');
try {
  await db.query('select 1 from public.consents');
  ok(false, 'consents: anon select must be denied');
} catch (e) {
  ok(/permission denied/i.test(String(e.message)), 'consents: anon has no access');
} finally {
  await db.exec('reset role;');
}

// Account deletion erases the ledger (ON DELETE CASCADE) even though UPDATE is blocked.
await db.exec(`delete from auth.users where id = '${U(20)}'`);
ok((await db.query(`select count(*)::int c from public.consents where user_id = '${U(20)}'`)).rows[0].c === 0, 'consents: deleting the account cascades and erases its rows');
ok((await db.query(`select count(*)::int c from public.consents where user_id = '${U(21)}'`)).rows[0].c === 1, 'consents: other users rows survive');

console.log(`claim_free_quota SQL: pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
