'use strict';
// Normalises UI copy casing + vocabulary across every i18n source file, in place, string literal by string literal.
//   node scripts/normalize-copy.js            -> dry run, writes scripts/.copy-report.txt
//   node scripts/normalize-copy.js --write    -> applies the edits
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const { sentenceCase, vocabulary, CASED_LANGS } = require('./lib/copy-rules');

const ROOT = path.resolve(__dirname, '..');
const LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const WRITE = process.argv.includes('--write');

const files = fs.readdirSync(ROOT).filter((f) => /^i18n(\.[a-z0-9]+)?\.js$/.test(f));
const entries = []; // { file, start, end, quote, lang, key, value }
const sources = {};

function keyName(node) {
  if (!node) return null;
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'StringLiteral') return node.value;
  return null;
}

for (const file of files) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf8');
  sources[file] = src;
  const ast = parser.parse(src, { sourceType: 'module' });
  traverse(ast, {
    ObjectProperty(p) {
      const v = p.node.value;
      if (v.type !== 'StringLiteral') return;
      const key = keyName(p.node.key);
      if (!key) return;
      // find the language: nearest ancestor property whose key is a language code
      let lang = null;
      let anc = p.parentPath;
      while (anc) {
        if (anc.node.type === 'ObjectProperty') {
          const k = keyName(anc.node.key);
          if (LANGS.includes(k)) { lang = k; break; }
        }
        anc = anc.parentPath;
      }
      if (!lang) return;
      if (!/^[A-Za-z0-9_]+$/.test(key) || LANGS.includes(key)) return;
      entries.push({ file, start: v.start, end: v.end, quote: src[v.start], lang, key, value: v.value });
    },
  });
}

// pass 1: vocabulary + sentence case, collecting label renames
const labelMap = {}; // lang -> [[old,new]]
for (const e of entries) {
  let next = vocabulary(e.value, e.lang);
  const cased = sentenceCase(next, e.lang, e.key);
  if (cased !== next && next.trim().split(/\s+/).length >= 2 && next.length >= 8) {
    (labelMap[e.lang] = labelMap[e.lang] || []).push([next, cased]);
  }
  e.next = cased;
}
// pass 2: rewrite quoted references to renamed labels inside other strings of the same language
const uniq = {};
for (const [lang, pairs] of Object.entries(labelMap)) {
  const m = new Map();
  for (const [a, b] of pairs) m.set(a.replace(/[:.]$/, ''), b.replace(/[:.]$/, ''));
  uniq[lang] = [...m.entries()].sort((x, y) => y[0].length - x[0].length);
}
for (const e of entries) {
  const pairs = uniq[e.lang];
  if (!pairs) continue;
  let v = e.next;
  for (const [a, b] of pairs) {
    if (v === b || v.length <= a.length) continue; // whole-label strings are already handled
    if (v.includes(a)) v = v.split(a).join(b);
  }
  e.next = v;
}

function encode(value, quote) {
  let s = value.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
  s = quote === '"' ? s.replace(/"/g, '\\"') : quote === "'" ? s.replace(/'/g, "\\'") : s;
  return quote + s + quote;
}

const changed = entries.filter((e) => e.next !== e.value);
const report = changed.map((e) => `${e.file}\t${e.lang}\t${e.key}\t${e.value}\t=>\t${e.next}`);
fs.writeFileSync(path.join(__dirname, '.copy-report.txt'), report.join('\n'), 'utf8');
console.log(`literals scanned: ${entries.length}; would change: ${changed.length}`);

if (WRITE) {
  const byFile = {};
  for (const e of changed) (byFile[e.file] = byFile[e.file] || []).push(e);
  for (const [file, list] of Object.entries(byFile)) {
    list.sort((a, b) => b.start - a.start);
    let src = sources[file];
    for (const e of list) src = src.slice(0, e.start) + encode(e.next, e.quote) + src.slice(e.end);
    fs.writeFileSync(path.join(ROOT, file), src, 'utf8');
  }
  console.log(`files written: ${Object.keys(byFile).length}`);
}
void CASED_LANGS;
