// WAVE ECON.4: engine of the 13-language model A/B (CLI: scripts/benchmark-models.mjs, offline test: scripts/test-benchmark.mjs).
//
// What it really runs (nothing is re-implemented here):
//   ask      the production legal-ask prompt, token limit and thinking parameters (read from the Edge Function source),
//            then the app's own normalizer (utils/legalAnswer.js) as the pass/fail judge.
//   tools    the same for pro-tools (memo), judged by utils/plan.js.
//   analyze  the WHOLE scan pipeline in-process: services/ai.js (the app) -> the real analyze-contract handler (plan guard,
//            mode -> model map, thinking parameters) -> Anthropic. Only Supabase's plan lookup and quota RPCs are faked.
//            Judged by the app's isAcceptableAnalysis plus checks of its own.
// Every call is priced from the usage Anthropic returns, so the cost column is real dollars, not an estimate.
import { createAppLoader } from './app-modules.mjs';
import { EDGE_FILES, PRICE, API_BASE, anthropicHeaders, configuredModels, costUsd, loadEdgeParts, readSource } from './claude.mjs';
import { detectLanguage } from './lang-detect.mjs';
import { CONTRACT_CATEGORY, CONTRACT_COUNTRY, CONTRACT_PARTY, CONTRACT_TEXT, CONTRACT_TYPE, LANGS, LANG_CASES, TOOL_POSITION, toolMaterial } from './ab-fixtures.mjs';
import { transpileEdge } from './edge-runtime.mjs';

export const TASKS = ['ask', 'tools', 'analyze'];
export const ALL_LANGS = LANGS;
export const DEFAULT_ASK_LANGS = LANGS;
export const DEFAULT_TOOLS_LANGS = ['tr', 'ar', 'ja']; // English is covered by ask and passed in the first run
// Analysis is the dearest task (about $0.08 per Sonnet call): Turkish (home), Arabic (right-to-left), Japanese (CJK) and
// Russian (Cyrillic). English and Chinese passed in the first run; add them with --analyze-langs.
export const DEFAULT_ANALYZE_LANGS = ['tr', 'ar', 'ja', 'ru'];
export const DEFAULT_BUDGET_USD = 1;

// What the three analyze modes are called in the report, and which plan the mocked profile uses for each
// (the server only serves "deep" to Professional).
const MODE_PLAN = { default: 'pro', fast: 'pro', deep: 'professional' };
const MODE_LABEL = { default: 'sonnet', fast: 'haiku', deep: 'fable' };

// Typical token use of one call (input, output) per task and model family, only for the pre-flight estimate and the budget stop.
// Measured in the first real run (Oct 2026, 46 calls): Sonnet writes about 20-60% more than Haiku, Fable thinks even at low effort.
const TYPICAL = {
  ask: { sonnet: [2300, 3000], haiku: [2300, 2450], fable: [2300, 4500] },
  tools: { sonnet: [2100, 3200], haiku: [2100, 2600], fable: [2100, 5000] },
  analyze: { sonnet: [6000, 7100], haiku: [6000, 5700], fable: [6000, 10000] },
};
const typicalCost = (task, model) => {
  const family = /fable|mythos/.test(model) ? 'fable' : /haiku/.test(model) ? 'haiku' : 'sonnet';
  const [input, output] = TYPICAL[task][family];
  return costUsd(model, input, output) ?? 0;
};

// variants: [{ key, label, mode, model }]; models can be overridden, e.g. { default: 'claude-sonnet-5-6' }.
export function resolveVariants({ withFable = false, models = {} } = {}) {
  const configured = Object.fromEntries(configuredModels().filter((e) => e.where.startsWith('analyze-contract:')).map((e) => [e.where.split(':')[1], e.model]));
  const modes = withFable ? ['default', 'fast', 'deep'] : ['default', 'fast'];
  return modes.map((mode) => ({ key: MODE_LABEL[mode], mode, model: models[mode] || configured[mode], plan: MODE_PLAN[mode] }));
}

