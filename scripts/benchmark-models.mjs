// WAVE ECON.4: 13-language A/B of the Claude models behind ContractShield (default Sonnet 5.5 vs fast Haiku 5.5, Fable 5.1 opt-in).
// It runs the real prompts and the real scan pipeline (see scripts/lib/benchmark.mjs), judges every answer with the app's own
// parsers plus language / schema / quote checks, prices every call from the usage the API returns and stops at a hard budget.
//
//   $env:ANTHROPIC_API_KEY = "sk-ant-..."; npm run test:ab                  (default: about $0.9, hard stop at $1, a few minutes)
//   npm run test:ab -- --dry-run                                           (no key, no cost: prints the plan and the estimate)
//   npm run test:ab -- --tasks ask --langs tr,en,ar                        (one task, chosen languages; "--langs all" = all 13)
//   npm run test:ab -- --with-fable --budget 3                             (adds Fable 5.1 on --fable-langs, default tr,en)
//
// Options: --tasks ask,tools,analyze   --langs <list|all>   --ask-langs / --tools-langs / --analyze-langs <list|all>
//          --with-fable   --fable-langs <list>   --budget <usd, default 1>   --tool memo|issues|chronology   --concurrency <n>
//          --default-model / --fast-model / --deep-model <id>   (try another model id in a slot)   --out <dir>   --dry-run
//
// Output: a console line per call, then scripts/.ab-output/ab-<time>.md (read this) and .json (raw answers). Exit code 1 if
// any HARD check failed (JSON, truncation, app acceptance, language, enums, verdict). Soft checks are warnings.
// The key is read from the environment only and is never printed or written.
import fs from 'fs';
import path from 'path';
import {
  ALL_LANGS, DEFAULT_ANALYZE_LANGS, DEFAULT_ASK_LANGS, DEFAULT_BUDGET_USD, DEFAULT_TOOLS_LANGS, TASKS,
  buildPlan, createBenchmark, renderMarkdown, resolveVariants, summarize,
} from './lib/benchmark.mjs';
import { requireKey } from './lib/claude.mjs';

const argv = process.argv.slice(2);
const opts = {};
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (!arg.startsWith('--')) continue;
  const [name, inline] = arg.slice(2).split('=');
  const next = argv[i + 1];
  if (inline !== undefined) opts[name] = inline;
  else if (next !== undefined && !next.startsWith('--')) { opts[name] = next; i++; }
  else opts[name] = true;
}

const fail = (message) => { console.log(message); process.exit(2); };
const list = (value, fallback) => {
  if (value === undefined) return fallback;
  if (value === 'all') return ALL_LANGS;
  const langs = String(value).split(',').map((s) => s.trim()).filter(Boolean);
  const bad = langs.filter((l) => !ALL_LANGS.includes(l));
  if (bad.length) fail(`Unknown language code(s): ${bad.join(', ')}. Use: ${ALL_LANGS.join(', ')} or "all".`);
  return langs;
};
const tasks = opts.tasks ? String(opts.tasks).split(',').map((s) => s.trim()) : TASKS;
if (tasks.some((t) => !TASKS.includes(t))) fail(`Unknown task. Use: ${TASKS.join(', ')}`);
const tool = String(opts.tool || 'memo');
if (!['memo', 'issues', 'chronology'].includes(tool)) fail('--tool must be memo, issues or chronology');
const budget = opts.budget === undefined ? DEFAULT_BUDGET_USD : Number(opts.budget);
if (!(budget > 0)) fail('--budget must be a positive number of US dollars');
const concurrency = opts.concurrency === undefined ? 3 : Math.max(1, Math.min(6, Number(opts.concurrency) || 3));

