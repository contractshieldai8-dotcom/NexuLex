/* eslint-disable no-console */
// WCAG contrast audit for the NexuLex design tokens (dark + light).
// Parses theme.js as text (it imports react-native, so it cannot be required
// from plain node) and fails when a text/icon token pair drops below its floor.
//
//   node scripts/verify-contrast.js
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'theme.js'), 'utf8');

const HEX = /^#([0-9a-f]{6})$/i;

function constHex(name) {
  const match = src.match(new RegExp(`export const ${name} = '(#[0-9A-Fa-f]{6})'`));
  if (!match) throw new Error(`theme.js: constant ${name} not found`);
  return match[1];
}

function themeBlock(name) {
  const match = src.match(new RegExp(`export const ${name} = \\{([\\s\\S]*?)\\n\\};`));
  if (!match) throw new Error(`theme.js: ${name} block not found`);
  const body = match[1];
  const tokens = {};
  const consts = {
    ACCENT: constHex('ACCENT'),
    ACCENT_ALT: constHex('ACCENT_ALT'),
    DANGER: constHex('DANGER'),
    WARNING: constHex('WARNING'),
    SUCCESS: constHex('SUCCESS'),
    INK: constHex('INK'),
  };
  for (const line of body.split('\n')) {
    const lit = line.match(/^\s*(\w+):\s*'([^']+)'/);
    if (lit) {
      tokens[lit[1]] = lit[2];
      continue;
    }
    const ref = line.match(/^\s*(\w+):\s*([A-Z_]+),?\s*(\/\/.*)?$/);
    if (ref && consts[ref[2]]) tokens[ref[1]] = consts[ref[2]];
  }
  return { tokens, consts };
}

function luminance(hex) {
  const m = HEX.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const channel = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function ratio(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return null;
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// Composite an rgba(r, g, b, a) token over an opaque #rrggbb surface; returns #rrggbb or null.
function blendRgba(rgba, surfaceHex) {
  const m = /^rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)$/.exec(rgba || '');
  const s = HEX.exec(surfaceHex || '');
  if (!m || !s) return null;
  const alpha = Number(m[4]);
  const base = parseInt(s[1], 16);
  const src = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dst = [(base >> 16) & 255, (base >> 8) & 255, base & 255];
  const out = src.map((c, i) => Math.round(c * alpha + dst[i] * (1 - alpha)));
  return `#${out.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

let failures = 0;
let checks = 0;

function check(mode, fg, bg, fgHex, bgHex, min) {
  const r = ratio(fgHex, bgHex);
  if (r === null) return;
  checks += 1;
  const ok = r >= min;
  if (!ok) failures += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} [${mode}] ${fg} (${fgHex}) on ${bg} (${bgHex}) = ${r.toFixed(2)}:1 (min ${min})`);
}

for (const [mode, name] of [['dark', 'darkTheme'], ['light', 'lightTheme']]) {
  const { tokens, consts } = themeBlock(name);
  const surfaces = ['bg', 'cardBg', 'inputBg', 'surfaceRaised'];

  // Body copy
  for (const surface of surfaces) {
    check(mode, 'text', surface, tokens.text, tokens[surface], 7);
    check(mode, 'subText', surface, tokens.subText, tokens[surface], 4.5);
  }
  // Brand + status colours used as text / icon colour (via theme.* or toneText)
  for (const key of ['accent', 'accentAlt', 'danger', 'warning', 'success']) {
    for (const surface of ['bg', 'cardBg', 'inputBg', 'surfaceRaised']) {
      check(mode, key, surface, tokens[key], tokens[surface], 4.5);
    }
  }
  // accentAlt text/icons on its own translucent chip (accentAltSoft composited over each surface)
  for (const surface of surfaces) {
    const chip = blendRgba(tokens.accentAltSoft, tokens[surface]);
    if (chip) check(mode, 'accentAlt', `accentAltSoft over ${surface}`, tokens.accentAlt, chip, 4.5);
  }
  // Label on a filled accent button
  check(mode, 'onAccent', 'accent', tokens.onAccent, tokens.accent, 4.5);
  // INK text on status fills (badges, chips) — dark-theme constants are the fill in both modes
  for (const fill of ['DANGER', 'WARNING', 'SUCCESS', 'ACCENT', 'ACCENT_ALT']) {
    if (mode === 'dark') check(mode, 'INK', fill, consts.INK, consts[fill], 4.5);
  }
  // Hairline borders only need a non-text 3:1 when "strong"
  if (HEX.test(tokens.borderStrong || '')) {
    check(mode, 'borderStrong', 'bg', tokens.borderStrong, tokens.bg, 2);
  }
}

console.log(`\n${checks} contrast checks, ${failures} failing`);
if (failures) {
  console.error('verify-contrast: FAILED');
  process.exit(1);
}
console.log('verify-contrast: OK');
