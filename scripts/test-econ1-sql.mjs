// WAVE ECON.1: runs the real migrations on an in-process Postgres (PGlite) and checks every rule of the cost guard:
// free questions (3 to start, then 1 per rolling 7 days, per device, kept after account deletion), paid daily + monthly caps,
// Professional tool caps, refunds, privileges and the anonymous token telemetry.
// Run: npm run test:sql:econ   (needs devDependency @electric-sql/pglite)
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
for (const file of ['20260909090000_quota_and_support.sql', '20260927120000_legal_ask_usage.sql', '20260929120000_professional_tier.sql', '20261014120000_econ1_cost_guard.sql']) {
  await db.exec(fs.readFileSync(new URL(file, root), 'utf8'));
}
console.log('migrations applied');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const U = (n) => `00000000-0000-0000-0000-0000000000${String(n).padStart(2, '0')}`;
const q = async (sql) => (await db.query(sql)).rows;
const call = async (sql) => { try { return { r: (await db.query(sql)).rows }; } catch (e) { return { e: String(e.message) }; } };

for (let i = 1; i <= 9; i++) await db.exec(`insert into auth.users (id, email, email_confirmed_at) values ('${U(i)}', 'u${i}@x.com', now())`);

// Free policy numbers used by the edge function: 3 to start, 1 per 7 days, 3 per day at most.
const free = (user, device) => call(`select public.consume_legal_ask_v2('${user}', ${device === null ? 'null' : `'${device}'`}, true, 3, 0, 3, 1) as r`).then((x) => x.r?.[0].r ?? { error: x.e });
const paid = (user, daily, monthly) => call(`select public.consume_legal_ask_v2('${user}', null, false, ${daily}, ${monthly}, 0, 0) as r`).then((x) => x.r?.[0].r ?? { error: x.e });
const ageFree = (subject, days) => db.exec(`update public.legal_ask_free_usage set day = day - ${days} where subject = '${subject}'`);
const ageUser = (user, days) => db.exec(`update public.legal_ask_usage set day = day - ${days} where user_id = '${user}'`);

// --- free: three to start -------------------------------------------------------------------
for (let i = 1; i <= 3; i++) {
  const r = await free(U(1), 'devA');
  ok(r.allowed === true && r.free_total === i && r.day_used === i, `free start ${i} ${JSON.stringify(r)}`);
}
let r = await free(U(1), 'devA');
ok(r.allowed === false && r.reason === 'DAILY' && r.free_total === 3, 'fourth the same day stops at the daily guard ' + JSON.stringify(r));

// --- free: after the starter questions, one per rolling 7 days ----------------------------------
await ageFree('devA', 2); await ageUser(U(1), 2);
r = await free(U(1), 'devA');
ok(r.allowed === false && r.reason === 'FREE' && r.free_total === 3 && r.free_recent === 3, 'starter used 2 days ago: blocked ' + JSON.stringify(r));
ok(typeof r.free_next_day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r.free_next_day), 'next free day is reported');
await ageFree('devA', 4); await ageUser(U(1), 4); // now 6 days ago: still inside the window
r = await free(U(1), 'devA');
ok(r.allowed === false && r.reason === 'FREE', '6 days ago: still blocked');
await ageFree('devA', 1); await ageUser(U(1), 1); // 7 days ago: the window is days 2..today, so it is free again
r = await free(U(1), 'devA');
ok(r.allowed === true && r.free_total === 4 && r.free_recent === 1, '7 days later one free question opens ' + JSON.stringify(r));
r = await free(U(1), 'devA');
ok(r.allowed === false && r.reason === 'FREE', 'and only one a week ' + JSON.stringify(r));
const next = (await free(U(1), 'devA')).free_next_day;
const expected = (await q(`select to_char(((now() at time zone 'utc')::date + 7), 'YYYY-MM-DD') as d`))[0].d;
ok(next === expected, `next free day is today + 7 (${next} vs ${expected})`);

// --- free: the allowance belongs to the device, not the account ---------------------------------
r = await free(U(2), 'devA');
ok(r.allowed === false && r.free_total === 4, 'a second account on the same device shares the allowance ' + JSON.stringify(r));
r = await free(U(3), 'devB');
ok(r.allowed === true && r.free_total === 1, 'a different device has its own three');
r = await free(U(4), null);
ok(r.allowed === true && r.free_total === 1, 'no device id: counted per user');
r = await free(U(5), '   ');
ok(r.allowed === true, 'blank device id counts as none');

