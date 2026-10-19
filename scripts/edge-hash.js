// Prints the SHA-256 that scripts/verify-ui.js pins for supabase/functions/analyze-contract/index.ts
// (the ANALYZE_EDGE_SHA256 constant near the top of verify-ui.js). Run after an intentional change to the function:
//   node scripts/edge-hash.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'supabase', 'functions', 'analyze-contract', 'index.ts');
console.log(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));
