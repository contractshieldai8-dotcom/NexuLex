// WAVE J: runs the real quota + referral migrations on an in-process Postgres (PGlite) and checks every rule
// of redeem_referral / get_my_referral. Run: npm run test:sql   (needs devDependency @electric-sql/pglite)
// auth.users / auth.uid() / roles / analyses are small stand-ins for what Supabase provides.
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
await db.exec(fs.readFileSync(new URL('20261005180000_referrals.sql', root), 'utf8'));
console.log('migrations applied');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const as = (id) => db.exec(`select set_config('app.uid', '${id}', false)`);
const U = (n) => `00000000-0000-0000-0000-00000000000${n}`;
const call = async (sql) => { try { const r = await db.query(sql); return { r: r.rows }; } catch (e) { return { e: String(e.message) }; } };

await db.exec(`
  insert into auth.users (id, email, email_confirmed_at, created_at) values
   ('${U(1)}','a@x.com', now(), now()),
   ('${U(2)}','b@x.com', now(), now()),
   ('${U(3)}','c@x.com', null, now()),
   ('${U(4)}','d@x.com', now(), now() - interval '10 days'),
   ('${U(5)}','e@x.com', now(), now()),
   ('${U(6)}','f@x.com', now(), now());
  insert into public.profiles (id, device_id, free_analyses_left) values
   ('${U(1)}','devA',2), ('${U(2)}','devB',2), ('${U(3)}','devC',0), ('${U(4)}','devD',0), ('${U(5)}','devA',0), ('${U(6)}','devB',0);
`);

// Not authenticated
await as('');
ok((await call('select public.get_my_referral()')).e?.includes('NOT_AUTHENTICATED'), 'get requires auth');
ok((await call(`select public.redeem_referral('AAAAAAAA')`)).e?.includes('NOT_AUTHENTICATED'), 'redeem requires auth');

// Code generation
await as(U(1));
const g1 = (await call('select public.get_my_referral() as r')).r[0].r;
ok(/^[A-HJKMNP-Z2-9]{8}$/.test(g1.code), 'code format ' + g1.code);
const g1b = (await call('select public.get_my_referral() as r')).r[0].r;
ok(g1.code === g1b.code, 'code is stable');
ok(g1.rewards === 0 && g1.cap === 5 && g1.redeemed === false, 'initial stats');
await as(U(2));
const g2 = (await call('select public.get_my_referral() as r')).r[0].r;
ok(g2.code !== g1.code, 'codes unique');

// Errors
await as(U(2));
ok((await call(`select public.redeem_referral('${g2.code}')`)).e?.includes('SELF_REFERRAL'), 'self');
ok((await call(`select public.redeem_referral('ZZZZZZZZ')`)).e?.includes('INVALID_CODE'), 'invalid');
ok((await call(`select public.redeem_referral('')`)).e?.includes('INVALID_CODE'), 'empty');
await as(U(3));
ok((await call(`select public.redeem_referral('${g1.code}')`)).e?.includes('EMAIL_NOT_VERIFIED'), 'unverified');
await as(U(4));
ok((await call(`select public.redeem_referral('${g1.code}')`)).e?.includes('CODE_WINDOW_CLOSED'), 'old account');
// same device as referrer (U5 on devA, referrer U1 on devA)
await as(U(5));
ok((await call(`select public.redeem_referral('${g1.code}')`)).e?.includes('SAME_DEVICE'), 'same device');

// Happy path: U2 redeems U1 code (lowercase + dash tolerated)
await as(U(2));
const lower = g1.code.slice(0, 4).toLowerCase() + '-' + g1.code.slice(4);
const red = await call(`select public.redeem_referral('${lower}') as r`);
ok(red.r?.[0].r.ok === true && red.r[0].r.left === 3, 'redeem ok, left=3 ' + JSON.stringify(red));
const prof = (await db.query(`select id, free_analyses_left from profiles order by id`)).rows;
ok(prof.find((p) => p.id === U(1)).free_analyses_left === 3, 'referrer got +1');
ok(prof.find((p) => p.id === U(2)).free_analyses_left === 3, 'referee got +1');
ok((await call(`select public.redeem_referral('${g1.code}')`)).e?.includes('ALREADY_REDEEMED'), 'already redeemed');
const g2b = (await call('select public.get_my_referral() as r')).r[0].r;
ok(g2b.redeemed === true, 'redeemed flag');
await as(U(1));
const g1c = (await call('select public.get_my_referral() as r')).r[0].r;
ok(g1c.rewards === 1, 'referrer rewards=1');

// Device reuse: U6 shares devB with U2 who already redeemed
await as(U(6));
ok((await call(`select public.redeem_referral('${g1.code}')`)).e?.includes('DEVICE_USED'), 'device reuse');

// Cap: 6 fresh referees on distinct devices, referrer rewarded only 5 times
for (let i = 10; i < 17; i++) {
  await db.exec(`insert into auth.users (id,email,email_confirmed_at) values ('00000000-0000-0000-0000-0000000000${i}','u${i}@x.com',now());
                 insert into profiles (id, device_id, free_analyses_left) values ('00000000-0000-0000-0000-0000000000${i}','dev${i}',0);`);
}
let lastLeft;
for (let i = 10; i < 17; i++) {
  await as(`00000000-0000-0000-0000-0000000000${i}`);
  const r = await call(`select public.redeem_referral('${g1.code}') as r`);
  ok(r.r?.[0].r.ok === true && r.r[0].r.left === 1, `referee ${i} always +1 ` + JSON.stringify(r));
}
const refFinal = (await db.query(`select free_analyses_left from profiles where id='${U(1)}'`)).rows[0].free_analyses_left;
ok(refFinal === 2 + 5, 'referrer capped at +5 (got ' + refFinal + ')');
await as(U(1));
ok((await call('select public.get_my_referral() as r')).r[0].r.rewards === 5, 'rewards capped at 5');

// Direct table access denied for authenticated role
await db.exec('set role authenticated');
ok((await call('select * from referral_codes')).e?.includes('permission denied'), 'codes table locked');
ok((await call('select * from referral_redemptions')).e?.includes('permission denied'), 'redemptions table locked');
await db.exec('reset role');

// Delete account keeps device record, removes code
await db.exec(`delete from auth.users where id='${U(2)}'`);
const red2 = (await db.query(`select referee_id, referee_device from referral_redemptions where referee_device='devB'`)).rows;
ok(red2.length === 1 && red2[0].referee_id === null, 'device record kept anonymously after delete');
await db.exec(`delete from auth.users where id='${U(1)}'`);
ok((await db.query(`select count(*)::int c from referral_codes where user_id='${U(1)}'`)).rows[0].c === 0, 'code removed on delete');

console.log(`pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