export function buildPlan({ tasks = TASKS, langs = {}, variants, fableLangs = ['tr', 'en', 'ar', 'zh'], tool = 'memo' } = {}) {
  const perTask = {
    ask: langs.ask || DEFAULT_ASK_LANGS,
    tools: langs.tools || DEFAULT_TOOLS_LANGS,
    analyze: langs.analyze || DEFAULT_ANALYZE_LANGS,
  };
  const cells = [];
  for (const task of TASKS) {
    if (!tasks.includes(task)) continue;
    for (const lang of perTask[task]) {
      for (const variant of variants) {
        if (variant.mode === 'deep' && !fableLangs.includes(lang)) continue;
        cells.push({ task, lang, variant, tool });
      }
    }
  }
  cells.estimatedUsd = cells.reduce((sum, cell) => sum + typicalCost(cell.task, cell.variant.model), 0);
  return cells;
}

// ---- model access ------------------------------------------------------------------------------------------------------
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One call to the Messages API with the production retry rules: a 400 is retried once without thinking at low effort
// (not for always-thinking models); 429/5xx get one polite retry. Returns usage and timing next to the text.
export async function callMessages({ key, fetchImpl, model, system, userText, maxTokens, profile, timeoutMs = 150_000 }) {
  const started = Date.now();
  let attempt = 0;
  let retried400 = false;
  let usage = { input: 0, output: 0 };
  let last = null;
  for (;;) {
    const params = retried400 ? profile.lowEffortParams() : profile.thinkingParams(model);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let response;
    let data = null;
    try {
      response = await fetchImpl(`${API_BASE}/v1/messages`, {
        method: 'POST',
        headers: anthropicHeaders(key),
        signal: controller.signal,
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: userText }], ...params }),
      });
      data = await response.json().catch(() => null);
    } catch (error) {
      last = { ok: false, status: 0, error: error?.name === 'AbortError' ? 'timeout' : String(error?.message || error) };
    } finally {
      clearTimeout(timer);
    }
    if (response) {
      usage.input += (data?.usage?.input_tokens || 0) + (data?.usage?.cache_creation_input_tokens || 0) + (data?.usage?.cache_read_input_tokens || 0);
      usage.output += data?.usage?.output_tokens || 0;
      if (response.ok) {
        const text = (data?.content || []).filter((b) => b.type === 'text').map((b) => b.text || '').join('');
        return { ok: true, status: response.status, text, usage, stop: data?.stop_reason || '', latencyMs: Date.now() - started, retried400, thinkingBlocks: (data?.content || []).filter((b) => b.type === 'thinking').length };
      }
      last = { ok: false, status: response.status, error: String(data?.error?.message || data?.error || `HTTP ${response.status}`).slice(0, 300) };
      if (response.status === 400 && !retried400 && profile.canRetryLowEffort(model)) {
        retried400 = true;
        continue;
      }
    }
    attempt += 1;
    const transient = !response || response.status === 429 || response.status >= 500;
    if (!transient || attempt >= 2) break;
    await sleep(2000);
  }
  return { ...last, usage, text: '', stop: '', latencyMs: Date.now() - started, retried400, thinkingBlocks: 0 };
}

// ---- checks ------------------------------------------------------------------------------------------------------------
// A check is { name, pass, hard, detail }. A cell passes when every hard check passes; soft checks are warnings.
const hard = (name, pass, detail = '') => ({ name, pass: !!pass, hard: true, detail });
const soft = (name, pass, detail = '') => ({ name, pass: !!pass, hard: false, detail });
const asArray = (value) => (Array.isArray(value) ? value : []);
const norm = (text) => String(text || '').replace(/\s+/g, ' ').trim();
const langOf = (text) => detectLanguage(text).lang;

