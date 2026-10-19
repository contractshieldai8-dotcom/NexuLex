// WAVE ECON.3: runs the real migration on an in-process Postgres (PGlite) and checks the analyze-contract daily call counter:
// counting up to the limit, refusal at the limit, isolation between users, a fresh count each UTC day, refunds that never go
// below zero, account deletion, and that only the service role may call any of it.
// Run: npm run test:sql:econ3   (needs devDependency @electric-sql/pglite)
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';

const root = new URL('../supabase/migrations/', import.meta.url);
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated; create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
`);
await db.exec(fs.readFileSync(new URL('20261019120000_econ3_analyze_guard.sql', root), 'utf8'));
await db.exec(fs.readFileSync(new URL('20261019120000_econ3_analyze_guard.sql', root), 'utf8')); // idempotent
console.log('migration applied (twice)');

let pass = 0;
let fail = 0;
const ok = (c, m) => {
  if (c) pass++;
  else {
    fail++;
    console.log('FAIL', m);
  }
};
const U = (n) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`;
const q = async (sql) => (await db.query(sql)).rows;
const call = async (sql) => {
  try {
    return { r: (await db.query(sql)).rows };
  } catch (e) {
    return { e: String(e.message) };
  }
};
const consume = (user, limit) => call(`select public.consume_analyze_call('${user}', ${limit}) as r`).then((x) => x.r?.[0].r ?? { error: x.e });
const calls = async (user) => (await q(`select coalesce(sum(calls),0)::int c from public.analyze_usage where user_id = '${user}'`))[0].c;

for (let i = 1; i <= 3; i++) await db.exec(`insert into auth.users (id, email) values ('${U(i)}', 'u${i}@x.com')`);

// --- counting and the limit ---------------------------------------------------------------------------------------
for (let i = 1; i <= 5; i++) {
  const r = await consume(U(1), 5);
  ok(r.allowed === true && r.used === i && r.limit === 5, `call ${i} of 5 ${JSON.stringify(r)}`);
}
let r = await consume(U(1), 5);
ok(r.allowed === false && r.used === 5, 'the sixth call is refused ' + JSON.stringify(r));
ok((await calls(U(1))) === 5, 'a refused call is not counted');
r = await consume(U(1), 6);
ok(r.allowed === true && r.used === 6, 'a higher limit (plan upgrade) lets the user continue');

// --- isolation ----------------------------------------------------------------------------------------------------
r = await consume(U(2), 5);
ok(r.allowed === true && r.used === 1, 'another user starts at one');

// --- a new UTC day starts fresh ---------------------------------------------------------------------------------
await db.exec(`update public.analyze_usage set day = day - 1 where user_id = '${U(1)}'`);
r = await consume(U(1), 5);
ok(r.allowed === true && r.used === 1, 'yesterday does not count today ' + JSON.stringify(r));
ok((await q(`select count(*)::int c from public.analyze_usage where user_id = '${U(1)}'`))[0].c === 2, 'one row per day');

// --- refund ---------------------------------------------------------------------------------------------------------
await db.exec(`select public.refund_analyze_call('${U(1)}')`);
ok((await q(`select calls from public.analyze_usage where user_id = '${U(1)}' and day = (now() at time zone 'utc')::date`))[0].calls === 0, 'refund gives one back');
await db.exec(`select public.refund_analyze_call('${U(1)}'); select public.refund_analyze_call('${U(3)}');`);
ok((await q(`select calls from public.analyze_usage where user_id = '${U(1)}' and day = (now() at time zone 'utc')::date`))[0].calls === 0, 'refund never goes below zero');
ok((await q(`select count(*)::int c from public.analyze_usage where user_id = '${U(3)}'`))[0].c === 0, 'refund for a user with no row creates nothing');

// --- bad input --------------------------------------------------------------------------------------------------------
for (const sql of [
  `select public.consume_analyze_call(null, 5)`,
  `select public.consume_analyze_call('${U(1)}', 0)`,
  `select public.consume_analyze_call('${U(1)}', null)`,
]) ok((await call(sql)).e?.includes('INVALID'), 'rejects bad input: ' + sql.slice(0, 60));

// --- account deletion ---------------------------------------------------------------------------------------------------
await db.exec(`delete from auth.users where id = '${U(2)}'`);
ok((await calls(U(2))) === 0, 'counters go with the account');

// --- privileges: only the service role -------------------------------------------------------------------------------
for (const role of ['authenticated', 'anon']) {
  await db.exec(`set role ${role}`);
  for (const sql of [
    `select public.consume_analyze_call('${U(1)}', 5)`,
    `select public.refund_analyze_call('${U(1)}')`,
    'select * from public.analyze_usage',
    `update public.analyze_usage set calls = 0`,
  ]) ok((await call(sql)).e?.includes('permission denied'), `${role} is locked out: ${sql.slice(0, 50)}`);
  await db.exec('reset role');
}
await db.exec('set role service_role');
ok(!(await call(`select public.consume_analyze_call('${U(1)}', 5)`)).e, 'service role can count');
ok(!(await call(`select public.refund_analyze_call('${U(1)}')`)).e, 'service role can refund');
await db.exec('reset role');

console.log(`pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
