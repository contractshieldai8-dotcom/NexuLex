// Tap-target guard: an icon-only button with no size of its own must reach 44 x 44 dp
// (icon size + hitSlop on each side). Buttons that set a style (width/height/padding) are sized by that style.
//   node scripts/test-tap-targets.mjs
import fs from 'fs';
import path from 'path';

const MIN = 44;
const roots = ['App.js', 'components', 'screens'];
const files = [];
for (const r of roots) {
  if (r.endsWith('.js')) files.push(r);
  else for (const f of fs.readdirSync(r)) if (f.endsWith('.js')) files.push(path.join(r, f).replace(/\\/g, '/'));
}

// End index of an opening tag, skipping braces and quotes inside attributes.
function tagEnd(src, start) {
  let depth = 0;
  let quote = null;
  for (let i = start; i < src.length; i += 1) {
    const c = src[i];
    if (quote) { if (c === quote && src[i - 1] !== '\\') quote = null; continue; }
    if (depth === 0 && (c === '"' || c === "'")) { quote = c; continue; }
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '>' && depth === 0) return i;
  }
  return -1;
}

const FIX = process.argv.includes('--fix');
const TARGET = 48; // --fix grows the hitSlop until the target reaches the Material 48dp
const problems = [];
let checked = 0;
let fixed = 0;
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;
  const re = /<(TouchableOpacity|Pressable|TouchableHighlight)\b/g;
  let m;
  while ((m = re.exec(src))) {
    const end = tagEnd(src, m.index);
    if (end < 0 || src[end - 1] === '/') continue;
    const tag = src.slice(m.index, end + 1);
    const close = src.indexOf(`</${m[1]}>`, end);
    if (close < 0) continue;
    const body = src.slice(end + 1, close).trim();
    const icon = body.match(/^<Ionicons\b[\s\S]*?\/>$/);
    if (!icon || /<Text\b/.test(body)) continue;
    checked += 1;
    if (/\bstyle=/.test(tag)) continue;
    const size = Number((body.match(/size=\{(\d+)\}/) || [])[1] || 0);
    const slop = tag.match(/hitSlop=\{\{([^}]*)\}\}/);
    const side = (name) => Number((slop && slop[1].match(new RegExp(`${name}:\\s*(\\d+)`)) || [])[1] || 0);
    const w = size + side('left') + side('right');
    const h = size + side('top') + side('bottom');
    if (w < MIN || h < MIN) {
      if (FIX && size > 0) {
        const pad = Math.ceil((TARGET - size) / 2);
        const next = `hitSlop={{ top: ${pad}, bottom: ${pad}, left: ${pad}, right: ${pad} }}`;
        const newTag = slop ? tag.replace(/hitSlop=\{\{[^}]*\}\}/, next) : tag.replace(/^(<\w+)/, `$1 ${next}`);
        src = src.slice(0, m.index) + newTag + src.slice(end + 1);
        re.lastIndex = m.index + newTag.length;
        fixed += 1;
        continue;
      }
      const line = src.slice(0, m.index).split('\n').length;
      problems.push(`${file}:${line} icon ${size} -> ${w}x${h} dp`);
    }
  }
  if (src !== original) fs.writeFileSync(file, src);
}
if (FIX) console.log(`tap targets: widened ${fixed} buttons to ${TARGET}dp`);

if (problems.length) {
  console.error(`tap targets: ${problems.length} below ${MIN}dp\n${problems.join('\n')}`);
  process.exit(1);
}
console.log(`tap targets: ${checked} icon-only buttons checked, all >= ${MIN}dp`);