export function checkAsk({ raw, text, stop, expected, country, answerApi, limits, jurisdictions }) {
  const checks = [];
  checks.push(hard('json', raw && String(raw.short_answer || '').trim(), raw ? 'parsed' : 'no JSON object found'));
  checks.push(hard('complete', stop !== 'max_tokens', stop === 'max_tokens' ? 'hit max_tokens: the answer was cut off' : ''));
  if (!raw) return checks;
  const normalized = answerApi.normalizeLegalAnswer(raw, { country });
  checks.push(hard('app_accepts', normalized && answerApi.isUsableAnswer(normalized), 'utils/legalAnswer.js normalizer'));
  const body = `${raw.short_answer || ''} ${raw.explanation || ''}`;
  const detected = langOf(body);
  checks.push(hard('language', detected === expected, `detected ${detected || 'unknown'}, expected ${expected}`));
  checks.push(soft('enums', ['HIGH', 'MEDIUM', 'LOW'].includes(String(raw.confidence)) && (jurisdictions.includes(String(raw.jurisdiction)) || raw.jurisdiction === 'OTHER'), `confidence=${raw.confidence} jurisdiction=${raw.jurisdiction}`));
  const over = Object.entries(limits).filter(([key, max]) => asArray(raw[key]).length > max).map(([key]) => key);
  checks.push(soft('list_limits', over.length === 0, over.length ? `over the limit: ${over.join(', ')} (the app trims them)` : ''));
  checks.push(soft('jurisdiction_matches', String(raw.jurisdiction || '').toUpperCase() === country, `answered under ${raw.jurisdiction}, user chose ${country}`));
  const droppedSources = asArray(raw.sources).length - (normalized?.sources?.length || 0);
  checks.push(soft('sources_official', droppedSources === 0, droppedSources ? `${droppedSources} source link(s) are not official hosts and the app drops them` : ''));
  checks.push(soft('no_percentages', !/\d+\s*%/.test(body), 'the prompt forbids chances of winning'));
  const dates = asArray(raw.deadlines).filter((d) => /\b20\d\d-\d\d-\d\d\b/.test(`${d?.label} ${d?.rule}`)).length;
  checks.push(soft('no_calendar_dates', dates === 0, dates ? `${dates} deadline(s) contain a computed calendar date` : ''));
  return checks;
}

export function checkTool({ raw, stop, expected, country, planApi, tool }) {
  const checks = [];
  const usableField = tool === 'memo' ? raw?.short_answer : tool === 'issues' ? asArray(raw?.issues).length : asArray(raw?.events).length;
  checks.push(hard('json', raw && usableField, raw ? 'parsed' : 'no JSON object found'));
  checks.push(hard('complete', stop !== 'max_tokens', stop === 'max_tokens' ? 'hit max_tokens: the result was cut off' : ''));
  if (!raw) return checks;
  const normalized = planApi.normalizeToolResult(tool, raw, { country });
  checks.push(hard('app_accepts', normalized && planApi.isUsableToolResult(normalized), 'utils/plan.js normalizer'));
  const sample = tool === 'memo' ? `${raw.short_answer || ''} ${asArray(raw.analysis).map((s) => s?.text).join(' ')}` : JSON.stringify(raw);
  const detected = langOf(tool === 'memo' ? sample : String(sample).replace(/"[a-z_]+":/g, ' '));
  checks.push(hard('language', detected === expected, `detected ${detected || 'unknown'}, expected ${expected}`));
  if (tool === 'memo') {
    const dropped = asArray(raw.authorities).length - asArray(normalized?.authorities).filter((a) => a.url).length;
    checks.push(soft('authorities_official', dropped === 0, dropped ? `${dropped} authority link(s) are not official hosts and the app drops them` : ''));
  }
  return checks;
}

const TRAP_MARKERS = ['tek taraflı', 'takdirine', 'cezai şart', 'onarım', 'önceden haber vermeksizin', 'peşinen', 'yetkilidir', 'gerekçe göstermeksizin'];

