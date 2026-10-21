// claim_free_quota on a real in-process Postgres (PGlite): the field-report regression
//   duplicate key value violates unique constraint "idx_unique_profiles_device_id"
// plus the existing rules (2 free analyses once per device + phone, verified e-mail only, PHONE_TAKEN).
// Run: node scripts/test-claim-quota-sql.mjs   (needs devDependency @electric-sql/pglite)
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';

const root = new URL('../supabase/migrations/', import.meta.url);
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz, created_at timestamptz not null default now());
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.uid', true), '')::uuid $$;
  create table public.analyses (id uuid primary key default gen_random_uuid(), user_id uuid);
`);
await db.exec(fs.readFileSync(new URL('20260909090000_quota_and_support.sql', root), 'utf8'));
// Production carries this unique index although no repo migration creates it; mirror it so the bug is reproducible.
await db.exec('create unique index idx_unique_profiles_device_id on public.profiles (device_id) where device_id is not null;');
const before = await db.query("select count(*)::int c from pg_proc where proname = 'claim_free_quota'");
await db.exec(fs.readFileSync(new URL('20261021130000_claim_quota_device_collision.sql', root), 'utf8'));
const after = await db.query("select count(*)::int c from pg_proc where proname = 'claim_free_quota'");

let pass = 0;
let fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const U = (n) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`;
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

ok(before.rows[0].c === 1 && after.rows[0].c === 1, 'the migration replaces the function (no overload left behind)');

for (let i = 1; i <= 6; i++) await addUser(i, i !== 5);

// First account on a device gets two free analyses and stores the device.
let r = await claim(U(1), '+905550000001', 'android:A');
ok(!r.error && r.row.free_analyses_left === 2 && r.row.device_id === 'android:A', 'first account: 2 free analyses, device stored ' + JSON.stringify(r));

// Calling again (every sign-in) is idempotent for the same account.
r = await claim(U(1), '+905550000001', 'android:A');
ok(!r.error && r.row.free_analyses_left === 2, 'same account again: still 2, no error ' + JSON.stringify(r));

// REGRESSION: a second account on the same device used to crash with the unique violation.
r = await claim(U(2), '+905550000002', 'android:A');
ok(!r.error, 'second account on the same device does not fail ' + (r.error || ''));
ok(r.row && r.row.free_analyses_left === 0, 'second account on the same device gets no free analyses ' + JSON.stringify(r));
ok(r.row && r.row.device_id === null, 'the device stays on the first profile only');

// Same device, no phone: still no error and no grant.
r = await claim(U(3), null, 'android:A');
ok(!r.error && r.row.free_analyses_left === 0, 'third account, no phone, same device: 0 and no error ' + JSON.stringify(r));

// A fresh device and phone still earns the grant.
r = await claim(U(4), '+905550000004', 'android:B');
ok(!r.error && r.row.free_analyses_left === 2 && r.row.device_id === 'android:B', 'new device and phone: 2 free analyses');

// Unverified e-mail never gets a grant.
r = await claim(U(5), '+905550000005', 'android:C');
ok(!r.error && r.row.free_analyses_left === 0, 'unverified e-mail: 0');

// A phone that belongs to another account is still rejected.
r = await claim(U(6), '+905550000001', 'android:D');
ok(r.error && r.error.includes('PHONE_TAKEN'), 'phone of another account is rejected ' + JSON.stringify(r));

// The first profile keeps its device and its quota untouched by the later claims.
const first = (await db.query(`select device_id, free_analyses_left from public.profiles where id = '${U(1)}'`)).rows[0];
ok(first.device_id === 'android:A' && first.free_analyses_left === 2, 'first profile untouched ' + JSON.stringify(first));

// Deleting the first account keeps the claim row (abuse prevention), so the device cannot be farmed again.
await db.exec(`delete from auth.users where id = '${U(1)}'`);
await addUser(7);
r = await claim(U(7), '+905550000007', 'android:A');
ok(!r.error && r.row.free_analyses_left === 0, 'device already claimed stays claimed after deletion, and no error ' + JSON.stringify(r));

console.log(`claim_free_quota SQL: pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
