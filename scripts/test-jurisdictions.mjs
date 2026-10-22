// Offline test: every selectable country is wired end to end, and the device-locale suggestion is sane.
//   node scripts/test-jurisdictions.mjs
import fs from 'fs';
import { createAppLoader } from './lib/app-modules.mjs';

const loader = createAppLoader();
const { JURISDICTIONS } = loader.load('constants/options.js');
const { suggestJurisdictionFor } = loader.load('utils/jurisdictionSuggest.js');
const { JURISDICTION_PACKS } = loader.load('constants/jurisdictionPacks.js');
const { OFFICIAL_SOURCES } = loader.load('utils/legalAnswer.js');

let cases = 0;
const failures = [];
const eq = (actual, expected, label) => {
  cases += 1;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) failures.push(`${label}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
};
const ok = (cond, label) => {
  cases += 1;
  if (!cond) failures.push(label);
};

const read = (p) => fs.readFileSync(p, 'utf8');
const ai = read('services/ai.js');
const profiles = (ai.match(/const JURISDICTION_PROFILES = \{([\s\S]*?)\n\};/) || [])[1] || '';
const askFn = read('supabase/functions/legal-ask/index.ts');
const toolsFn = read('supabase/functions/pro-tools/index.ts');
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const bundles = Object.fromEntries(langs.map((l) => [l, JSON.parse(read(`locales/bundles/${l}.json`))]));

// 1. Every concrete jurisdiction has a prompt profile, a pack, an official source, a server allowlist and 13 labels.
for (const item of JURISDICTIONS.filter((j) => j.code !== 'auto')) {
  const code = item.code;
  ok(new RegExp(`\\n  ${code}: ["']`).test(profiles), `${code}: missing JURISDICTION_PROFILES entry`);
  ok(!!JURISDICTION_PACKS[code] || code === 'CN' || code === 'RU' || code === 'IR', `${code}: missing pack stub`);
  ok(!!OFFICIAL_SOURCES[code], `${code}: missing official source`);
  ok(new RegExp(`\\n  ${code}: \\{ name:`).test(askFn), `${code}: missing in legal-ask allowlist`);
  ok(new RegExp(`\\n  ${code}: \\{ name:`).test(toolsFn), `${code}: missing in pro-tools allowlist`);
  for (const lang of langs) {
    const label = bundles[lang][item.labelKey] ?? bundles[lang].translation?.[item.labelKey];
    ok(typeof label === 'string' && label.trim().length > 0, `${lang}: missing label ${item.labelKey}`);
  }
}
eq(new Set(JURISDICTIONS.map((j) => j.code)).size, JURISDICTIONS.length, 'duplicate jurisdiction codes');

// 2. Locale suggestion.
const s = (lang, region) => suggestJurisdictionFor(lang, region).code;
eq(s('ja', 'JP'), 'JP', 'ja');
eq(s('pt', 'PT'), 'PT', 'pt-PT');
eq(s('pt', 'BR'), 'BR', 'pt-BR');
eq(s('pt', ''), 'PT', 'pt no region');
eq(s('es', 'ES'), 'ES', 'es-ES');
eq(s('es', 'MX'), 'MX', 'es-MX');
eq(s('es', 'AR'), 'ES', 'es-AR falls back to ES');
eq(s('en', 'KR'), 'KR', 'en-KR');
eq(s('en', 'JP'), 'JP', 'en-JP');
eq(s('en', 'GB'), 'GB', 'en-GB');
eq(s('en', 'US'), 'US', 'en-US');
eq(suggestJurisdictionFor('en', 'ZZ').englishPick, true, 'en unknown region asks the user to pick');
eq(s('ar', 'SA'), 'SA', 'ar-SA');
eq(s('ar', 'EG'), 'AE', 'ar other');
eq(s('tr', 'TR'), 'TR', 'tr');
eq(s('zh', 'CN'), 'CN', 'zh');
eq(s('xx', ''), 'auto', 'unknown language');
for (const lang of langs) {
  const code = s(lang, '');
  ok(code === 'auto' || JURISDICTIONS.some((j) => j.code === code), `${lang}: suggestion ${code} is not selectable`);
}

if (failures.length) {
  console.error(`jurisdictions: ${failures.length} failure(s)\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`jurisdictions: ${cases} cases OK`);