export function checkAnalysis({ result, error, expected, contractText, acceptable }) {
  const checks = [];
  checks.push(hard('completed', !!result, error ? `failed: ${error}` : ''));
  if (!result) return checks;
  checks.push(hard('app_accepts', acceptable(result, contractText), 'utils/analysis.js isAcceptableAnalysis'));
  const levels = ['RED', 'YELLOW', 'GREEN'];
  const clauses = asArray(result.clauses);
  const flags = asArray(result.redFlags);
  const enumsOk = levels.includes(result.overallRisk) && ['SIGN', 'NEGOTIATE', 'WALK_AWAY'].includes(result.decision?.action)
    && clauses.every((c) => levels.includes(c?.riskLevel)) && flags.every((f) => levels.includes(f?.severity));
  checks.push(hard('enums', enumsOk, `overallRisk=${result.overallRisk} decision=${result.decision?.action}`));
  checks.push(hard('score', Number(result.score) >= 1 && Number(result.score) <= 100, `score=${result.score}`));
  checks.push(hard('verdict_sane', result.decision?.action !== 'SIGN' && result.overallRisk !== 'GREEN', 'the fixture lease is one-sided: SIGN / GREEN would be a missed risk'));
  const sample = `${result.summary || ''} ${result.decision?.headline || ''}`;
  const detected = langOf(sample);
  checks.push(hard('language', detected === expected, `detected ${detected || 'unknown'}, expected ${expected}`));

  const quotes = [...flags, ...clauses].map((item) => norm(item?.originalText)).filter(Boolean);
  const haystack = norm(contractText);
  const verbatim = quotes.filter((q) => haystack.includes(q.replace(/…$|\.\.\.$/, '').trim())).length;
  checks.push(soft('quotes_verbatim', quotes.length > 0 && verbatim / quotes.length >= 0.8, `${verbatim}/${quotes.length} quotes are exact substrings of the contract`));
  const found = TRAP_MARKERS.filter((marker) => quotes.some((q) => q.toLowerCase().includes(marker))).length;
  checks.push(soft('traps_found', found >= 5, `${found}/${TRAP_MARKERS.length} planted traps are quoted`));
  checks.push(soft('limits', flags.length <= 4 && clauses.length >= 3 && clauses.length <= 5 && asArray(result.missing_protections).length <= 5, `redFlags=${flags.length} clauses=${clauses.length} missing=${asArray(result.missing_protections).length}`));
  const risky = [...flags, ...clauses].filter((i) => (i?.riskLevel || i?.severity) !== 'GREEN');
  const missingOffer = risky.filter((i) => !norm(i?.counterOffer)).length;
  const tooLong = [...flags, ...clauses].filter((i) => norm(i?.counterOffer).length > 400).length;
  checks.push(soft('counter_offers', missingOffer === 0 && tooLong === 0, `${missingOffer} RED/YELLOW item(s) without a counterOffer, ${tooLong} over 400 characters`));
  const placeholders = clauses.filter((c) => /^(n\/a|-|—)?$/i.test(norm(c?.issue))).length;
  checks.push(soft('no_placeholders', placeholders === 0, `${placeholders} clause card(s) with an empty or N/A issue`));
  return checks;
}

// ---- cells -------------------------------------------------------------------------------------------------------------
const summarizeChecks = (checks) => ({
  pass: checks.filter((c) => c.hard).every((c) => c.pass),
  hardFails: checks.filter((c) => c.hard && !c.pass).map((c) => c.name),
  softFails: checks.filter((c) => !c.hard && !c.pass).map((c) => c.name),
});

const excerpt = (value) => norm(value).slice(0, 260);

