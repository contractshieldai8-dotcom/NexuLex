// WAVE ECON.4: offline test of the model tools. No key, no network, no cost: Anthropic is replaced by a scripted fake,
// and the REAL benchmark engine, the REAL Edge Function handler and the REAL app sources run against it.
// Covers: language detector, price table, plan builder, capability judge, pass/fail checks (good and broken answers),
// the 400-retry rule, the budget stop and the in-process scan pipeline (default / fast / deep model routing).
// Run: npm run test:benchmark
import { evaluateCapabilities, worst } from './lib/capabilities.mjs';
import { LANG_CASES, LANGS, CONTRACT_TEXT } from './lib/ab-fixtures.mjs';
import { createBenchmark, buildPlan, resolveVariants, summarize, renderMarkdown } from './lib/benchmark.mjs';
import { PRICE, configuredModels, costUsd, loadProfile } from './lib/claude.mjs';
import { detectLanguage } from './lib/lang-detect.mjs';

let pass = 0;
let fail = 0;
const ok = (cond, msg) => {
  if (cond) pass++;
  else {
    fail++;
    console.log('FAIL', msg);
  }
};

// ---- 1. language detector ------------------------------------------------------------------------------------------------
ok(LANGS.length === 13 && Object.keys(LANG_CASES).length === 13 && LANGS.every((l) => LANG_CASES[l]?.question?.length >= 40), 'fixtures cover exactly the 13 app languages');
for (const lang of LANGS) ok(detectLanguage(LANG_CASES[lang].question).lang === lang, `detector recognises the ${lang} fixture`);
ok(detectLanguage('ok').lang === null, 'too little text is "unknown", not a guess');
ok(detectLanguage('Tiene derecho a cobrar el salario atrasado y también una indemnización por el despido.').lang === 'es', 'Spanish is not Portuguese');
ok(detectLanguage('Você tem direito a receber o salário atrasado e também uma indenização pela demissão.').lang === 'pt', 'Portuguese is not Spanish');
ok(detectLanguage('这是一个关于劳动合同和工资赔偿的法律问题，请先保存所有证据。').lang === 'zh', 'Chinese is not Japanese');

// ---- 2. price table ---------------------------------------------------------------------------------------------------------
const models = configuredModels();
ok(models.length === 6 && models.every((m) => PRICE[m.model]), 'every model the functions use is in the price table');
ok(models.find((m) => m.where === 'legal-ask:free')?.model === 'claude-haiku-5-5' && models.find((m) => m.where === 'legal-ask:default')?.model === 'claude-sonnet-5-5', 'free questions run on Haiku 5.5, paid questions on Sonnet 5.5');
ok(Math.abs(costUsd('claude-sonnet-5-5', 1_000_000, 100_000) - 3) < 1e-9, 'Sonnet 5.5: $2 in + $10 out per million');
ok(Math.abs(costUsd('claude-haiku-5-5', 1000, 1000) - 0.0006) < 1e-12, 'Haiku 5.5 short call');
ok(Math.abs(costUsd('claude-haiku-5-5', 200_000, 1000) - (200_000 * 0.5 + 1000 * 2.5) / 1e6) < 1e-12, 'Haiku 5.5 above 100k input tokens is billed at the long-context rate');
ok(costUsd('claude-unknown', 1, 1) === null, 'unknown model has no price');

// ---- 3. plan builder --------------------------------------------------------------------------------------------------------
const variants = resolveVariants();
ok(variants.map((v) => v.key).join() === 'sonnet,haiku' && variants[0].model === 'claude-sonnet-5-5' && variants[1].model === 'claude-haiku-5-5', 'default variants come from the edge function model map');
const plan = buildPlan({ variants });
ok(plan.length === 13 * 2 + 3 * 2 + 4 * 2, 'default plan: ask x13, tools x3, analyze x4, each for two models');
ok(plan.estimatedUsd > 0.4 && plan.estimatedUsd < 0.95, 'default plan is estimated under one dollar with a margin (the budget stop is the safety net)');
const withFable = buildPlan({ variants: resolveVariants({ withFable: true }), fableLangs: ['tr'] });
ok(withFable.filter((c) => c.variant.key === 'fable').length === 3 && withFable.every((c) => c.variant.key !== 'fable' || c.lang === 'tr'), 'Fable only runs on the languages you list');
ok(resolveVariants({ models: { fast: 'claude-haiku-9' } })[1].model === 'claude-haiku-9', 'a model slot can be overridden');

