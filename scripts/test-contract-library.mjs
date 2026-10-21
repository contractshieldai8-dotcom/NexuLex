// Offline test for the Contract Library (WAVE CL.1): runs the app's own constants/services in plain Node.
//   node scripts/test-contract-library.mjs            assert everything
//   node scripts/test-contract-library.mjs --dump <id> [filled|blank]   print the rendered document
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createAppLoader } from './lib/app-modules.mjs';

const ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const loader = createAppLoader();
const tpl = loader.load('constants/contractTemplates.js');
const svc = loader.load('services/contractLibrary.js');
const { CONTRACT_LIBRARY, CONTRACT_FIELDS, getContractTemplateById } = tpl;

let cases = 0;
const failures = [];
const check = (cond, msg) => {
  cases += 1;
  if (!cond) failures.push(msg);
};

function readSource(id) {
  const file = path.join(ROOT, 'constants/contractLibrary/texts', `${id}.js`);
  const raw = fs.readFileSync(file, 'utf8');
  const m = raw.match(/^export const CONTRACT_TEXT = (".*");\s*$/m);
  if (!m) throw new Error(`cannot parse ${file}`);
  return { text: JSON.parse(m[1]), header: raw.split('\n').slice(0, 3).join('\n') };
}

const SAMPLE = {
  companyName: 'Acme Robotics GmbH',
  companyEntity: 'a limited liability company organised under the laws of Germany',
  counterpartyName: 'Beta Analytics Ltd',
  effectiveDate: '21.10.2026',
  governingLaw: 'England and Wales',
  arbitrationSeat: 'London, England',
  companyAddress: 'Hauptstrasse 1, 10115 Berlin',
  counterpartyAddress: '1 Poultry, London EC2R 8EJ',
  companyEmail: 'legal@acme.example',
  companyContact: 'Data Protection Officer, dpo@acme.example',
  counterpartyContact: 'Head of Privacy, privacy@beta.example',
  signerName: 'Jane Doe',
  signerTitle: 'CEO',
  permittedUse: 'evaluate a potential investment in the Company',
  riderName: 'Security Rider v2',
  userBlock: '25',
  services: 'introducing the Company to prospective customers',
  serviceDates: 'from 1 November 2026 until 31 October 2027',
  competingField: 'warehouse robotics',
  optionShares: '10,000',
  vestingYears: '4',
  vestingMonths: '48',
  agreementName: 'Master Services Agreement',
  agreementDate: '01.09.2026',
  companyActivities: 'Cloud robotics fleet management software',
  subprocessorSite: 'https://acme.example/subprocessors',
  subprocessorList: 'AWS EMEA SARL | Luxembourg | Cloud hosting\nSentry | USA | Error monitoring',
  siteDomain: 'www.acme.example',
  privacyUrl: 'https://acme.example/privacy',
  businessDescription: 'cloud robotics fleet management platform',
  companyPhone: '+49 30 1234567',
  courtVenue: 'London, England',
};

const dumpIdx = process.argv.indexOf('--dump');
if (dumpIdx >= 0) {
  const id = process.argv[dumpIdx + 1];
  const mode = process.argv[dumpIdx + 2] || 'filled';
  const doc = svc.buildContractDocument(id, mode === 'blank' ? {} : SAMPLE, readSource(id).text);
  console.log(doc.text);
  process.exit(0);
}

// 1. Registry integrity
check(CONTRACT_LIBRARY.length === 8, 'registry must hold the five launch templates plus the three web/governance templates');
check(new Set(CONTRACT_LIBRARY.map((x) => x.id)).size === CONTRACT_LIBRARY.length, 'template ids must be unique');

const metaSrc = fs.readFileSync(path.join(ROOT, 'constants/contractLibrary/source.js'), 'utf8');
const pinned = (metaSrc.match(/commit: '([0-9a-f]{40})'/) || [])[1];
check(!!pinned, 'source.js must pin a 40-char commit');
check(/license: 'CC0-1\.0'/.test(metaSrc), 'source.js must declare CC0-1.0');

