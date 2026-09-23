// Dikey playbook: sözleşme tipine göre imza öncesi yasal kontrol listesi.
// Metinler i18n anahtarlarından gelir; kanun maddeleri sabit referanstır.
// Madde numarası yalnız kaynakta kesin olan yerlerde vardır (VALIDITY HUMILITY).

const RENT = {
  US: 'State landlord-tenant law (CA Civ. Code §1940 et seq. / NY RPL Art. 7)',
  GB: 'Housing Act 1988 · Landlord and Tenant Act 1985',
  FR: 'Loi n° 89-462 du 6 juillet 1989',
  ES: 'LAU (Ley 29/1994)',
  IT: 'L. 392/1978 · Cod. civ. locazione',
  NL: 'BW Boek 7 titel 4',
  EU: 'national tenancy law + Unfair Terms Dir. 93/13',
  AE: 'Dubai Law 26/2007 / Abu Dhabi Law 20/2006 (emirate-specific)',
  SA: 'Civil Transactions Law (lease)',
  CN: '民法典 合同编 租赁合同',
  RU: 'ГК РФ гл. 35',
  IR: 'قانون روابط موجر و مستاجر',
};

const LABOR = {
  GB: 'ERA 1996 · Employment Rights Act 1996',
  FR: 'Code du travail',
  ES: 'Estatuto de los Trabajadores',
  IT: 'Statuto dei lavoratori · Cod. civ. lavoro',
  NL: 'BW 7:667 e.v.',
  AE: 'Federal Decree-Law No. 33/2021',
  SA: 'Labor Law',
  CN: '劳动合同法',
  RU: 'ТК РФ',
  IR: 'قانون کار',
};

const CONTRACT = {
  GB: 'CRA 2015 · UCTA 1977 · UK GDPR',
  FR: 'C. civ. 1171, 1231-5 · C. conso · RGPD',
  ES: 'LCGC 7/1998 · RGPD',
  IT: 'Cod. civ. 1341-1342, 1382 · Codice del Consumo',
  NL: 'BW 6:233 · 6:248 · AVG',
  EU: 'GDPR Art. 6/28/44 · UCTD 93/13 · Rome I',
  AE: 'Federal Decree-Law 5/1985 (Civil Transactions) art. 246, 390',
  SA: 'Civil Transactions Law 2023',
  CN: '民法典 496-498, 585',
  RU: 'ГК РФ ст. 428, 330-333',
  IR: 'قانون مدنی',
};

const statutes = (tr, de, shared, extra = {}) => ({
  TR: tr,
  DE: de,
  ...shared,
  ...extra,
});