// ---- 4. capability judge ------------------------------------------------------------------------------------------------------
const profile = loadProfile();
const rec = ({ capabilities = {}, ...over } = {}) => ({
  lifecycle: 'active', retires_at: null, max_tokens: 64000, max_input_tokens: 1_000_000, display_name: 'X',
  capabilities: {
    image_input: { supported: true }, pdf_input: { supported: true }, structured_outputs: { supported: true },
    effort: { supported: true, low: { supported: true }, medium: { supported: true }, high: { supported: true }, max: { supported: true } },
    thinking: { supported: true, types: { adaptive: { supported: true }, disabled: { supported: true }, enabled: { supported: true } } },
    ...capabilities,
  },
  ...over,
});
const needs = { textChars: 400_000, maxTokens: 16384 };
const verdict = (model, info, roles = ['analyze-contract:default']) => worst(evaluateCapabilities(model, info, profile.thinkingParams(model), roles, needs));
ok(verdict('claude-haiku-5-5', rec()) === 'ok', 'Haiku 5.5 with disabled thinking supported is fine');
ok(verdict('claude-haiku-5-5', rec({ capabilities: { thinking: { supported: true, types: { disabled: { supported: false }, adaptive: { supported: true } } } } })) === 'fail', 'sending "disabled" to a model that refuses it is a failure');
ok(verdict('claude-sonnet-5-5', rec({ capabilities: { thinking: { supported: true, types: { disabled: { supported: false }, adaptive: { supported: true } } } } })) === 'ok', 'Sonnet 5.5: "disabled" refused is exactly why between_tools is used');
ok(verdict('claude-sonnet-5-5', rec()) === 'warn', 'Sonnet 5.5 accepting "disabled" again means the profile can be simplified (warn)');
ok(verdict('claude-fable-5-1', rec({ capabilities: { thinking: { supported: true, types: { disabled: { supported: false }, adaptive: { supported: false } } } } })) === 'fail', 'Fable without adaptive thinking fails');
ok(verdict('claude-fable-5-1', rec({ capabilities: { effort: { supported: true, low: { supported: false } } } })) === 'fail', 'effort "low" must be supported where it is sent');
ok(verdict('claude-haiku-5-5', rec({ lifecycle: 'retired' })) === 'fail', 'a retired model fails');
ok(verdict('claude-haiku-5-5', rec({ lifecycle: 'deprecated', retires_at: '2027-01-01T00:00:00Z' })) === 'warn', 'a deprecated model warns');
ok(verdict('claude-haiku-5-5', rec({ capabilities: { image_input: { supported: false } } })) === 'fail', 'a scanner model without image input fails');
ok(verdict('claude-haiku-5-5', rec({ capabilities: { pdf_input: { supported: false } } }), ['legal-ask:default']) === 'ok', 'text-only functions do not need PDF support');
ok(verdict('claude-haiku-5-5', rec({ max_tokens: 8000 })) === 'fail', 'output cap below the app maximum fails');
ok(verdict('claude-haiku-5-5', rec({ max_input_tokens: 50_000 })) === 'warn', 'a small context window warns');
ok(worst(evaluateCapabilities('claude-haiku-5-5', null, {}, [], needs)) === 'fail', 'no record is a failure');
ok(verdict('claude-haiku-9', rec()) === 'warn', 'a model missing from the price table warns');

