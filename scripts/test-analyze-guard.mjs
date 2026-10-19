// WAVE ECON.3: runs the REAL analyze-contract handler (transpiled from index.ts) against a mocked network and checks the
// server-side guard: anon key refused, plan-based "deep", per-plan text caps, the daily call counter (and its refund),
// fail-open behaviour, and the per-model thinking parameters (Sonnet 5.5 between_tools, Haiku disabled, Fable adaptive).
// Run: npm run test:analyze   (needs the devDependency typescript, already installed with Expo)
import fs from 'fs';
import ts from 'typescript';

const SOURCE = fs.readFileSync(new URL('../supabase/functions/analyze-contract/index.ts', import.meta.url), 'utf8');
const USER = '11111111-2222-3333-4444-555555555555';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else {
    fail++;
    console.log('FAIL', msg);
  }
};

const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const token = (payload) => `${b64({ alg: 'HS256' })}.${b64(payload)}.sig`;
const USER_TOKEN = token({ sub: USER, role: 'authenticated' });
const ANON_TOKEN = token({ role: 'anon' });

// ---- boot the handler with a fake Deno + fake network -------------------------------------------------------------
let handler;
const env = {
  ANTHROPIC_API_KEY: 'sk-test',
  SUPABASE_URL: 'https://proj.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
};
let pending = [];
globalThis.Deno = { serve: (h) => (handler = h), env: { get: (k) => env[k] } };
globalThis.EdgeRuntime = { waitUntil: (p) => pending.push(p) };
const js = ts.transpileModule(SOURCE, { compilerOptions: { target: 'ES2022', module: 'ESNext' } }).outputText;
new Function(js)();
ok(typeof handler === 'function', 'handler registered');

// net: what the mocked world answers; calls: what the handler did.
let net;
let calls;
const resetNet = (over = {}) => {
  net = {
    plan: { is_pro: false, plan: 'free' },
    profileStatus: 200,
    consume: { status: 200, body: { allowed: true, used: 1, limit: 30 } },
    anthropic: [{ status: 200, body: okBody() }],
    ...over,
  };
  calls = { anthropic: [], consume: [], refund: [], cost: [], profile: 0 };
};
function okBody(text = 'hello', model = 'm') {
  return { content: [{ type: 'text', text }], usage: { input_tokens: 10, output_tokens: 5 }, stop_reason: 'end_turn', model };
}
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  const body = init.body ? JSON.parse(init.body) : null;
  const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  if (u.startsWith('https://api.anthropic.com')) {
    calls.anthropic.push(body);
    const step = net.anthropic[Math.min(calls.anthropic.length - 1, net.anthropic.length - 1)];
    return reply(step.status, step.body);
  }
  if (u.includes('/rest/v1/profiles')) {
    calls.profile++;
    return net.profileStatus === 200 ? reply(200, [net.plan]) : reply(net.profileStatus, { message: 'down' });
  }
  if (u.endsWith('/rpc/consume_analyze_call')) {
    calls.consume.push(body);
    return reply(net.consume.status, net.consume.body);
  }
  if (u.endsWith('/rpc/refund_analyze_call')) {
    calls.refund.push(body);
    return reply(200, null);
  }
  if (u.endsWith('/rpc/record_ai_cost')) {
    calls.cost.push(body);
    return reply(200, null);
  }
  throw new Error('unexpected fetch ' + u);
};

const send = async ({ auth = USER_TOKEN, mode, content = 'hello', extra = {} } = {}) => {
  pending = [];
  resetNet.last = undefined;
  const req = new Request('http://edge.local/analyze', {
    method: 'POST',
    headers: { Authorization: auth ? `Bearer ${auth}` : '', 'content-type': 'application/json' },
    body: JSON.stringify({ mode, system: 'sys', messages: [{ role: 'user', content }], maxTokens: 1000, ...extra }),
  });
  const res = await handler(req);
  await Promise.all(pending);
  return { status: res.status, body: await res.json().catch(() => null) };
};

// ---- 1. identity -----------------------------------------------------------------------------------------------------
resetNet();
let r = await send({ auth: ANON_TOKEN });
ok(r.status === 401 && calls.anthropic.length === 0, 'the public anon key is refused before any model call');
r = await send({ auth: '' });
ok(r.status === 401 && calls.anthropic.length === 0, 'no token is refused');