// Deleting the account keeps the device record, so the allowance cannot be reset.
await db.exec(`delete from auth.users where id = '${U(1)}'`);
ok((await q(`select count(*)::int c from public.legal_ask_usage where user_id = '${U(1)}'`))[0].c === 0, 'per-user rows go with the account');
ok((await q(`select coalesce(sum(used),0)::int c from public.legal_ask_free_usage where subject = 'devA'`))[0].c === 4, 'device rows stay after deletion');
await db.exec(`insert into auth.users (id, email, email_confirmed_at) values ('${U(10)}', 'new@x.com', now())`);
r = await free(U(10), 'devA');
ok(r.allowed === false && r.free_total === 4, 're-registering on the same device gets nothing new ' + JSON.stringify(r));

// --- refund ---------------------------------------------------------------------------------
r = await free(U(6), 'devR');
ok(r.allowed === true && r.free_total === 1, 'refund fixture consumed');
await db.exec(`select public.refund_legal_ask('${U(6)}'); select public.refund_legal_ask_free('${U(6)}', 'devR');`);
let c = (await q(`select public.legal_ask_counters('${U(6)}', 'devR') as c`))[0].c;
ok(c.day_used === 0 && c.free_total === 0, 'refund gives the free question back ' + JSON.stringify(c));
await db.exec(`select public.refund_legal_ask('${U(6)}'); select public.refund_legal_ask_free('${U(6)}', 'devR');`);
c = (await q(`select public.legal_ask_counters('${U(6)}', 'devR') as c`))[0].c;
ok(c.day_used === 0 && c.free_total === 0, 'refund never goes below zero');

// --- paid: daily and monthly caps -----------------------------------------------------------------
for (let i = 1; i <= 5; i++) {
  r = await paid(U(7), 40, 5);
  ok(r.allowed === true && r.month_used === i, `paid month ${i}`);
}
r = await paid(U(7), 40, 5);
ok(r.allowed === false && r.reason === 'MONTHLY' && r.month_used === 5, 'sixth is refused by the monthly cap ' + JSON.stringify(r));
r = await paid(U(8), 2, 300);
ok(r.allowed && (await paid(U(8), 2, 300)).allowed, 'two daily questions');
r = await paid(U(8), 2, 300);
ok(r.allowed === false && r.reason === 'DAILY' && r.day_used === 2, 'third is refused by the daily cap');
// Last month never counts against this month.
await db.exec(`insert into public.legal_ask_usage (user_id, day, used) values ('${U(9)}', (date_trunc('month', now() at time zone 'utc')::date - 1), 500)`);
r = await paid(U(9), 40, 300);
ok(r.allowed === true && r.month_used === 1 && r.day_used === 1, 'previous month is ignored ' + JSON.stringify(r));
// Earlier days of this month count.
await db.exec(`insert into public.legal_ask_usage (user_id, day, used) values ('${U(2)}', date_trunc('month', now() at time zone 'utc')::date, 299)`);
const startedToday = (await q(`select (date_trunc('month', now() at time zone 'utc')::date = (now() at time zone 'utc')::date) as t`))[0].t;
r = await paid(U(2), 40, 300);
ok(r.allowed === true && r.month_used === 300 && r.day_used === (startedToday ? 300 : 1), 'the 300th question of the month is allowed ' + JSON.stringify(r));
r = await paid(U(2), 400, 300);
ok(r.allowed === false && r.reason === 'MONTHLY', 'the 301st is refused ' + JSON.stringify(r));
// A paid refund lowers the month too.
await db.exec(`select public.refund_legal_ask('${U(2)}')`);
r = (await q(`select public.legal_ask_counters('${U(2)}', null) as c`))[0].c;
ok(r.month_used === 299, 'refund lowers the monthly total');

// --- bad arguments --------------------------------------------------------------------------------
ok((await call(`select public.consume_legal_ask_v2(null, null, false, 40, 300, 0, 0)`)).e?.includes('INVALID'), 'null user');
ok((await call(`select public.consume_legal_ask_v2('${U(1)}', null, false, 0, 300, 0, 0)`)).e?.includes('INVALID'), 'zero daily');
ok((await call(`select public.consume_legal_ask_v2('${U(1)}', null, false, 40, 0, 0, 0)`)).e?.includes('INVALID'), 'paid needs a monthly cap');
ok((await call(`select public.consume_legal_ask_v2('${U(1)}', null, true, 3, 0, -1, 1)`)).e?.includes('INVALID'), 'negative lifetime');