const all = list(opts.langs, undefined);
const langs = {
  ask: list(opts['ask-langs'], all || DEFAULT_ASK_LANGS),
  tools: list(opts['tools-langs'], all || DEFAULT_TOOLS_LANGS),
  analyze: list(opts['analyze-langs'], all || DEFAULT_ANALYZE_LANGS),
};
const models = {};
if (typeof opts['default-model'] === 'string') models.default = opts['default-model'];
if (typeof opts['fast-model'] === 'string') models.fast = opts['fast-model'];
if (typeof opts['deep-model'] === 'string') models.deep = opts['deep-model'];

const variants = resolveVariants({ withFable: !!opts['with-fable'], models });
const plan = buildPlan({ tasks, langs, variants, fableLangs: list(opts['fable-langs'], ['tr', 'en']), tool });

console.log(`Plan: ${plan.length} calls  (${variants.map((v) => `${v.key}=${v.model}`).join(', ')})`);
for (const task of tasks) {
  const cells = plan.filter((c) => c.task === task);
  console.log(`  ${task.padEnd(8)} ${cells.length} calls  languages: ${[...new Set(cells.map((c) => c.lang))].join(' ')}`);
}
console.log(`Estimated cost ~$${plan.estimatedUsd.toFixed(2)}, hard stop at $${budget.toFixed(2)}.`);

if (opts['dry-run']) {
  // Builds every prompt it would send, so a broken edge-function slice or fixture fails here, without a key.
  const bench = await createBenchmark({ key: 'dry-run', fetchImpl: async () => { throw new Error('dry run never calls the network'); }, budgetUsd: budget });
  let prompts = 0;
  for (const cell of plan.filter((c) => c.task !== 'analyze')) {
    const parts = cell.task === 'ask' ? bench.askParts : bench.toolParts;
    const system = cell.task === 'ask'
      ? parts.buildSystemPrompt({ lang: cell.lang, country: 'TR', area: 'labor', audience: 'person' })
      : parts.buildSystemPrompt({ tool: cell.tool, lang: cell.lang, country: 'TR', area: 'labor' });
    if (!system.includes('OUTPUT LANGUAGE (STRICT)')) fail(`dry run: ${cell.task}/${cell.lang} prompt lost its language rule`);
    prompts++;
  }
  console.log(`Dry run OK: ${prompts} prompts built from the Edge Function sources, nothing sent.`);
  process.exit(0);
}

const key = requireKey();
const startedAt = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const bench = await createBenchmark({ key, budgetUsd: budget, log: (line) => console.log(line), models });
const results = await bench.execute(plan, { concurrency });

const outDir = path.resolve(String(opts.out || 'scripts/.ab-output'));
fs.mkdirSync(outDir, { recursive: true });
const base = path.join(outDir, `ab-${startedAt}`);
fs.writeFileSync(`${base}.md`, renderMarkdown(results, { budgetUsd: budget, spent: bench.state.spent, startedAt }));
fs.writeFileSync(`${base}.json`, JSON.stringify({ startedAt, budget, spent: bench.state.spent, variants, results }, null, 2));

console.log('\nTask      variant  model                pass   avg ms  avg in  avg out   $/call   hard fails');
for (const g of summarize(results)) {
  console.log(`${g.task.padEnd(9)} ${g.variant.padEnd(8)} ${g.model.padEnd(20)} ${`${g.passed}/${g.cells}`.padStart(5)} ${String(g.avgMs).padStart(8)} ${String(g.avgInput).padStart(7)} ${String(g.avgOutput).padStart(8)}  $${g.avgUsd.toFixed(4)}   ${JSON.stringify(g.hardFails)}`);
}
const skipped = results.filter((r) => r.skipped).length;
console.log(`\nSpent $${bench.state.spent.toFixed(3)} of $${budget.toFixed(2)}${skipped ? `; ${skipped} call(s) skipped to stay inside the budget (raise --budget or narrow --langs)` : ''}.`);
console.log(`Read: ${base}.md   (raw answers: ${base}.json)`);
process.exit(results.some((r) => !r.skipped && !r.pass) ? 1 : 0);