// ---- 5. scripted Anthropic ----------------------------------------------------------------------------------------------------
const LANG_BY_NAME = [[/Turkish/, 'tr'], [/English/, 'en'], [/German/, 'de'], [/French/, 'fr'], [/Spanish/, 'es'], [/Arabic/, 'ar'], [/Italian/, 'it'], [/Chinese/, 'zh'], [/Russian/, 'ru'], [/Persian/, 'fa'], [/Japanese/, 'ja'], [/Portuguese/, 'pt'], [/Dutch/, 'nl']];
const langOfSystem = (system) => {
  const line = (system.match(/OUTPUT LANGUAGE \(STRICT\): ([^\n]*)/) || [])[1] || '';
  return (LANG_BY_NAME.find(([re]) => re.test(line)) || [])[1] || 'en';
};
const quote = (needle) => CONTRACT_TEXT.split('\n').find((line) => line.includes(needle)).replace(/^\d+\.\d+\.\s*/, '').trim();
const card = (needle, level, title) => ({
  clauseTitle: title, originalText: quote(needle), riskLevel: level, issue: 'Risk, scenario and next step for the tenant.', legalReference: '',
  counterOffer: 'Propose a balanced replacement.', counterOffers: { balanced: 'Balanced.', shield: 'Shield.', fast: 'Fast.' },
});
const flag = (needle, title) => ({ title, severity: 'RED', explanation: 'Why it is unfair.', legalReference: '', originalText: quote(needle), counterOffer: 'Balanced.', counterOffers: { balanced: 'Balanced.', shield: 'Shield.', fast: 'Fast.' } });
const analysisFor = (lang, over = {}) => ({
  summary: LANG_CASES[lang].question, overallRisk: 'RED', score: 31,
  jurisdiction: { country: 'Türkiye', governingLaw: 'TBK', detectedLanguage: 'Turkish', confidence: 'HIGH' }, detected_contract_category: 'rent',
  redFlags: [flag('tek taraflı', 'Rent'), flag('önceden haber vermeksizin', 'Entry'), flag('peşinen', 'Waiver'), flag('gerekçe göstermeksizin', 'Termination')],
  clauses: [card('takdirine', 'RED', 'Deposit'), card('ayrıca 3 aylık', 'RED', 'Penalty'), card('onarım', 'YELLOW', 'Repairs'), card('yetkilidir', 'YELLOW', 'Venue'), card('Aylık kira bedeli', 'GREEN', 'Rent')].map((c) => (c.riskLevel === 'GREEN' ? { ...c, counterOffer: '', counterOffers: undefined } : c)),
  decision: { action: 'NEGOTIATE', headline: LANG_CASES[lang].question, reasons: ['One', 'Two', 'Three'], estimatedHarm: 'High.' },
  trap_calendar: { termination: { date_or_rule: '30 days written notice', note: '' }, confidentiality: { date_or_rule: 'UNSPECIFIED', note: '' }, return_or_refund: { date_or_rule: 'UNSPECIFIED', note: '' } },
  missing_protections: [{ playbookId: 'rent_deposit', status: 'ABSENT', statute: '', whyItHurts: 'No deposit return date.', insertClause: 'Return within 30 days.', severity: 'HIGH' }],
  ...over,
});
const askFor = (lang, country, over = {}) => ({
  jurisdiction: country, jurisdiction_note: 'Applies the selected country.', short_answer: LANG_CASES[lang].question, explanation: LANG_CASES[lang].question,
  rules: [{ title: LANG_CASES[lang].question, detail: LANG_CASES[lang].question, citation: '' }], steps: ['a', 'b', 'c'], deadlines: [{ label: 'Claim', rule: 'Two weeks from receipt' }],
  documents: ['Contract'], risks: ['Risk'], sources: [], lawyer_when: 'When the employer refuses.', missing_facts: [], follow_ups: ['Next?'], confidence: 'MEDIUM', ...over,
});
const memoFor = (lang, over = {}) => ({
  jurisdiction_note: 'Selected country.', question: 'q', short_answer: LANG_CASES[lang].question,
  analysis: [{ heading: 'h', text: LANG_CASES[lang].question }], authorities: [], open_questions: ['q'], next_steps: ['s'], ...over,
});

