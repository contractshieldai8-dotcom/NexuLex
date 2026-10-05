// WAVE M: AST audit of interactive elements for screen-reader semantics (no regex on JSX).
// Usage: node scripts/a11y-audit.js [--list]   (exported audit() is used by verify-ui.js)
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const parser = require(path.join(ROOT, 'node_modules/@babel/parser'));
const traverse = require(path.join(ROOT, 'node_modules/@babel/traverse')).default;

const TOUCH = new Set(['TouchableOpacity', 'Pressable', 'TouchableHighlight']);

function listFiles() {
  const files = ['App.js'];
  for (const d of ['components', 'screens']) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) if (f.endsWith('.js')) files.push(`${d}/${f}`);
  }
  return files;
}

function audit() {
  const out = { touch: 0, touchMissing: [], input: 0, inputMissing: [], other: [] };
  for (const file of listFiles()) {
    const ast = parser.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'), { sourceType: 'module', plugins: ['jsx'] });
    traverse(ast, {
      JSXElement(p) {
        const open = p.node.openingElement;
        const name = open.name.name;
        const attrs = open.attributes.map((a) => (a.type === 'JSXSpreadAttribute' ? '...' : a.name.name));
        const line = open.loc.start.line;
        if (TOUCH.has(name)) {
          out.touch += 1;
          if (attrs.includes('...') || attrs.includes('accessible')) return; // spread or an intentionally hidden backdrop
          const hasRole = attrs.includes('accessibilityRole');
          const hasLabel = attrs.includes('accessibilityLabel');
          // a touchable whose child is a <Text> is already announced by its text; the role is still required.
          // A glyph-only child ("✕", "‹", "+") is not a name: it needs an explicit label.
          if (!hasRole) out.touchMissing.push(`${file}:${line} <${name}> role`);
          else if (!hasLabel && (!hasTextChild(p.node) || glyphOnly(p.node))) out.touchMissing.push(`${file}:${line} <${name}> label`);
        }
        if (!attrs.includes('...')) {
          if (name === 'Switch' && !attrs.includes('accessibilityLabel')) out.other.push(`${file}:${line} <Switch> label`);
          if (name === 'Image' && !attrs.includes('accessibilityLabel') && !attrs.includes('accessible') && !attrs.includes('alt')) out.other.push(`${file}:${line} <Image> label-or-hidden`);
          if (name === 'Modal' && !attrs.includes('onRequestClose')) out.other.push(`${file}:${line} <Modal> onRequestClose (Android back / VoiceOver escape)`);
        }
        if (name === 'TextInput') {
          out.input += 1;
          if (!attrs.includes('...') && !attrs.includes('accessibilityLabel')) out.inputMissing.push(`${file}:${line} <TextInput> label`);
        }
      },
    });
  }
  return out;
}

function hasTextChild(node) {
  return node.children.some((c) => {
    if (c.type === 'JSXElement') return c.openingElement.name.name === 'Text' || hasTextChild(c);
    return c.type === 'JSXExpressionContainer' && c.expression.type !== 'JSXEmptyExpression' && c.expression.type !== 'ArrowFunctionExpression';
  });
}

/** True when every visible child is literal text of <= 2 characters (an icon glyph, not a name). */
function glyphOnly(node) {
  let literal = '';
  let dynamic = false;
  const walk = (n) => n.children.forEach((c) => {
    if (c.type === 'JSXText') literal += c.value.trim();
    else if (c.type === 'JSXElement') walk(c);
    else if (c.type === 'JSXExpressionContainer' && c.expression.type === 'StringLiteral') literal += c.expression.value.trim();
    else if (c.type === 'JSXExpressionContainer' && c.expression.type !== 'JSXEmptyExpression') dynamic = true;
  });
  walk(node);
  return !dynamic && [...literal].length > 0 && [...literal].length <= 2;
}

module.exports = { audit };

if (require.main === module) {
  const r = audit();
  console.log(`touchables=${r.touch} missing=${r.touchMissing.length} inputs=${r.input} missing=${r.inputMissing.length} other=${r.other.length}`);
  const byFile = {};
  [...r.touchMissing, ...r.inputMissing, ...r.other].forEach((m) => { const f = m.split(':')[0]; byFile[f] = (byFile[f] || 0) + 1; });
  Object.entries(byFile).sort((a, b) => b[1] - a[1]).forEach(([f, n]) => console.log(n, f));
  if (process.argv.includes('--list')) [...r.touchMissing, ...r.inputMissing, ...r.other].forEach((m) => console.log(m));
}