// --- Professional tools ---------------------------------------------------------------------------
const tool = (user, daily, monthly) => call(`select public.consume_pro_tool_v2('${user}', ${daily}, ${monthly}) as r`).then((x) => x.r?.[0].r ?? { error: x.e });
for (let i = 1; i <= 3; i++) ok((await tool(U(3), 30, 3)).allowed === true, `tool ${i}`);
r = await tool(U(3), 30, 3);
ok(r.allowed === false && r.reason === 'MONTHLY' && r.month_used === 3, 'tools stop at the monthly cap ' + JSON.stringify(r));
ok((await tool(U(4), 1, 300)).allowed === true, 'one daily tool');
r = await tool(U(4), 1, 300);
ok(r.allowed === false && r.reason === 'DAILY', 'tools stop at the daily cap');
await db.exec(`select public.refund_pro_tool('${U(4)}')`);
ok((await tool(U(4), 1, 300)).allowed === true, 'a refunded tool run can be used again');
ok((await call(`select public.consume_pro_tool_v2('${U(4)}', 30, 0)`)).e?.includes('INVALID'), 'tool monthly cap must be set');

// --- telemetry: anonymous token totals -------------------------------------------------------------------
await db.exec(`
  select public.record_ai_cost('legal_ask', 'free', 'claude-sonnet-5', 1200, 900, false, false);
  select public.record_ai_cost('legal_ask', 'free', 'claude-sonnet-5', 800, 3500, true, false);
  select public.record_ai_cost('legal_ask', 'pro', 'claude-sonnet-5', 1000, 1000, false, true);
`);
const rows = await q(`select plan, calls, input_tokens::int i, output_tokens::int o, truncated, failed from public.ai_cost_daily order by plan`);
ok(rows.length === 2, 'one row per day/feature/plan/model');
const f = rows.find((x) => x.plan === 'free');
ok(f.calls === 2 && f.i === 2000 && f.o === 4400 && f.truncated === 1 && f.failed === 0, 'free totals add up ' + JSON.stringify(f));
ok(rows.find((x) => x.plan === 'pro').failed === 1, 'failed call is counted');
ok((await call(`select public.record_ai_cost('legal_ask', 'admin', 'm', 1, 1, false, false)`)).e?.includes('check'), 'unknown plan rejected');
const cols = (await q(`select column_name from information_schema.columns where table_name = 'ai_cost_daily'`)).map((x) => x.column_name).join(',');
ok(!/user|email|device|text|question|answer/.test(cols), 'telemetry holds no personal column: ' + cols);
const view = (await q(`select calls::int c, avg_output_per_call::int a from public.ai_cost_monthly where plan = 'free'`))[0];
ok(view.c === 2 && view.a === 2200, 'monthly view averages ' + JSON.stringify(view));

// --- privileges: only the service role may touch any of this ------------------------------------------------
await db.exec('set role authenticated');
for (const sql of [
  `select public.consume_legal_ask_v2('${U(1)}', null, false, 40, 300, 0, 0)`,
  `select public.legal_ask_counters('${U(1)}', null)`,
  `select public.refund_legal_ask_free('${U(1)}', null)`,
  `select public.consume_pro_tool_v2('${U(1)}', 30, 300)`,
  `select public.pro_tool_counters('${U(1)}')`,
  `select public.record_ai_cost('legal_ask', 'free', 'm', 1, 1, false, false)`,
  'select * from public.legal_ask_free_usage',
  'select * from public.ai_cost_daily',
  'select * from public.ai_cost_monthly',
]) ok((await call(sql)).e?.includes('permission denied'), 'authenticated is locked out: ' + sql.slice(0, 48));
await db.exec('reset role');
await db.exec('set role anon');
ok((await call(`select public.consume_legal_ask_v2('${U(1)}', null, false, 40, 300, 0, 0)`)).e?.includes('permission denied'), 'anon is locked out');
await db.exec('reset role');
await db.exec('set role service_role');
ok(!(await call(`select public.legal_ask_counters('${U(1)}', null)`)).e, 'service role can call the counters');
await db.exec('reset role');

console.log(`pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