// scenario: how the fake behaves; seen: every request body it received.
const scenario = { ask: 'good', tools: 'good', analyze: 'good', failFirstWithThinking: false };
const seen = [];
const fakeAnthropic = async (url, init) => {
  const body = JSON.parse(init.body);
  seen.push(body);
  const reply = (status, data) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json' } });
  const usage = { input_tokens: 2000, output_tokens: 1000 };
  const kind = body.system.includes('legal information engine') ? 'ask' : body.system.includes('NexuLex AI Professional') ? 'tools' : 'analyze';
  const lang = langOfSystem(body.system);
  const country = (body.system.match(/\(([A-Z]{2})\)\. (?:Answer|Work)/) || [])[1] || 'TR';
  if (scenario.failFirstWithThinking && body.thinking) return reply(400, { error: { message: 'thinking type not accepted' } });
  const mode = scenario[kind];
  if (mode === 'http500') return reply(500, { error: { message: 'boom' } });
  const objects = {
    ask: askFor(lang, country, mode === 'noshort' ? { short_answer: '' } : {}),
    tools: memoFor(lang),
    analyze: analysisFor(lang, mode === 'sign' ? { decision: { action: 'SIGN', headline: LANG_CASES[lang].question, reasons: ['x'], estimatedHarm: 'x' }, overallRisk: 'GREEN' } : {}),
  };
  let text = JSON.stringify(objects[kind]);
  if (mode === 'badjson') text = 'Sorry, I cannot answer that.';
  if (mode === 'english') text = JSON.stringify(kind === 'ask' ? askFor('en', country) : kind === 'tools' ? memoFor('en') : analysisFor('en'));
  return reply(200, { content: [{ type: 'text', text }], usage, stop_reason: mode === 'truncated' ? 'max_tokens' : 'end_turn', model: body.model });
};

const bench = await createBenchmark({ key: 'sk-test', fetchImpl: fakeAnthropic, budgetUsd: 5 });