export const PLAYBOOKS = {
  rent: {
    titleKey: 'playbookTitle',
    items: [
      { id: 'rent_increase', titleKey: 'playbookRentIncrease', statute: statutes('TBK m.344', 'BGB §557–§558', RENT) },
      { id: 'rent_deposit', titleKey: 'playbookRentDeposit', statute: statutes('TBK m.342', 'BGB §551', RENT) },
      { id: 'rent_notice', titleKey: 'playbookRentNotice', statute: statutes('TBK m.347', 'BGB §573–§573c', RENT) },
      { id: 'rent_maintenance', titleKey: 'playbookRentMaintenance', statute: statutes('TBK m.301, m.317', 'BGB §535–§536', RENT) },
      { id: 'rent_eviction', titleKey: 'playbookRentEviction', statute: statutes('TBK m.352, İcra İflas K. m.272–m.276', 'BGB §573', RENT) },
    ],
  },
  labor: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'labor_overtime',
        titleKey: 'playbookLaborOvertime',
        statute: statutes('İş K. m.41', 'ArbZG §3–§7', LABOR, {
          US: 'FLSA',
          EU: 'Working Time Dir. 2003/88',
        }),
      },
      {
        id: 'labor_noncompete',
        titleKey: 'playbookLaborNoncompete',
        statute: statutes('TBK m.444–m.447', 'HGB §74–§75f', LABOR, {
          US: 'CA Bus. & Prof. Code §16600',
          EU: 'EU employment law',
        }),
      },
      {
        id: 'labor_termination',
        titleKey: 'playbookLaborTermination',
        statute: statutes('İş K. m.17–m.21', 'KSchG §1, BGB §622', LABOR, {
          US: 'WARN Act / state law',
          EU: 'EU employment law',
        }),
      },
      {
        id: 'labor_severance',
        titleKey: 'playbookLaborSeverance',
        statute: statutes('İş K. m.17, m.120, 1475 sK m.14', 'BGB §622, KSchG', LABOR, {
          US: 'state wage law',
          EU: 'EU employment law',
        }),
      },
    ],
  },
  saas: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'saas_renewal',
        titleKey: 'playbookSaasRenewal',
        statute: statutes('TBK m.18, TKHK m.4–m.5', 'BGB §309 Nr. 9, UWG', CONTRACT, {
          US: 'FTCA; state common law',
        }),
      },
      {
        id: 'saas_price',
        titleKey: 'playbookSaasPrice',
        statute: statutes('TBK m.18, TKHK m.5', 'BGB §307, §309', CONTRACT, {
          US: 'state common law; UCC if goods',
        }),
      },
      {
        id: 'saas_data',
        titleKey: 'playbookSaasData',
        statute: statutes('KVKK m.4–m.12', 'DSGVO Art. 6, 28', CONTRACT, {
          US: 'CA CCPA/CPRA',
          GB: 'UK GDPR',
          EU: 'GDPR Art. 6, 28, 44',
        }),
      },
      {
        id: 'saas_sla',
        titleKey: 'playbookSaasSla',
        statute: statutes('TBK m.112–m.113, m.470–m.486', 'BGB §631–§650', CONTRACT, {
          US: 'state common law; SLA warranties',
        }),
      },
      {
        id: 'saas_acceptance',
        titleKey: 'playbookSaasAcceptance',
        statute: statutes('TBK m.479–m.480', 'BGB §640–§641', CONTRACT, {
          US: 'state common law; UCC if goods',
        }),
      },
      {
        id: 'saas_ip_license',
        titleKey: 'playbookSaasIpLicense',
        statute: statutes('FSEK m.48–m.52, TBK m.27', 'UrhG §31–§34', CONTRACT, {
          US: 'Copyright Act; license terms',
        }),
      },
    ],
  },
  sales: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'sales_warranty',
        titleKey: 'playbookSalesWarranty',
        statute: statutes('TBK m.219–m.231', 'BGB §437–§442', CONTRACT, { US: 'UCC Art. 2' }),
      },
      {
        id: 'sales_penalty',
        titleKey: 'playbookSalesPenalty',
        statute: statutes('TBK m.179–m.182', 'BGB §339–§343', CONTRACT, {
          US: 'UCC §2-718',
          IR: 'قانون مدنی 230',
        }),
      },
    ],
  },
  nda: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'nda_scope',
        titleKey: 'playbookNdaScope',
        statute: statutes('TBK m.27, TTK m.55', 'BGB §138, GeschGehG', CONTRACT, {
          US: 'DTSA / UTSA',
        }),
      },
      {
        id: 'nda_duration',
        titleKey: 'playbookNdaDuration',
        statute: statutes('TBK m.27', 'BGB §138, §307', CONTRACT, { US: 'DTSA / UTSA' }),
      },
    ],
  },
  freelance: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'freelance_scope',
        titleKey: 'playbookFreelanceScope',
        statute: statutes('TBK m.470–m.486', 'BGB §631–§650', CONTRACT, {
          US: 'state common law',
        }),
      },
      {
        id: 'freelance_pay',
        titleKey: 'playbookFreelancePay',
        statute: statutes('TBK m.479, TKHK m.4', 'BGB §632, §641', CONTRACT, {
          US: 'state common law; FTCA',
        }),
      },
    ],
  },
  consumer: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'consumer_unfair',
        titleKey: 'playbookConsumerUnfair',
        statute: statutes('TKHK m.4–m.5, TBK m.18', 'BGB §307–§309', CONTRACT, {
          US: 'FTCA',
          EU: 'UCTD 93/13',
        }),
      },
      {
        id: 'consumer_withdraw',
        titleKey: 'playbookConsumerWithdraw',
        statute: statutes('TKHK m.48, m.15', 'BGB §355', CONTRACT, {
          US: 'FTCA; state cooling-off rules',
          GB: 'CRA 2015',
          EU: 'EU consumer cooling-off rules',
        }),
      },
    ],
  },
  general: {
    titleKey: 'playbookTitle',
    items: [
      {
        id: 'general_unilateral',
        titleKey: 'playbookGeneralUnilateral',
        hintKey: 'playbookGeneralUnilateralHint',
        statute: statutes('TBK m.18', 'BGB §305–§310', CONTRACT, { US: 'state common law; UCC' }),
      },
      {
        id: 'general_liability',
        titleKey: 'playbookGeneralLiability',
        hintKey: 'playbookGeneralLiabilityHint',
        statute: statutes('TBK m.115, m.116', 'BGB §276, §309 Nr. 7', CONTRACT, {
          US: 'state common law; UCC',
        }),
      },
    ],
  },
};

export const getPlaybook = (category) => PLAYBOOKS[category] || PLAYBOOKS.general;

export const ALL_PLAYBOOK_IDS = Object.values(PLAYBOOKS).flatMap((book) =>
  (book.items || []).map((item) => item.id)
);

export function playbookItemById(id) {
  for (const book of Object.values(PLAYBOOKS)) {
    const found = (book.items || []).find((item) => item.id === id);
    if (found) return found;
  }
  return null;
}

export function defaultSignConditionIds(category) {
  const key = PLAYBOOKS[category] ? category : 'general';
  const defaults = {
    rent: ['rent_deposit', 'rent_increase', 'rent_notice'],
    labor: ['labor_noncompete', 'labor_overtime', 'labor_termination'],
    saas: ['saas_renewal', 'saas_price', 'saas_data', 'saas_sla', 'saas_acceptance', 'saas_ip_license'],
  };
  if (defaults[key]) return defaults[key];
  return (getPlaybook(key).items || []).slice(0, 3).map((item) => item.id);
}

export const statuteFor = (item, countryCode) => {
  const map = item?.statute || {};
  const cited = map[countryCode] || '';
  if (cited) return cited;
  const fallback = map.default || '';
  return /[§]|m\.\s*\d|Art\.|المادة/.test(fallback) ? fallback : '';
};
