// WAVE PRICE.1 — reads config/pricing-matrix.json and reports what is missing or wrong. Invents nothing.
//   node scripts/check-pricing.js            report only (exit 1 only when a filled value breaks a rule)
//   node scripts/check-pricing.js --strict   exit 1 until every field is filled and every check passes
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./cb1-harness');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const fileArg = args.find((a) => !a.startsWith('--'));
const file = path.resolve(fileArg || path.join(__dirname, '..', 'config', 'pricing-matrix.json'));

let matrix;
try {
  matrix = JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
} catch (error) {
  console.error(`Cannot read ${file}: ${error.message}`);
  process.exit(1);
}

const { api } = loadApp('en');
const result = api.evaluatePriceMatrix(matrix);
const pct = (value) => (value === null || value === undefined ? '-' : `${value}%`);
const fx = (value) => (value === null || value === undefined ? '-' : value.toFixed(2));

console.log(`Pricing matrix: ${result.status.toUpperCase()}  (${result.pricedRegions} priced region${result.pricedRegions === 1 ? '' : 's'}, file ${path.relative(process.cwd(), file)})`);
if (result.status === 'template') {
  console.log('\nNothing is filled in yet. Fill config/pricing-matrix.json from these sources:');
  Object.entries(matrix.sources || {}).forEach(([key, text]) => console.log(`  ${key}: ${text}`));
}
for (const row of result.rows) {
  if (!row.complete) continue;
  console.log(`\n${row.region} (${row.currency})  MX.1 yearly saving: Pro ${pct(row.mx1.pro)}, Professional ${pct(row.mx1.professional)}  |  MX.2 Professional above Pro: monthly ${pct(row.mx2.monthly)}, yearly ${pct(row.mx2.yearly)}`);
  for (const [key, floor] of Object.entries(row.floor)) {
    console.log(`  ${key.padEnd(22)} net/mo USD ${fx(floor.netUsd).padStart(7)}   worst-case AI USD ${fx(floor.worstUsd).padStart(7)}   safe utilization ${fx(floor.safeUtilization)}`);
  }
}
if (result.issues.length) {
  console.log('\nRULE BREAKS');
  result.issues.forEach((m) => console.log(`  x ${m}`));
}
if (result.missing.length) {
  console.log('\nSTILL MISSING');
  result.missing.forEach((m) => console.log(`  - ${m}`));
}
process.exit(result.status === 'fail' || (strict && result.status !== 'ok') ? 1 : 0);
