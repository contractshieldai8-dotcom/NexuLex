'use strict';
// Builds one merged translation bundle per language from the real i18n.js resource table.
//
//   node scripts/build-locale-bundles.js           write locales/bundles/<lng>.json
//   node scripts/build-locale-bundles.js --check   fail if the committed bundles are stale
//
// i18n.js (all waves, all languages) stays the single source of truth and is what Node tooling and
// the web build load. On Android/iOS Metro resolves i18n.native.js instead, which loads only the
// active language (plus English as the fallback) at startup and pulls the others in on demand.
const fs = require('fs');
const path = require('path');
const { loadResources, ROOT } = require('./lib/load-i18n');

const OUT_DIR = path.join(ROOT, 'locales', 'bundles');
const NATIVE_ENTRY = path.join(ROOT, 'i18n.native.js');
const check = process.argv.includes('--check');

const resources = loadResources();
const languages = Object.keys(resources).sort();
let problems = 0;
let written = 0;

if (!check) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const lng of languages) {
  const file = path.join(OUT_DIR, `${lng}.json`);
  const next = JSON.stringify(resources[lng]);
  if (check) {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current !== next) {
      console.error(`STALE  locales/bundles/${lng}.json - run: npm run build:locales`);
      problems += 1;
    }
  } else {
    const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (current !== next) {
      fs.writeFileSync(file, next);
      written += 1;
    }
  }
}

// Every language must be wired into the native lazy loader with a static require (Metro needs literals).
const entrySrc = fs.readFileSync(NATIVE_ENTRY, 'utf8');
for (const lng of languages) {
  if (!entrySrc.includes(`require('./locales/bundles/${lng}.json')`)) {
    console.error(`MISSING loader for "${lng}" in i18n.native.js`);
    problems += 1;
  }
}

if (check) {
  if (problems) process.exit(1);
  console.log(`locale bundles: ${languages.length} languages in sync with i18n.js`);
} else {
  if (problems) process.exit(1);
  console.log(`locale bundles: ${languages.length} languages, ${written} file(s) written`);
}
