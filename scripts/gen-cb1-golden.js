// Snapshot TR + tr outputs (drafts, roadmaps, calculator share) for byte-identity checks.
// Run once on pre-CB.1 code: node scripts/gen-cb1-golden.js
const fs = require('fs');
const path = require('path');
const { loadApp } = require('./cb1-harness');

const { api, t } = loadApp('tr');
const tTr = t('tr');

const DRAFT_ANSWERS = {
  notice_payment: {
    sender: 'Ayşe Yılmaz',
    recipient: 'Deneme Ltd. Şti.',
    basis: '12.03.2026 tarihli hizmet sözleşmesi',
    amount: '45.000 TL',
    dueDate: '01.08.2026',
    deadlineDays: '7',
  },
  mediation_application: {
    applicant: 'Ayşe Yılmaz',
    respondent: 'Deneme Ltd. Şti.',
    disputeType: 'İş',
    summary: 'Ücret alacağı ödenmedi.',
    amount: '30.000 TL',
    city: 'İstanbul',
  },
  consumer_complaint: {
    consumer: 'Ayşe Yılmaz',
    seller: 'Örnek Mağaza',
    product: 'Buzdolabı',
    purchaseDate: '05.05.2026',
    problem: 'Soğutmuyor.',
    request: 'Değişim',
  },
};

function combos(questions) {
  let out = [{}];
  for (const q of questions || []) {
    const next = [];
    for (const base of out) for (const opt of q.options || []) next.push({ ...base, [q.id]: opt.value });
    out = next;
  }
  return out;
}

const golden = { drafts: {}, roadmaps: {}, calc: {} };

for (const id of Object.keys(DRAFT_ANSWERS)) {
  golden.drafts[`${id}:full`] = api.buildDraft(id, DRAFT_ANSWERS[id], 'tr').text;
  golden.drafts[`${id}:empty`] = api.buildDraft(id, {}, 'tr').text;
}

for (const sc of api.LEGAL_SCENARIOS) {
  combos(sc.questions).forEach((answers) => {
    const key = `${sc.id}:${JSON.stringify(answers)}`;
    const r = api.generateScenarioRoadmap(sc.id, answers, 'tr');
    golden.roadmaps[key] = { json: JSON.stringify(r), text: api.formatRoadmapForSharing(r, 'plain') };
  });
}

const trCtx = api.LEGAL_CALC_PACKS ? { pack: api.LEGAL_CALC_PACKS.TR, currency: 'TRY' } : {};
const CALC_CASES = {
  severance: () => api.calculateSeverance({ grossSalary: 50000, workMonths: 36, includesNoticePay: false, ...trCtx }),
  severanceNotice: () => api.calculateSeverance({ grossSalary: 80000, workMonths: 50, includesNoticePay: true, ...trCtx }),
  rent: () => api.calculateRentIncrease({ currentRent: 15000, proposedRent: 18000, tufeRate: 25, isResidential: true, ...trCtx }),
  interestLegal: () => api.calculateLegalInterest({ principal: 100000, startDate: '2025-01-01', endDate: '2026-01-01', interestType: 'legal', ...trCtx }),
  interestCommercial: () => api.calculateLegalInterest({ principal: 100000, startDate: '2025-01-01', endDate: '2025-07-01', interestType: 'commercial', ...trCtx }),
};
for (const [k, fn] of Object.entries(CALC_CASES)) {
  const r = fn();
  golden.calc[k] = { total: r.totalAmount, text: api.formatCalculationForSharing(r, 'whatsapp', tTr) };
}

if (require.main === module) {
  const out = path.join(__dirname, 'fixtures', 'cb1-golden.json');
  if (fs.existsSync(out) && !process.argv.includes('--force')) {
    console.error('cb1-golden.json already exists (pre-CB.1 baseline). Pass --force to overwrite.');
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ DRAFT_ANSWERS, golden }, null, 2), 'utf8');
  console.log('golden written', Object.keys(golden.roadmaps).length, 'roadmaps');
}

module.exports = { DRAFT_ANSWERS, CALC_CASES_KEYS: Object.keys(CALC_CASES) };