export async function createBenchmark({ key, fetchImpl = globalThis.fetch, budgetUsd = DEFAULT_BUDGET_USD, log = () => {}, models = {} } = {}) {
  const askParts = loadEdgeParts(EDGE_FILES.ask, ['thinkingParams', 'lowEffortParams', 'canRetryLowEffort', 'MAX_TOKENS', 'buildSystemPrompt', 'buildUserMessage', 'parseJsonObject', 'OFFICIAL_DOMAINS']);
  const toolParts = loadEdgeParts(EDGE_FILES.tools, ['thinkingParams', 'lowEffortParams', 'canRetryLowEffort', 'MAX_TOKENS', 'buildSystemPrompt', 'buildUserMessage', 'parseJsonObject']);

  process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://bench.supabase.co';
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY = 'bench-anon';
  const bearer = `x.${Buffer.from(JSON.stringify({ sub: '00000000-0000-4000-8000-000000000001', role: 'authenticated' })).toString('base64url')}.x`;
  const loader = createAppLoader({
    stubs: {
      'services/supabase': { supabase: { auth: { getSession: async () => ({ data: { session: { access_token: bearer } } }) } } },
      // Headless run: there is no UI to ask; consent is a device-side gate that is covered by verify-ui.
      'services/aiConsent': { AI_CONSENT_REQUIRED: 'AI_CONSENT_REQUIRED', ensureAiConsent: async () => true },
      'services/analysisCache': { getCachedAnalysis: async () => null, setCachedAnalysis: async () => {}, documentCacheToken: () => 'bench' },
    },
  });
  const appAi = loader.load('services/ai.js');
  const appAnalysis = loader.load('utils/analysis.js');
  const answerApi = loader.load('utils/legalAnswer.js');
  const planApi = loader.load('utils/plan.js');
  const limits = { rules: 5, steps: 6, deadlines: 4, documents: 6, risks: 4, sources: 4, missing_facts: 4, follow_ups: 3 };
  const jurisdictions = Object.keys(askParts.OFFICIAL_DOMAINS);

  const state = { spent: 0, skipped: 0 };

  // -- ask / tools --
  const runDirect = async (cell) => {
    const { task, lang, variant } = cell;
    const parts = task === 'ask' ? askParts : toolParts;
    const country = LANG_CASES[lang].country;
    const system = task === 'ask'
      ? parts.buildSystemPrompt({ lang, country, area: 'labor', audience: 'person' })
      : parts.buildSystemPrompt({ tool: cell.tool, lang, country, area: 'labor' });
    const userText = task === 'ask'
      ? parts.buildUserMessage({ question: LANG_CASES[lang].question, facts: '', caseContext: '' })
      : parts.buildUserMessage({ material: toolMaterial(lang), position: TOOL_POSITION });
    const call = await callMessages({ key, fetchImpl, model: variant.model, system, userText, maxTokens: parts.MAX_TOKENS, profile: parts });
    const raw = call.ok ? parts.parseJsonObject(call.text) : null;
    const checks = call.ok
      ? task === 'ask'
        ? checkAsk({ raw, text: call.text, stop: call.stop, expected: lang, country, answerApi, limits, jurisdictions })
        : checkTool({ raw, stop: call.stop, expected: lang, country, planApi, tool: cell.tool })
      : [hard('request', false, `${call.status} ${call.error}`)];
    if (call.retried400) checks.push(soft('no_retry_needed', false, 'the first request got a 400 and only the low-effort retry worked: check the thinking profile'));
    return { call, raw, checks, preview: raw ? excerpt(task === 'ask' ? raw.short_answer : raw.short_answer || JSON.stringify(raw)) : excerpt(call.text || call.error) };
  };

  // -- analyze (full pipeline, one cell at a time because it swaps globalThis.fetch) --
  let edge;
  const bootEdge = () => {
    if (edge) return edge;
    const env = {
      ANTHROPIC_API_KEY: key,
      SUPABASE_URL: 'https://bench.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'bench-service',
      ...(models.default ? { ANALYZE_MODEL_DEFAULT: models.default } : {}),
      ...(models.fast ? { ANALYZE_MODEL_FAST: models.fast } : {}),
      ...(models.deep ? { ANALYZE_MODEL_DEEP: models.deep } : {}),
    };
    edge = transpileEdge(readSource(EDGE_FILES.analyze), env);
    return edge;
  };

  const runAnalyze = async (cell) => {
    const { lang, variant } = cell;
    const server = bootEdge();
    const tally = { input: 0, output: 0, calls: 0, model: '', stop: '', thinking: null };
    const router = async (url, init = {}) => {
      const target = String(url);
      const reply = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
      if (target.startsWith(API_BASE)) {
        const sent = JSON.parse(init.body || '{}');
        const response = await fetchImpl(url, init);
        const data = await response.clone().json().catch(() => null);
        tally.calls += 1;
        tally.model = sent.model || tally.model;
        tally.thinking = sent.thinking || null;
        tally.input += (data?.usage?.input_tokens || 0) + (data?.usage?.cache_creation_input_tokens || 0) + (data?.usage?.cache_read_input_tokens || 0);
        tally.output += data?.usage?.output_tokens || 0;
        tally.stop = data?.stop_reason || tally.stop;
        return response;
      }
      if (target.endsWith('/functions/v1/analyze-contract')) return server.handle(new Request(target, init));
      if (target.includes('/rest/v1/profiles')) return reply(200, [{ is_pro: true, plan: variant.plan }]);
      if (target.endsWith('/rpc/consume_analyze_call')) return reply(200, { allowed: true, used: 1, limit: 400 });
      if (target.endsWith('/rpc/refund_analyze_call') || target.endsWith('/rpc/record_ai_cost')) return reply(200, null);
      throw new Error(`benchmark: unexpected request to ${target}`);
    };
    const realFetch = globalThis.fetch;
    const realWarn = console.warn;
    const started = Date.now();
    let result = null;
    let error = '';
    globalThis.fetch = router;
    console.warn = () => {}; // the app logs its own (Turkish) diagnostics; the cell's error code is reported instead
    try {
      result = await appAi.analyzeContract(CONTRACT_TEXT, CONTRACT_TYPE, lang, variant.mode, {
        country: CONTRACT_COUNTRY, party: CONTRACT_PARTY, category: CONTRACT_CATEGORY, timeoutMs: 170_000,
      });
    } catch (caught) {
      error = `${caught?.code || caught?.name || 'error'}: ${String(caught?.detail || caught?.message || caught).slice(0, 200)}`;
    } finally {
      globalThis.fetch = realFetch;
      console.warn = realWarn;
      await server.settle();
    }
    const checks = checkAnalysis({ result, error, expected: lang, contractText: CONTRACT_TEXT, acceptable: appAnalysis.isAcceptableAnalysis });
    if (result && tally.model && tally.model !== variant.model) checks.push(hard('model_served', false, `mode ${variant.mode} was served by ${tally.model}, expected ${variant.model}`));
    const call = {
      ok: !!result, usage: { input: tally.input, output: tally.output }, stop: tally.stop, latencyMs: Date.now() - started,
      retried400: false, thinkingBlocks: 0, status: result ? 200 : 0, error, calls: tally.calls, servedModel: tally.model, thinking: tally.thinking,
    };
    return { call, raw: result, checks, preview: excerpt(result?.summary || error) };
  };

  const run = async (cell) => {
    const model = cell.variant.model;
    const estimate = typicalCost(cell.task, model);
    if (state.spent + estimate > budgetUsd) {
      state.skipped += 1;
      return { ...cell, skipped: 'budget', costUsd: 0 };
    }
    const outcome = cell.task === 'analyze' ? await runAnalyze(cell) : await runDirect(cell);
    const billedModel = outcome.call.servedModel || model;
    const cost = costUsd(billedModel, outcome.call.usage.input, outcome.call.usage.output);
    state.spent += cost ?? 0;
    const summary = summarizeChecks(outcome.checks);
    log(`${summary.pass ? 'ok  ' : 'FAIL'} ${cell.task.padEnd(7)} ${cell.lang} ${cell.variant.key.padEnd(7)} ${String(outcome.call.latencyMs).padStart(6)} ms  in=${outcome.call.usage.input} out=${outcome.call.usage.output} $${(cost ?? 0).toFixed(4)}${summary.hardFails.length ? '  hard: ' + summary.hardFails.join(',') : ''}`);
    return {
      task: cell.task, lang: cell.lang, variant: cell.variant.key, model: billedModel, mode: cell.variant.mode, tool: cell.task === 'tools' ? cell.tool : undefined,
      ...summary, checks: outcome.checks, latencyMs: outcome.call.latencyMs, input: outcome.call.usage.input, output: outcome.call.usage.output,
      stop: outcome.call.stop, thinkingBlocks: outcome.call.thinkingBlocks, retried400: outcome.call.retried400, costUsd: cost,
      preview: outcome.preview, raw: outcome.raw,
    };
  };

  // ask / tools run in parallel (independent requests); analyze runs one at a time afterwards.
  const execute = async (cells, { concurrency = 3 } = {}) => {
    const direct = cells.filter((cell) => cell.task !== 'analyze');
    const analysis = cells.filter((cell) => cell.task === 'analyze');
    const results = [];
    let next = 0;
    const worker = async () => {
      while (next < direct.length) {
        const cell = direct[next++];
        results.push(await run(cell));
      }
    };
    await Promise.all(Array.from({ length: Math.max(1, Math.min(concurrency, direct.length)) }, worker));
    for (const cell of analysis) results.push(await run(cell));
    const order = (r) => [TASKS.indexOf(r.task), LANGS.indexOf(r.lang), r.variant];
    return results.sort((a, b) => { const x = order(a); const y = order(b); return x[0] - y[0] || x[1] - y[1] || String(x[2]).localeCompare(String(y[2])); });
  };

  return { execute, state, askParts, toolParts, limits };
}