for (const template of CONTRACT_LIBRARY) {
  const label = template.id;
  check(/^[a-z0-9_]+$/.test(template.id), `${label}: id shape`);
  for (const key of ['titleKey', 'descriptionKey', 'assumptionKey']) check(typeof template[key] === 'string', `${label}: ${key}`);
  check(template.fields.every((f) => CONTRACT_FIELDS[f]), `${label}: every field is declared`);
  check(template.required.every((f) => template.fields.includes(f)), `${label}: required ⊆ fields`);
  check(new Set(template.fields).size === template.fields.length, `${label}: fields unique`);

  const { text, header } = readSource(template.id);
  check(header.includes(pinned), `${label}: text module header pins the same commit`);
  check(header.includes('CC0-1.0'), `${label}: text module header carries the licence`);
  check(text.length > 5000, `${label}: source text present`);

  // 2. Rules must match the vendored text exactly once (or all:true at least once)
  const filled = svc.applyContractRules(template, text, SAMPLE);
  check(filled.unmatched.length === 0, `${label}: rules not matching source: ${JSON.stringify(filled.unmatched)}`);
  const blank = svc.applyContractRules(template, text, {});
  check(blank.unmatched.length === 0, `${label}: rules (blank run) not matching: ${JSON.stringify(blank.unmatched)}`);

  // 3. Filled document: no leftover template tokens, every answer present
  const docFilled = svc.buildContractDocument(template.id, SAMPLE, text);
  check(!!docFilled, `${label}: document builds`);
  const plain = docFilled.text;
  check(!/<\/?mark>/.test(plain), `${label}: no <mark> tags left`);
  check(!/\[(Company|Customer|Address|CompanyName|INSERT|Role|Email|WEBSITE|User Number|Rider to Form|Company Email Address)\]/.test(plain), `${label}: no upstream placeholder left`);
  check(!/\*\*|\*\*\*/.test(plain), `${label}: no markdown emphasis left`);
  check(!/\u200d/.test(plain), `${label}: no zero-width joiner`);
  check(docFilled.missingRequired.length === 0, `${label}: sample fills all required fields`);
  for (const id of template.fields) {
    const value = docFilled.answers[id];
    check(!!value, `${label}: sample answer for ${id} accepted`);
    if (value && !['effectiveDate', 'agreementDate', 'subprocessorList', 'companyAddress', 'counterpartyAddress', 'permittedUse'].includes(id)) {
      check(plain.includes(value), `${label}: answer ${id} appears in the document`);
    }
  }
  check(plain.includes('21 October 2026') || template.id === 'dpa_global' || template.id === 'one_way_nda', `${label}: DMY date rendered as English long date`);
  check(plain.trimEnd().split('\n').slice(-1)[0].startsWith('Template: General Legal, PC (CC0-1.0)'), `${label}: attribution is the last line`);
  check(plain.includes('General Legal has not reviewed'), `${label}: upstream disclaimer kept`);

  // 4. Blank document: required blanks visible, required reported missing
  const docBlank = svc.buildContractDocument(template.id, {}, text);
  check(docBlank.missingRequired.length === template.required.length, `${label}: blank run reports every required field missing`);
  for (const id of template.required) {
    check(
      docBlank.text.includes(`[ ${CONTRACT_FIELDS[id].blank} ]`) || docBlank.text.includes('____________________'),
      `${label}: blank for ${id} is visible`
    );
  }

  // 5. Structure
  const types = new Set(docFilled.blocks.map((b) => b.type));
  check(docFilled.blocks[0].type === 'title', `${label}: first block is the title`);
  check(types.has('footer'), `${label}: upstream footer rendered as footer block`);
  check(docFilled.blocks.length > 8, `${label}: enough blocks`);

  // 6. Injection safety (answers cannot break the document)
  const nasty = svc.buildContractDocument(template.id, { companyName: 'Evil **bold** <mark>x</mark> $& `code` \\', counterpartyName: 'B' }, text);
  check(!/<\/?mark>/.test(nasty.text) && !nasty.text.includes('**'), `${label}: markup in answers is neutralised`);
  check(nasty.text.includes('Evil bold x $& code'), `${label}: $& in answers is literal`);

  // 7. Preview
  const preview = svc.buildContractPreview(docFilled, 6);
  check(preview.hiddenCount === preview.total - 6, `${label}: preview hides all but six blocks`);
}

