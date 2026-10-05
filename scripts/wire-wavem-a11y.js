// WAVE M one-shot codemod: give every touchable an accessibilityRole and every TextInput an accessibilityLabel.
// Source-preserving (text insertion at AST offsets, back to front). Idempotent.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const parser = require(path.join(ROOT, 'node_modules/@babel/parser'));
const traverse = require(path.join(ROOT, 'node_modules/@babel/traverse')).default;
const TOUCH = new Set(['TouchableOpacity', 'Pressable', 'TouchableHighlight']);

const files = ['App.js'];
for (const d of ['components', 'screens']) for (const f of fs.readdirSync(path.join(ROOT, d))) if (f.endsWith('.js')) files.push(`${d}/${f}`);

let roles = 0;
let labels = 0;
const unlabeled = [];
for (const file of files) {
  const full = path.join(ROOT, file);
  let src = fs.readFileSync(full, 'utf8');
  const ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx'] });
  const edits = [];
  traverse(ast, {
    JSXOpeningElement(p) {
      const n = p.node;
      const name = n.name.name;
      const attrs = n.attributes;
      const names = attrs.map((a) => (a.type === 'JSXSpreadAttribute' ? '...' : a.name.name));
      if (names.includes('...')) return;
      if (TOUCH.has(name) && !names.includes('accessibilityRole')) {
        edits.push({ at: n.name.end, text: ' accessibilityRole="button"' });
        roles += 1;
      }
      if (name === 'TextInput' && !names.includes('accessibilityLabel')) {
        const ph = attrs.find((a) => a.name.name === 'placeholder');
        if (!ph || !ph.value) {
          unlabeled.push(`${file}:${n.loc.start.line}`);
          return;
        }
        const valueSrc = src.slice(ph.value.start, ph.value.end); // "text" or {expr}
        edits.push({ at: n.name.end, text: ` accessibilityLabel=${valueSrc}` });
        labels += 1;
      }
    },
  });
  edits.sort((a, b) => b.at - a.at);
  for (const e of edits) src = src.slice(0, e.at) + e.text + src.slice(e.at);
  if (edits.length) fs.writeFileSync(full, src, 'utf8');
}
console.log(`roles added: ${roles}, input labels added: ${labels}`);
if (unlabeled.length) console.log('inputs without placeholder (label by hand):', unlabeled.join(', '));
