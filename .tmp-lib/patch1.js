const fs = require('fs');
let p = 'constants/contractTemplates.js';
let s = fs.readFileSync(p, 'utf8');
s = s
  .split("'- By:',").join("`- By: ${SIG}`,")
  .split("'- Signature:',").join("`- Signature: ${SIG}`,")
  .split("'- Title (if applicable):',").join("`- Title (if applicable): ${SIG}`,")
  .split("'- Email:',").join("`- Email: ${SIG}`,")
  .split("'- Title (optional):',").join("`- Title (optional): ${SIG}`,")
  .split("'- Date:',").join("`- Date: ${SIG}`,");
s = s.replace("const DELAWARE_LAW = 'the State of Delaware';", "const SIG = CONTRACT_SIGNATURE_LINE;\nconst DELAWARE_LAW = 'the State of Delaware';");
fs.writeFileSync(p, s);
p = 'services/contractLibrary.js';
s = fs.readFileSync(p, 'utf8');
s = s.replace(".replace(/\\*{2,}/g, '')\n", ".replace(/\\*/g, '')\n");
fs.writeFileSync(p, s);
console.log(s.includes(".replace(/\\*/g, '')"));