// ---- reporting ---------------------------------------------------------------------------------------------------------
export function summarize(results) {
  const groups = {};
  for (const r of results.filter((x) => !x.skipped)) {
    const g = (groups[`${r.task}|${r.variant}`] ||= { task: r.task, variant: r.variant, model: r.model, cells: 0, passed: 0, hardFails: {}, softFails: {}, ms: 0, usd: 0, input: 0, output: 0 });
    g.cells += 1;
    g.passed += r.pass ? 1 : 0;
    g.ms += r.latencyMs;
    g.usd += r.costUsd || 0;
    g.input += r.input;
    g.output += r.output;
    for (const name of r.hardFails) g.hardFails[name] = (g.hardFails[name] || 0) + 1;
    for (const name of r.softFails) g.softFails[name] = (g.softFails[name] || 0) + 1;
  }
  return Object.values(groups).map((g) => ({ ...g, avgMs: Math.round(g.ms / g.cells), avgUsd: g.usd / g.cells, avgInput: Math.round(g.input / g.cells), avgOutput: Math.round(g.output / g.cells) }));
}

export function renderMarkdown(results, { budgetUsd, spent, startedAt }) {
  const rows = summarize(results);
  const lines = [`# Model A/B ${startedAt}`, '', `Spent $${spent.toFixed(3)} of the $${budgetUsd.toFixed(2)} budget. Skipped for budget: ${results.filter((r) => r.skipped).length}.`, ''];
  lines.push('| task | variant | model | pass | avg ms | avg in | avg out | $/call | hard fails | soft fails |', '|---|---|---|---|---|---|---|---|---|---|');
  for (const g of rows) {
    lines.push(`| ${g.task} | ${g.variant} | ${g.model} | ${g.passed}/${g.cells} | ${g.avgMs} | ${g.avgInput} | ${g.avgOutput} | $${g.avgUsd.toFixed(4)} | ${JSON.stringify(g.hardFails)} | ${JSON.stringify(g.softFails)} |`);
  }
  for (const task of TASKS) {
    const taskResults = results.filter((r) => r.task === task && !r.skipped);
    if (!taskResults.length) continue;
    lines.push('', `## ${task}: per language (ok = every hard check passed, ! = soft warnings only is shown as ok!, X = a hard check failed)`, '');
    const variants = [...new Set(taskResults.map((r) => r.variant))];
    lines.push(`| lang | ${variants.join(' | ')} |`, `|---|${variants.map(() => '---').join('|')}|`);
    for (const lang of LANGS) {
      const cols = variants.map((variant) => {
        const r = taskResults.find((x) => x.lang === lang && x.variant === variant);
        return r ? (r.pass ? (r.softFails.length ? `ok! ${r.softFails.join(',')}` : 'ok') : `X ${r.hardFails.join(',')}`) : '-';
      });
      if (cols.some((c) => c !== '-')) lines.push(`| ${lang} | ${cols.join(' | ')} |`);
    }
    lines.push('', `### ${task}: first lines to read yourself (the checks cannot judge legal quality)`, '');
    for (const lang of [...new Set(taskResults.map((r) => r.lang))]) {
      lines.push(`**${lang}**`);
      for (const r of taskResults.filter((x) => x.lang === lang)) lines.push(`- ${r.variant}: ${r.preview}`);
      lines.push('');
    }
  }
  return lines.join('\n');
}

export const priceOf = (model) => PRICE[model];