// Numbering: NDAs must read 1..19 continuously, and cross-references ("Section 3") must hit the intended clause
{
  const t = getContractTemplateById('mutual_nda');
  const doc = svc.buildContractDocument('mutual_nda', SAMPLE, readSource('mutual_nda').text);
  const clauses = doc.blocks.filter((b) => b.type === 'clause').map((b) => b.marker);
  check(clauses.join(',') === Array.from({ length: 22 }, (_, i) => `${i + 1}.`).join(','), `mutual_nda: clauses numbered 1..22, got ${clauses.join(',')}`);
  const sec3 = doc.blocks.filter((b) => b.type === 'clause')[2];
  check(/will not have any obligations/.test(sec3.text), 'mutual_nda: Section 3 is the exclusions clause');
  const subs = doc.blocks.filter((b) => b.type === 'sub').map((b) => b.marker);
  check(subs.slice(0, 5).join('') === '(a)(b)(c)(d)(e)', 'mutual_nda: exclusions lettered (a)-(e)');
  check(!!t, 'mutual_nda registry');
  const ow = svc.buildContractDocument('one_way_nda', SAMPLE, readSource('one_way_nda').text);
  const owClauses = ow.blocks.filter((b) => b.type === 'clause').map((b) => b.marker);
  check(owClauses.join(',') === Array.from({ length: 10 }, (_, i) => `${i + 1}.`).join(','), `one_way_nda: clauses 1..10, got ${owClauses.join(',')}`);
  const adv = svc.buildContractDocument('advisor_agreement', SAMPLE, readSource('advisor_agreement').text);
  check(adv.blocks.filter((b) => b.type === 'clause').length === 7, 'advisor_agreement: seven clauses');
  check(adv.nexulexAddedParts === true, 'advisor_agreement: flags NexuLex-added cover/signature');
}

// Defaults keep the upstream (US) wording when optional fields are empty, custom values replace it
{
  const text = readSource('mutual_nda').text;
  const dflt = svc.buildContractDocument('mutual_nda', { companyName: 'A', counterpartyName: 'B', effectiveDate: '01.01.2027' }, text).text;
  check(dflt.includes('a Delaware corporation') && dflt.includes('laws of the State of Delaware'), 'mutual_nda: defaults stay as drafted');
  const custom = svc.buildContractDocument('mutual_nda', { companyName: 'A', counterpartyName: 'B', effectiveDate: '01.01.2027', governingLaw: 'England and Wales' }, text).text;
  check(custom.includes('laws of England and Wales') && !custom.includes('State of Delaware'), 'mutual_nda: governing law replaced');
}

// Date helper
check(svc.formatContractDate('31.12.2026') === '31 December 2026', 'date: DMY');
check(svc.formatContractDate('31.02.2026') === '31.02.2026', 'date: invalid kept verbatim');
check(svc.formatContractDate('1 August 2026') === '1 August 2026', 'date: free text kept');

// File name
check(/^nexulex-mutual-non-disclosure-agreement-\d{4}-\d{2}-\d{2}\.docx$/.test(svc.contractDocxFilename({ title: 'Mutual Non-Disclosure Agreement' })), 'docx filename');

// Navigator (Rehber) integration: workflow, What's new entry, deep link and 13-language copy
{
  const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
  const capSrc = read('constants/appCapabilities.js');
  const cap = new Function(`${capSrc.replace(/^export /gm, '')}\nreturn { GUIDE_ADVISOR_TOOLS, GUIDE_CHANGELOG, GUIDE_WORKFLOWS };`)(); // eslint-disable-line no-new-func
  const flow = cap.GUIDE_WORKFLOWS.find((f) => f.id === 'contract_library');
  check(!!flow && flow.tab === 'advisor' && flow.steps.length === 4, 'guide: contract_library workflow with four steps on the advisor tab');
  check(flow?.steps[0]?.action?.type === 'openAdvisorTool' && flow.steps[0].action.id === 'contract_library', 'guide: first step deep-links to the library');
  check(cap.GUIDE_ADVISOR_TOOLS.includes('contract_library'), 'guide: contract_library is an advisor tool');
  check(cap.GUIDE_CHANGELOG.some((e) => e.workflowId === 'contract_library' && e.date === '2026-10-21'), "guide: What's new entry");
  check(/guideAction\.id === 'contract_library'\) \{?\s*openContract\(/.test(read('screens/LegalAdvisorScreen.js').replace(/\n\s*/g, ' ')), 'guide: advisor opens the library from the deep link');
  const keys = [flow?.titleKey, flow?.hintKey, flow?.introKey, flow?.chipKey, ...(flow?.steps || []).flatMap((s) => [s.bodyKey, s.ctaKey]), 'guideNewContracts'].filter(Boolean);
  for (const lang of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
    const bundle = JSON.parse(read(`locales/bundles/${lang}.json`));
    const missing = keys.filter((k) => typeof bundle[k] !== 'string' || !bundle[k].trim());
    check(missing.length === 0, `guide: ${lang} has all contract-library guide keys (${missing.join(',')})`);
  }
}

if (failures.length) {
  console.error(`FAIL ${failures.length}/${cases}`);
  failures.forEach((f) => console.error(' - ' + f));
  process.exit(1);
}
console.log(`contract library: ${cases} cases OK`);
