// One-shot helper: the verify suites pin the runtime dependency count; bump the pin after an intentional dependency change.
// Usage: node scripts/bump-dep-pin.js <from> <to>
const fs = require('fs');
const [from, to] = process.argv.slice(2);
if (!from || !to) throw new Error('usage: node scripts/bump-dep-pin.js <from> <to>');
const file = 'scripts/verify-ui.js';
const src = fs.readFileSync(file, 'utf8');
const re = new RegExp(`(dependencies \\|\\| \\{\\}\\)\\.length !== )${from}\\)`, 'g');
const n = (src.match(re) || []).length;
fs.writeFileSync(file, src.replace(re, (_, head) => `${head}${to})`));
console.log(`dependency pin ${from} -> ${to}: ${n} places`);