// ---- 2. models, thinking parameters and plan gating ----------------------------------------------------------------
resetNet();
r = await send({ mode: 'default' });
ok(r.status === 200 && calls.anthropic[0].model === 'claude-sonnet-5-5', 'default mode runs Sonnet 5.5');
ok(JSON.stringify(calls.anthropic[0].thinking) === '{"type":"between_tools"}' && !calls.anthropic[0].output_config, 'Sonnet 5.5 uses between_tools (never "disabled")');
ok(!('temperature' in calls.anthropic[0]) && !('top_p' in calls.anthropic[0]) && !('top_k' in calls.anthropic[0]), 'no sampling parameters are sent');
ok(calls.consume.length === 1 && calls.consume[0].p_user === USER && calls.consume[0].p_limit === 30, 'free: counter called with the free daily limit');
ok(calls.cost.length === 1 && calls.cost[0].p_plan === 'free' && calls.cost[0].p_feature === 'analyze:text', 'telemetry carries the resolved plan');

resetNet({ plan: { is_pro: true, plan: 'pro' } });
r = await send({ mode: 'deep' });
ok(calls.anthropic[0].model === 'claude-sonnet-5-5', 'Pro asking for deep is served the default model');
ok(calls.consume[0].p_limit === 200, 'Pro daily limit is 200');

resetNet();
r = await send({ mode: 'deep' });
ok(calls.anthropic[0].model === 'claude-sonnet-5-5', 'free asking for deep is served the default model');

resetNet({ plan: { is_pro: true, plan: 'professional' }, consume: { status: 200, body: { allowed: true, used: 1, limit: 400 } } });
r = await send({ mode: 'deep' });
ok(calls.anthropic[0].model === 'claude-fable-5-1', 'Professional deep runs Fable 5.1');
ok(calls.anthropic[0].thinking?.type === 'adaptive' && calls.anthropic[0].output_config?.effort === 'low', 'Fable keeps adaptive thinking at low effort');
ok(calls.anthropic.length === 1 && calls.consume[0].p_limit === 400, 'Professional: one call, limit 400');

resetNet({ plan: { is_pro: true, plan: 'pro' } });
r = await send({ mode: 'fast' });
ok(calls.anthropic[0].model === 'claude-haiku-5-5' && calls.anthropic[0].thinking?.type === 'disabled', 'fast runs Haiku 5.5 with thinking disabled');

for (const weird of ['constructor', '__proto__', 'toString', 'DEEP', 42, null]) {
  resetNet();
  r = await send({ mode: weird });
  ok(r.status === 200 && calls.anthropic[0].model === 'claude-sonnet-5-5', `unknown mode ${String(weird)} falls back to default`);
}

// ---- 3. request size caps --------------------------------------------------------------------------------------------
resetNet();
r = await send({ content: 'x'.repeat(130_000) });
ok(r.status === 413 && calls.anthropic.length === 0 && calls.consume.length === 0, 'free: 130k characters of text is refused before counting');
resetNet({ plan: { is_pro: true, plan: 'pro' } });
r = await send({ content: 'x'.repeat(130_000) });
ok(r.status === 200, 'Pro: 130k characters of text is fine');
resetNet({ plan: { is_pro: true, plan: 'pro' } });
r = await send({ content: 'x'.repeat(310_000) });
ok(r.status === 413, 'Pro: 310k characters of text is refused');
resetNet();
r = await send({ content: [{ type: 'text', text: 'read this' }, { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: 'A'.repeat(900_000) } }] });
ok(r.status === 200, 'free: a large image does not count against the text cap');

// ---- 4. the daily counter --------------------------------------------------------------------------------------------
resetNet({ consume: { status: 200, body: { allowed: false, used: 30, limit: 30 } } });
r = await send();
ok(r.status === 429 && r.body?.error === 'ANALYZE_DAILY_LIMIT' && calls.anthropic.length === 0, 'over the daily limit: 429 and no model call');
ok(calls.refund.length === 0, 'a refused call is not refunded (it was never counted)');

resetNet({ consume: { status: 500, body: { message: 'db down' } } });
r = await send();
ok(r.status === 200 && calls.anthropic.length === 1, 'counter outage fails open');
ok(calls.refund.length === 0, 'no refund when the call was never counted');

resetNet({ profileStatus: 500 });
r = await send({ mode: 'deep' });
ok(r.status === 200 && calls.anthropic[0].model === 'claude-sonnet-5-5' && calls.consume.length === 0, 'profile outage fails open: default model, no counter');
ok(calls.cost[0]?.p_plan === 'free', 'profile outage is labelled free in telemetry');
resetNet({ profileStatus: 500 });
r = await send({ content: 'x'.repeat(130_000) });
ok(r.status === 413, 'profile outage keeps the strictest text cap');