// ---- 6. a clean full run ------------------------------------------------------------------------------------------------------
const cleanPlan = buildPlan({ variants: resolveVariants({ withFable: true }), fableLangs: ['tr'], langs: { ask: LANGS, tools: ['tr', 'ar'], analyze: ['tr', 'zh'] } });
const clean = await bench.execute(cleanPlan);
ok(clean.length === cleanPlan.length && clean.every((r) => !r.skipped), 'every planned call ran');
ok(clean.every((r) => r.pass), `all ${clean.length} scripted good answers pass every hard check: ${clean.filter((r) => !r.pass).map((r) => `${r.task}/${r.lang}/${r.variant}:${r.hardFails}`).join(' ')}`);
ok(clean.filter((r) => r.task === 'ask').length === 13 * 2 + 1, 'ask ran in all 13 languages for both models, plus Fable on tr');
const byModel = (task, variant) => clean.filter((r) => r.task === task && r.variant === variant);
ok(byModel('analyze', 'sonnet').every((r) => r.model === 'claude-sonnet-5-5') && byModel('analyze', 'haiku').every((r) => r.model === 'claude-haiku-5-5') && byModel('analyze', 'fable').every((r) => r.model === 'claude-fable-5-1'), 'scan modes default / fast / deep are served by Sonnet / Haiku / Fable through the real edge handler');
const analyzeBodies = seen.filter((b) => !b.system.includes('legal information engine') && !b.system.includes('Professional'));
ok(analyzeBodies.some((b) => b.model === 'claude-sonnet-5-5' && b.thinking?.type === 'between_tools'), 'scan on Sonnet 5.5 sends between_tools');
ok(analyzeBodies.some((b) => b.model === 'claude-haiku-5-5' && b.thinking?.type === 'disabled'), 'scan on Haiku 5.5 sends disabled thinking');
ok(analyzeBodies.some((b) => b.model === 'claude-fable-5-1' && b.thinking?.type === 'adaptive' && b.output_config?.effort === 'low'), 'scan on Fable 5.1 sends adaptive thinking at low effort');
ok(seen.every((b) => !('temperature' in b) && !('top_p' in b) && !('top_k' in b)), 'no sampling parameters are ever sent');
const sonnetAsk = byModel('ask', 'sonnet')[0];
ok(Math.abs(sonnetAsk.costUsd - costUsd('claude-sonnet-5-5', 2000, 1000)) < 1e-12 && sonnetAsk.input === 2000 && sonnetAsk.output === 1000, 'cost is priced from the usage the API returns');
const summary = summarize(clean);
ok(summary.length === 9 && summary.every((g) => g.passed === g.cells), 'summary: 3 tasks x 3 models, all passing');
const md = renderMarkdown(clean, { budgetUsd: 5, spent: bench.state.spent, startedAt: 'test' });
ok(/\| ask \| sonnet \|/.test(md) && /\*\*tr\*\*/.test(md) && /## analyze/.test(md), 'markdown report has the table and the review excerpts');
ok(Math.abs(bench.state.spent - clean.reduce((s, r) => s + r.costUsd, 0)) < 1e-12, 'the budget tracker equals the sum of the calls');

// ---- 7. broken answers are caught --------------------------------------------------------------------------------------------
const one = (task, lang, key = 'sonnet') => buildPlan({ tasks: [task], variants: resolveVariants({ withFable: true }).filter((v) => v.key === key), langs: { [task]: [lang] } });
const runOne = async (task, mode, lang = 'de', key = 'sonnet') => {
  scenario[task] = mode;
  const [r] = await bench.execute(one(task, lang, key));
  scenario[task] = 'good';
  return r;
};
let r = await runOne('ask', 'badjson');
ok(!r.pass && r.hardFails.includes('json'), 'ask: no JSON is a hard failure');
r = await runOne('ask', 'truncated');
ok(!r.pass && r.hardFails.includes('complete'), 'ask: stop_reason max_tokens is a hard failure');
r = await runOne('ask', 'english');
ok(!r.pass && r.hardFails.includes('language'), 'ask: answering in English to a German user is a hard failure');
r = await runOne('ask', 'noshort');
ok(!r.pass && r.hardFails.includes('app_accepts') || !r.pass && r.hardFails.includes('json'), 'ask: an empty short answer is refused');
r = await runOne('ask', 'http500');
ok(!r.pass && r.hardFails.includes('request'), 'ask: an HTTP 500 is reported as a failed request (after one retry)');
r = await runOne('tools', 'english', 'ja');
ok(!r.pass && r.hardFails.includes('language'), 'tools: wrong language is a hard failure');
r = await runOne('tools', 'truncated', 'tr');
ok(!r.pass && r.hardFails.includes('complete'), 'tools: truncated result is a hard failure');
r = await runOne('analyze', 'english', 'ja');
ok(!r.pass && r.hardFails.includes('language'), 'analyze: wrong language is a hard failure');
r = await runOne('analyze', 'sign', 'tr');
ok(!r.pass && r.hardFails.includes('verdict_sane'), 'analyze: recommending SIGN on the one-sided lease is a hard failure');
r = await runOne('analyze', 'badjson', 'tr');
ok(!r.pass && r.hardFails.includes('completed'), 'analyze: an unparsable scan answer is a hard failure, not a crash');
ok(scenario.analyze === 'good' && globalThis.fetch !== fakeAnthropic, 'the global fetch is restored after every scan');

// the 400 retry: production retries once without thinking at low effort, and the benchmark flags that as a soft finding.
scenario.failFirstWithThinking = true;
seen.length = 0;
[r] = await bench.execute(one('ask', 'tr', 'sonnet'));
scenario.failFirstWithThinking = false;
ok(r.pass && r.retried400 && r.softFails.includes('no_retry_needed'), 'a 400 on the thinking field is retried like production and reported');
ok(seen.length === 2 && seen[0].thinking && !seen[1].thinking && seen[1].output_config?.effort === 'low', 'the retry drops the thinking field and uses low effort');
scenario.failFirstWithThinking = true;
seen.length = 0;
[r] = await bench.execute(one('ask', 'tr', 'fable'));
scenario.failFirstWithThinking = false;
ok(!r.pass && seen.length === 1, 'Fable (always thinking) is not retried without thinking');

// ---- 8. budget stop -------------------------------------------------------------------------------------------------------------
const tight = await createBenchmark({ key: 'sk-test', fetchImpl: fakeAnthropic, budgetUsd: 0.03 });
const tightResults = await tight.execute(buildPlan({ tasks: ['ask'], variants: resolveVariants(), langs: { ask: LANGS } }), { concurrency: 1 });
ok(tightResults.some((x) => x.skipped === 'budget') && tight.state.spent <= 0.03 + 1e-9, 'the budget is a hard stop: later calls are skipped, never overspent');
ok(tightResults.filter((x) => !x.skipped).length >= 1, 'calls inside the budget still ran');

console.log(fail ? `${fail} failed, ${pass} passed` : `OK  ${pass} model-tool checks passed`);
process.exit(fail ? 1 : 0);
