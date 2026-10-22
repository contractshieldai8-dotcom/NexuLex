// Offline test: percentages and money follow the active language instead of a Turkish-only layout.
//   node scripts/test-formatters.mjs
import { createAppLoader } from './lib/app-modules.mjs';

const loader = createAppLoader();
const { formatMoney, formatPercentText, formatCalculationForSharing } = loader.load('utils/legalCalculators.js');

let cases = 0;
const failures = [];
const eq = (actual, expected, label) => {
  cases += 1;
  if (actual !== expected) failures.push(`${label}: got ${JSON.stringify(actual)}, want ${JSON.stringify(expected)}`);
};

// Turkish keeps the sign in front; every other language puts it after the number.
eq(formatPercentText(12.5, 'tr'), '%12.50', 'tr percent');
eq(formatPercentText(12.5, 'tr-TR'), '%12.50', 'tr-TR percent');
for (const lang of ['en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  eq(formatPercentText(12.5, lang), '12.50%', `${lang} percent`);
  eq(formatMoney(12.5, 'PCT', lang), '12.50%', `${lang} PCT money`);
}
eq(formatMoney(12.5, 'PCT', 'tr-TR'), '%12.50', 'tr PCT money');
eq(formatMoney(12.5, 'PCT'), '%12.50', 'PCT without locale keeps the legacy layout');
eq(formatMoney(7, 'DAY', 'en'), '7', 'days stay plain');
eq(formatMoney(1, 'BAD!', 'en'), '1.00 BAD!', 'unknown currency falls back to the code');

const result = {
  calculatorId: 'legal_interest',
  mode: 'generic',
  currency: 'EUR',
  totalAmount: 100,
  breakdown: [{ labelKey: 'rate', currency: 'PCT', amount: 9.5 }],
};
const t = (key) => key;
eq(formatCalculationForSharing(result, 'plain', t, 'en').includes('rate: 9.50%'), true, 'share en percent after number');
eq(formatCalculationForSharing(result, 'plain', t, 'tr').includes('rate: %9.50'), true, 'share tr percent before number');
eq(formatCalculationForSharing(result, 'plain', t).includes('rate: %9.50'), true, 'share without language keeps legacy layout');

if (failures.length) {
  console.error(`formatters: ${failures.length} failure(s)\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`formatters: ${cases} cases OK`);