// ---- 5. upstream failures and refunds --------------------------------------------------------------------------------
resetNet({ anthropic: [{ status: 529, body: { error: { message: 'overloaded' } } }] });
r = await send();
ok(r.status === 529 && calls.anthropic.length === 1, 'upstream status is passed through');
ok(calls.refund.length === 1 && calls.refund[0].p_user === USER, 'an upstream failure gives the call back');

resetNet({ anthropic: [{ status: 400, body: { error: { message: 'thinking rejected' } } }, { status: 200, body: okBody() }] });
r = await send();
ok(r.status === 200 && calls.anthropic.length === 2, 'Sonnet: a 400 is retried once');
ok(!('thinking' in calls.anthropic[1]) && calls.anthropic[1].output_config?.effort === 'low', 'the retry sends effort low and no thinking field');
ok(calls.refund.length === 0, 'a retried success is not refunded');

resetNet({ plan: { is_pro: true, plan: 'professional' }, anthropic: [{ status: 400, body: { error: { message: 'bad' } } }] });
r = await send({ mode: 'deep' });
ok(r.status === 400 && calls.anthropic.length === 1, 'Fable: a 400 is not retried (thinking is already adaptive at low effort)');

resetNet({ anthropic: [{ status: 200, body: { content: [{ type: 'thinking', thinking: '' }], usage: { input_tokens: 9, output_tokens: 4096 }, stop_reason: 'max_tokens', model: 'm' } }] });
r = await send();
ok(r.status === 502 && r.body?.error === 'empty-edge-text', 'only thinking blocks and no text: empty-edge-text');
ok(calls.refund.length === 0 && calls.cost[0]?.p_failed === true && calls.cost[0]?.p_truncated === true, 'billed but empty: no refund, telemetry marks it failed + truncated');

resetNet({ anthropic: [{ status: 200, body: { content: [{ type: 'thinking', thinking: '' }, { type: 'text', text: 'answer' }], usage: { input_tokens: 9, output_tokens: 20 }, stop_reason: 'end_turn', model: 'm' } }] });
r = await send();
ok(r.status === 200 && r.body?.text === 'answer', 'a leading thinking block does not hide the text block');

// ---- 6. per-model thinking matrix (the block shared by the three functions) ------------------------------------------
const block = SOURCE.slice(SOURCE.indexOf('// BEGIN claude-model-profile'), SOURCE.indexOf('// END claude-model-profile'));
const plain = ts.transpileModule(block, { compilerOptions: { target: 'ES2022' } }).outputText;
const profile = new Function(`${plain}; return { thinkingParams, lowEffortParams, canRetryLowEffort, envModel };`)();
const j = (x) => JSON.stringify(x);
const matrix = {
  'claude-sonnet-5-5': { t: '{"thinking":{"type":"between_tools"}}', retry: true },
  'claude-sonnet-5': { t: '{"thinking":{"type":"disabled"}}', retry: true },
  'claude-haiku-5-5': { t: '{"thinking":{"type":"disabled"}}', retry: true },
  'claude-haiku-4-5': { t: '{"thinking":{"type":"disabled"}}', retry: true },
  'claude-fable-5-1': { t: '{"thinking":{"type":"adaptive"},"output_config":{"effort":"low"}}', retry: false },
  'claude-fable-5': { t: '{"thinking":{"type":"adaptive"},"output_config":{"effort":"low"}}', retry: false },
  'claude-opus-5-5': { t: '{"thinking":{"type":"adaptive"},"output_config":{"effort":"low"}}', retry: false },
};
for (const [model, want] of Object.entries(matrix)) {
  ok(j(profile.thinkingParams(model)) === want.t, `thinking params for ${model}: ${j(profile.thinkingParams(model))}`);
  ok(profile.canRetryLowEffort(model) === want.retry, `retry rule for ${model}`);
}
ok(j(profile.lowEffortParams()) === '{"output_config":{"effort":"low"}}', 'low effort retry body');
ok(profile.envModel('NOPE', 'claude-x') === 'claude-x', 'envModel falls back');
env.TEST_MODEL = '  claude-sonnet-5  ';
ok(profile.envModel('TEST_MODEL', 'claude-x') === 'claude-sonnet-5', 'envModel trims an override');
env.TEST_MODEL = '   ';
ok(profile.envModel('TEST_MODEL', 'claude-x') === 'claude-x', 'a blank override is ignored');

console.log(`pass=${pass} fail=${fail}`);
process.exit(fail ? 1 : 0);
