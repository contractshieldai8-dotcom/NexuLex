/**
 * WAVE LR.4 — Process guides (deterministic, local-only, 0 LLM, 0 network).
 * Steps are jurisdiction-neutral and never state a number of days: local deadlines come from
 * the legal Q&A (LR.3) or an official body. Official bodies are root pages of public
 * institutions only; names stay in the local language on purpose.
 */

import { CASE_AREAS } from '../utils/caseFiles';

export const PG_GROUPS = ['family', 'work', 'housing', 'money', 'injury', 'criminal', 'digital', 'state'];

export const PG_GROUP_ICONS = {
  family: 'people-outline',
  work: 'briefcase-outline',
  housing: 'home-outline',
  money: 'wallet-outline',
  injury: 'medkit-outline',
  criminal: 'shield-outline',
  digital: 'phone-portrait-outline',
  state: 'business-outline',
};

export const PG_STAGES = [
  'safety',
  'evidence',
  'deadline',
  'official_letter',
  'written_demand',
  'negotiate',
  'mediation',
  'authority',
  'police',
  'medical',
  'insurance',
  'legal_aid',
  'court',
  'hearing',
  'enforce',
  'appeal_admin',
  'rights',
  'contact',
  'children',
  'inventory',
  'inheritance_decision',
  'takedown',
  'data_request',
  'status',
  'keep_paying',
  'secure_accounts',
];

export const PG_BODY_TYPES = [
  'portal',
  'courts',
  'legalAid',
  'consumer',
  'dataProtection',
  'labor',
  'socialSecurity',
  'tax',
  'immigration',
  'police',
  'cyber',
  'violence',
  'ombudsman',
  'finance',
  'health',
];

export const PG_BODY_ICONS = {
  portal: 'globe-outline',
  courts: 'library-outline',
  legalAid: 'people-outline',
  consumer: 'cart-outline',
  dataProtection: 'finger-print-outline',
  labor: 'briefcase-outline',
  socialSecurity: 'umbrella-outline',
  tax: 'calculator-outline',
  immigration: 'airplane-outline',
  police: 'shield-outline',
  cyber: 'bug-outline',
  violence: 'heart-outline',
  ombudsman: 'megaphone-outline',
  finance: 'card-outline',
  health: 'medkit-outline',
};

const D = {
  messages: 'scenarioDocMessages',
  contract: 'scenarioDocContracts',
  id: 'scenarioDocId',
  payslips: 'scenarioDocPayslips',
  bank: 'scenarioDocBank',
  lease: 'scenarioDocLease',
  invoice: 'scenarioDocInvoice',
  photos: 'pgDoc_photos',
  medical: 'pgDoc_medical',
  police: 'pgDoc_police',
  official: 'pgDoc_official',
  witnesses: 'pgDoc_witnesses',
  timeline: 'pgDoc_timeline',
  civil: 'pgDoc_civil',
  estate: 'pgDoc_estate',
  insurance: 'pgDoc_insurance',
  screens: 'pgDoc_screens',
  residence: 'pgDoc_residence',
  tax: 'pgDoc_tax',
};

export const PG_NEW_DOC_KEYS = Object.values(D).filter((key) => key.startsWith('pgDoc_'));

const guide = (id, group, area, icon, stages, docs, bodies, urgent = false) => ({
  id,
  group,
  area,
  icon,
  urgent,
  titleKey: `pg_${id}_title`,
  descKey: `pg_${id}_desc`,
  focusKey: `pg_${id}_focus`,
  lawyerKey: `pg_${id}_lawyer`,
  stages,
  docKeys: docs.map((doc) => D[doc]),
  bodies,
});

export const PROCESS_GUIDES = [
  guide('divorce', 'family', 'family', 'people-outline',
    ['children', 'inventory', 'mediation', 'legal_aid', 'court', 'enforce'],
    ['id', 'civil', 'bank', 'timeline'], ['courts', 'legalAid']),
  guide('child_support', 'family', 'family', 'happy-outline',
    ['evidence', 'written_demand', 'mediation', 'authority', 'court', 'enforce'],
    ['civil', 'payslips', 'bank', 'timeline'], ['courts', 'legalAid', 'socialSecurity']),
  guide('inheritance', 'family', 'inheritance', 'git-network-outline',
    ['inventory', 'inheritance_decision', 'deadline', 'negotiate', 'court'],
    ['estate', 'civil', 'bank', 'official'], ['courts', 'legalAid', 'tax']),
  guide('domestic_violence', 'family', 'family', 'heart-outline',
    ['safety', 'evidence', 'medical', 'police', 'legal_aid', 'children'],
    ['medical', 'photos', 'messages', 'witnesses'], ['violence', 'police', 'legalAid'], true),
  guide('dismissal', 'work', 'labor', 'briefcase-outline',
    ['deadline', 'evidence', 'written_demand', 'mediation', 'authority', 'court'],
    ['contract', 'payslips', 'messages', 'official'], ['labor', 'courts', 'legalAid']),
  guide('unpaid_wages', 'work', 'labor', 'cash-outline',
    ['evidence', 'written_demand', 'authority', 'mediation', 'court', 'enforce'],
    ['payslips', 'bank', 'contract', 'timeline'], ['labor', 'socialSecurity', 'courts']),
  guide('workplace_harassment', 'work', 'labor', 'hand-left-outline',
    ['evidence', 'contact', 'authority', 'medical', 'deadline', 'court'],
    ['messages', 'witnesses', 'medical', 'timeline'], ['labor', 'ombudsman', 'police']),
  guide('tenant_rights', 'housing', 'rent', 'home-outline',
    ['keep_paying', 'evidence', 'written_demand', 'official_letter', 'mediation', 'court'],
    ['lease', 'bank', 'photos', 'messages'], ['courts', 'consumer', 'legalAid']),
  guide('landlord_arrears', 'housing', 'rent', 'key-outline',
    ['evidence', 'written_demand', 'negotiate', 'deadline', 'court', 'enforce'],
    ['lease', 'bank', 'messages', 'official'], ['courts', 'legalAid']),
  guide('neighbor_dispute', 'housing', 'other', 'volume-high-outline',
    ['evidence', 'negotiate', 'mediation', 'authority', 'court'],
    ['photos', 'witnesses', 'timeline', 'messages'], ['ombudsman', 'police', 'courts']),
  guide('consumer_refund', 'money', 'consumer', 'cart-outline',
    ['evidence', 'written_demand', 'authority', 'mediation', 'court'],
    ['invoice', 'photos', 'messages', 'contract'], ['consumer', 'courts']),
  guide('scam_victim', 'money', 'criminal', 'alert-circle-outline',
    ['secure_accounts', 'evidence', 'police', 'authority', 'written_demand'],
    ['bank', 'screens', 'messages', 'timeline'], ['cyber', 'police', 'consumer', 'finance'], true),
  guide('debt_defense', 'money', 'enforcement', 'wallet-outline',
    ['official_letter', 'deadline', 'evidence', 'negotiate', 'legal_aid', 'court'],
    ['official', 'contract', 'bank', 'messages'], ['courts', 'legalAid', 'finance']),
  guide('small_claim', 'money', 'debt', 'hammer-outline',
    ['evidence', 'written_demand', 'deadline', 'mediation', 'court', 'enforce'],
    ['contract', 'bank', 'messages', 'invoice'], ['courts', 'legalAid']),
  guide('business_invoice', 'money', 'contract', 'receipt-outline',
    ['evidence', 'written_demand', 'negotiate', 'deadline', 'court', 'enforce'],
    ['invoice', 'contract', 'messages', 'bank'], ['courts']),
  guide('traffic_accident', 'injury', 'traffic', 'car-outline',
    ['safety', 'police', 'evidence', 'medical', 'insurance', 'deadline'],
    ['police', 'photos', 'insurance', 'medical'], ['police', 'finance', 'courts'], true),
  guide('medical_error', 'injury', 'other', 'medkit-outline',
    ['medical', 'evidence', 'written_demand', 'authority', 'deadline', 'court'],
    ['medical', 'invoice', 'timeline', 'witnesses'], ['health', 'ombudsman', 'courts']),
  guide('crime_victim', 'criminal', 'criminal', 'shield-outline',
    ['safety', 'evidence', 'police', 'medical', 'legal_aid', 'deadline'],
    ['police', 'medical', 'photos', 'witnesses'], ['police', 'cyber', 'legalAid'], true),
  guide('police_questioning', 'criminal', 'criminal', 'hand-right-outline',
    ['rights', 'contact', 'legal_aid', 'official_letter', 'hearing'],
    ['id', 'official', 'timeline', 'witnesses'], ['legalAid', 'ombudsman', 'courts'], true),
  guide('online_defamation', 'digital', 'other', 'chatbubbles-outline',
    ['evidence', 'takedown', 'written_demand', 'police', 'deadline', 'court'],
    ['screens', 'witnesses', 'timeline', 'messages'], ['cyber', 'dataProtection', 'police', 'courts']),
  guide('data_privacy', 'digital', 'other', 'finger-print-outline',
    ['data_request', 'evidence', 'authority', 'court'],
    ['screens', 'messages', 'id', 'official'], ['dataProtection']),
  guide('residence_permit', 'state', 'immigration', 'airplane-outline',
    ['status', 'evidence', 'official_letter', 'appeal_admin', 'legal_aid', 'contact'],
    ['residence', 'id', 'official', 'contract'], ['immigration', 'legalAid', 'ombudsman']),
  guide('benefit_denied', 'state', 'administrative', 'umbrella-outline',
    ['appeal_admin', 'deadline', 'evidence', 'medical', 'legal_aid', 'court'],
    ['official', 'medical', 'payslips', 'id'], ['socialSecurity', 'ombudsman', 'courts']),
  guide('tax_dispute', 'state', 'tax', 'calculator-outline',
    ['official_letter', 'deadline', 'evidence', 'keep_paying', 'appeal_admin', 'court'],
    ['tax', 'bank', 'invoice', 'official'], ['tax', 'ombudsman', 'courts']),
  guide('fine_appeal', 'state', 'administrative', 'speedometer-outline',
    ['official_letter', 'deadline', 'evidence', 'appeal_admin', 'court'],
    ['official', 'photos', 'witnesses', 'id'], ['police', 'courts', 'ombudsman']),
];

const b = (name, url) => ({ name, url });

/** Root pages of official / statutory bodies. One entry may list several bodies. */
export const OFFICIAL_BODIES = {
  TR: {
    portal: [b('e-Devlet Kapısı', 'https://www.turkiye.gov.tr')],
    courts: [b('UYAP Vatandaş Portalı', 'https://vatandas.uyap.gov.tr')],
    legalAid: [b('Türkiye Barolar Birliği', 'https://www.barobirlik.org.tr')],
    consumer: [b('Ticaret Bakanlığı – Tüketici', 'https://tuketici.ticaret.gov.tr')],
    dataProtection: [b('Kişisel Verileri Koruma Kurumu', 'https://www.kvkk.gov.tr')],
    labor: [b('Çalışma ve Sosyal Güvenlik Bakanlığı', 'https://www.csgb.gov.tr')],
    socialSecurity: [b('Sosyal Güvenlik Kurumu', 'https://www.sgk.gov.tr')],
    tax: [b('Gelir İdaresi Başkanlığı', 'https://www.gib.gov.tr')],
    immigration: [b('Göç İdaresi Başkanlığı', 'https://www.goc.gov.tr')],
    police: [b('Emniyet Genel Müdürlüğü', 'https://www.egm.gov.tr')],
    violence: [b('Aile ve Sosyal Hizmetler Bakanlığı', 'https://www.aile.gov.tr')],
    ombudsman: [b('Kamu Denetçiliği Kurumu', 'https://www.ombudsman.gov.tr')],
    finance: [b('BDDK', 'https://www.bddk.org.tr')],
    health: [b('Sağlık Bakanlığı', 'https://www.saglik.gov.tr')],
  },
  US: {
    portal: [b('USA.gov', 'https://www.usa.gov')],
    courts: [b('U.S. Courts', 'https://www.uscourts.gov')],
    legalAid: [b('Legal Services Corporation', 'https://www.lsc.gov')],
    consumer: [b('FTC – ReportFraud', 'https://reportfraud.ftc.gov')],
    dataProtection: [b('Federal Trade Commission', 'https://www.ftc.gov')],
    labor: [b('U.S. Department of Labor', 'https://www.dol.gov'), b('EEOC', 'https://www.eeoc.gov')],
    socialSecurity: [b('Social Security Administration', 'https://www.ssa.gov')],
    tax: [b('IRS', 'https://www.irs.gov'), b('Taxpayer Advocate Service', 'https://www.taxpayeradvocate.irs.gov')],
    immigration: [b('USCIS', 'https://www.uscis.gov')],
    cyber: [b('FBI – IC3', 'https://www.ic3.gov')],
    violence: [b('National Domestic Violence Hotline', 'https://www.thehotline.org')],
    finance: [b('Consumer Financial Protection Bureau', 'https://www.consumerfinance.gov')],
    health: [b('U.S. Department of Health & Human Services', 'https://www.hhs.gov')],
  },
  GB: {
    portal: [b('GOV.UK', 'https://www.gov.uk')],
    courts: [b('HM Courts & Tribunals Service', 'https://www.gov.uk/government/organisations/hm-courts-and-tribunals-service')],
    legalAid: [b('GOV.UK – Legal aid', 'https://www.gov.uk/legal-aid')],
    consumer: [b('Citizens Advice', 'https://www.citizensadvice.org.uk')],
    dataProtection: [b("Information Commissioner's Office", 'https://ico.org.uk')],
    labor: [b('Acas', 'https://www.acas.org.uk')],
    socialSecurity: [b('GOV.UK – Benefits', 'https://www.gov.uk/browse/benefits')],
    tax: [b('HM Revenue & Customs', 'https://www.gov.uk/government/organisations/hm-revenue-customs')],
    immigration: [b('GOV.UK – Visas and immigration', 'https://www.gov.uk/browse/visas-immigration')],
    police: [b('Police.uk', 'https://www.police.uk')],
    violence: [b('National Domestic Abuse Helpline', 'https://www.nationaldahelpline.org.uk')],
    ombudsman: [b('Parliamentary and Health Service Ombudsman', 'https://www.ombudsman.org.uk')],
    finance: [b('Financial Ombudsman Service', 'https://www.financial-ombudsman.org.uk')],
    health: [b('NHS', 'https://www.nhs.uk')],
  },
  DE: {
    portal: [b('Justizportal des Bundes und der Länder', 'https://justiz.de')],
    courts: [b('Justizportal des Bundes und der Länder', 'https://justiz.de')],
    legalAid: [b('Bundesministerium der Justiz', 'https://www.bmj.de')],
    consumer: [b('Verbraucherzentrale', 'https://www.verbraucherzentrale.de'), b('Universalschlichtungsstelle des Bundes', 'https://www.verbraucher-schlichter.de')],
    dataProtection: [b('BfDI', 'https://www.bfdi.bund.de')],
    labor: [b('Bundesagentur für Arbeit', 'https://www.arbeitsagentur.de'), b('Antidiskriminierungsstelle des Bundes', 'https://www.antidiskriminierungsstelle.de')],
    socialSecurity: [b('Deutsche Rentenversicherung', 'https://www.deutsche-rentenversicherung.de')],
    tax: [b('ELSTER', 'https://www.elster.de')],
    immigration: [b('BAMF', 'https://www.bamf.de')],
    police: [b('Polizei', 'https://www.polizei.de')],
    cyber: [b('BSI', 'https://www.bsi.bund.de')],
    violence: [b('Hilfetelefon Gewalt gegen Frauen', 'https://www.hilfetelefon.de')],
    finance: [b('BaFin', 'https://www.bafin.de')],
    health: [b('Unabhängige Patientenberatung', 'https://www.patientenberatung.de')],
  },
  FR: {
    portal: [b('Service-Public.fr', 'https://www.service-public.fr')],
    courts: [b('Justice.fr', 'https://www.justice.fr')],
    legalAid: [b('Ministère de la Justice', 'https://www.justice.gouv.fr')],
    consumer: [b('SignalConso', 'https://signal.conso.gouv.fr')],
    dataProtection: [b('CNIL', 'https://www.cnil.fr')],
    labor: [b('Ministère du Travail', 'https://travail-emploi.gouv.fr')],
    socialSecurity: [b('Ameli', 'https://www.ameli.fr'), b('CAF', 'https://www.caf.fr')],
    tax: [b('impots.gouv.fr', 'https://www.impots.gouv.fr')],
    immigration: [b('Administration des étrangers en France', 'https://administration-etrangers-en-france.interieur.gouv.fr')],
    police: [b('Ma Sécurité', 'https://www.masecurite.interieur.gouv.fr')],
    cyber: [b('Cybermalveillance.gouv.fr', 'https://www.cybermalveillance.gouv.fr'), b('PHAROS', 'https://www.internet-signalement.gouv.fr')],
    violence: [b('Arrêtons les violences', 'https://arretonslesviolences.gouv.fr')],
    ombudsman: [b('Défenseur des droits', 'https://www.defenseurdesdroits.fr')],
    finance: [b('Banque de France', 'https://www.banque-france.fr')],
  },
  ES: {
    portal: [b('administracion.gob.es', 'https://administracion.gob.es')],
    courts: [b('Poder Judicial', 'https://www.poderjudicial.es')],
    legalAid: [b('Ministerio de Justicia', 'https://www.mjusticia.gob.es')],
    consumer: [b('Ministerio de Consumo', 'https://www.consumo.gob.es')],
    dataProtection: [b('AEPD', 'https://www.aepd.es')],
    labor: [b('Ministerio de Trabajo y Economía Social', 'https://www.mites.gob.es')],
    socialSecurity: [b('Seguridad Social', 'https://www.seg-social.es')],
    tax: [b('Agencia Tributaria', 'https://sede.agenciatributaria.gob.es')],
    immigration: [b('Portal de Inmigración', 'https://extranjeros.inclusion.gob.es')],
    police: [b('Policía Nacional', 'https://www.policia.es')],
    cyber: [b('INCIBE', 'https://www.incibe.es')],
    violence: [b('Delegación del Gobierno contra la Violencia de Género', 'https://violenciagenero.igualdad.gob.es')],
    ombudsman: [b('Defensor del Pueblo', 'https://www.defensordelpueblo.es')],
    finance: [b('Banco de España', 'https://www.bde.es')],
  },
  IT: {
    courts: [b('Ministero della Giustizia', 'https://www.giustizia.it')],
    consumer: [b('AGCM', 'https://www.agcm.it')],
    dataProtection: [b('Garante per la protezione dei dati personali', 'https://www.garanteprivacy.it')],
    labor: [b('Ispettorato Nazionale del Lavoro', 'https://www.ispettorato.gov.it')],
    socialSecurity: [b('INPS', 'https://www.inps.it')],
    tax: [b('Agenzia delle Entrate', 'https://www.agenziaentrate.gov.it')],
    immigration: [b('Polizia di Stato', 'https://www.poliziadistato.it')],
    police: [b('Polizia di Stato', 'https://www.poliziadistato.it')],
    cyber: [b('Polizia Postale', 'https://www.commissariatodips.it')],
    finance: [b('Arbitro Bancario Finanziario', 'https://www.arbitrobancariofinanziario.it')],
  },
  NL: {
    portal: [b('Rijksoverheid', 'https://www.rijksoverheid.nl')],
    courts: [b('De Rechtspraak', 'https://www.rechtspraak.nl')],
    legalAid: [b('Het Juridisch Loket', 'https://www.juridischloket.nl')],
    consumer: [b('ConsuWijzer', 'https://www.consuwijzer.nl'), b('De Geschillencommissie', 'https://www.degeschillencommissie.nl')],
    dataProtection: [b('Autoriteit Persoonsgegevens', 'https://www.autoriteitpersoonsgegevens.nl')],
    labor: [b('Nederlandse Arbeidsinspectie', 'https://www.nlarbeidsinspectie.nl')],
    socialSecurity: [b('UWV', 'https://www.uwv.nl'), b('SVB', 'https://www.svb.nl')],
    tax: [b('Belastingdienst', 'https://www.belastingdienst.nl')],
    immigration: [b('IND', 'https://ind.nl')],
    police: [b('Politie', 'https://www.politie.nl')],
    cyber: [b('Fraudehelpdesk', 'https://www.fraudehelpdesk.nl')],
    violence: [b('Veilig Thuis', 'https://www.veiligthuis.nl')],
    ombudsman: [b('Nationale ombudsman', 'https://www.nationaleombudsman.nl')],
    finance: [b('Kifid', 'https://www.kifid.nl')],
  },
  PT: {
    portal: [b('ePortugal', 'https://eportugal.gov.pt')],
    courts: [b('Justiça.gov.pt', 'https://justica.gov.pt')],
    legalAid: [b('Segurança Social – Proteção jurídica', 'https://www.seg-social.pt')],
    consumer: [b('Livro de Reclamações', 'https://www.livroreclamacoes.pt'), b('Portal do Consumidor', 'https://www.consumidor.gov.pt')],
    dataProtection: [b('CNPD', 'https://www.cnpd.pt')],
    labor: [b('ACT – Autoridade para as Condições do Trabalho', 'https://www.act.gov.pt')],
    socialSecurity: [b('Segurança Social', 'https://www.seg-social.pt')],
    tax: [b('Portal das Finanças', 'https://www.portaldasfinancas.gov.pt')],
    immigration: [b('AIMA', 'https://aima.gov.pt')],
    police: [b('PSP', 'https://www.psp.pt')],
    violence: [b('CIG', 'https://www.cig.gov.pt')],
    ombudsman: [b('Provedor de Justiça', 'https://www.provedor-jus.pt')],
    finance: [b('Banco de Portugal', 'https://www.bportugal.pt')],
  },
  BR: {
    portal: [b('gov.br', 'https://www.gov.br')],
    courts: [b('Conselho Nacional de Justiça', 'https://www.cnj.jus.br')],
    legalAid: [b('Defensoria Pública da União', 'https://www.dpu.def.br')],
    consumer: [b('consumidor.gov.br', 'https://www.consumidor.gov.br')],
    dataProtection: [b('ANPD', 'https://www.gov.br/anpd')],
    labor: [b('Ministério do Trabalho e Emprego', 'https://www.gov.br/trabalho-e-emprego')],
    socialSecurity: [b('INSS', 'https://www.gov.br/inss')],
    tax: [b('Receita Federal', 'https://www.gov.br/receitafederal')],
    immigration: [b('Polícia Federal', 'https://www.gov.br/pf')],
    violence: [b('Ministério das Mulheres – Ligue 180', 'https://www.gov.br/mulheres')],
    finance: [b('Banco Central do Brasil', 'https://www.bcb.gov.br')],
  },
  AE: {
    portal: [b('u.ae', 'https://u.ae')],
    courts: [b('Ministry of Justice', 'https://www.moj.gov.ae')],
    consumer: [b('Ministry of Economy', 'https://www.moec.gov.ae')],
    labor: [b('MOHRE', 'https://www.mohre.gov.ae')],
    tax: [b('Federal Tax Authority', 'https://tax.gov.ae')],
    immigration: [b('ICP', 'https://icp.gov.ae')],
    finance: [b('Central Bank of the UAE', 'https://www.centralbank.ae')],
  },
  SA: {
    portal: [b('my.gov.sa', 'https://my.gov.sa')],
    courts: [b('ناجز', 'https://najiz.sa'), b('وزارة العدل', 'https://www.moj.gov.sa')],
    consumer: [b('وزارة التجارة', 'https://mc.gov.sa')],
    dataProtection: [b('سدايا', 'https://sdaia.gov.sa')],
    labor: [b('وزارة الموارد البشرية والتنمية الاجتماعية', 'https://hrsd.gov.sa')],
    socialSecurity: [b('المؤسسة العامة للتأمينات الاجتماعية', 'https://www.gosi.gov.sa')],
    tax: [b('هيئة الزكاة والضريبة والجمارك', 'https://zatca.gov.sa')],
    immigration: [b('أبشر', 'https://www.absher.sa')],
    finance: [b('البنك المركزي السعودي', 'https://www.sama.gov.sa')],
  },
  CN: {
    portal: [b('中国政府网', 'https://www.gov.cn')],
    courts: [b('最高人民法院', 'https://www.court.gov.cn')],
    legalAid: [b('司法部', 'https://www.moj.gov.cn')],
    consumer: [b('全国12315平台', 'https://www.12315.cn')],
    labor: [b('人力资源和社会保障部', 'https://www.mohrss.gov.cn')],
    socialSecurity: [b('人力资源和社会保障部', 'https://www.mohrss.gov.cn')],
    tax: [b('国家税务总局', 'https://www.chinatax.gov.cn')],
    immigration: [b('国家移民管理局', 'https://www.nia.gov.cn')],
    cyber: [b('12377 违法和不良信息举报中心', 'https://www.12377.cn')],
  },
  RU: {
    portal: [b('Госуслуги', 'https://www.gosuslugi.ru')],
    courts: [b('ГАС «Правосудие»', 'https://sudrf.ru')],
    legalAid: [b('Минюст России', 'https://minjust.gov.ru')],
    consumer: [b('Роспотребнадзор', 'https://www.rospotrebnadzor.ru')],
    dataProtection: [b('Роскомнадзор', 'https://rkn.gov.ru')],
    labor: [b('Роструд', 'https://rostrud.gov.ru')],
    socialSecurity: [b('Социальный фонд России', 'https://sfr.gov.ru')],
    tax: [b('ФНС России', 'https://www.nalog.gov.ru')],
    finance: [b('Банк России', 'https://www.cbr.ru')],
  },
  IR: {
    courts: [b('خدمات الکترونیک قضایی', 'https://adliran.ir')],
    labor: [b('وزارت تعاون، کار و رفاه اجتماعی', 'https://www.mcls.gov.ir')],
    socialSecurity: [b('سازمان تأمین اجتماعی', 'https://www.tamin.ir')],
    tax: [b('سازمان امور مالیاتی', 'https://www.intamedia.ir')],
    cyber: [b('پلیس فتا', 'https://www.cyberpolice.ir')],
  },
  JP: {
    portal: [b('e-Gov', 'https://www.e-gov.go.jp')],
    courts: [b('裁判所', 'https://www.courts.go.jp')],
    legalAid: [b('法テラス', 'https://www.houterasu.or.jp')],
    consumer: [b('国民生活センター', 'https://www.kokusen.go.jp')],
    dataProtection: [b('個人情報保護委員会', 'https://www.ppc.go.jp')],
    labor: [b('厚生労働省', 'https://www.mhlw.go.jp')],
    socialSecurity: [b('日本年金機構', 'https://www.nenkin.go.jp')],
    tax: [b('国税庁', 'https://www.nta.go.jp')],
    immigration: [b('出入国在留管理庁', 'https://www.moj.go.jp/isa/')],
    police: [b('警察庁', 'https://www.npa.go.jp')],
    violence: [b('内閣府 男女共同参画局', 'https://www.gender.go.jp')],
    finance: [b('金融庁', 'https://www.fsa.go.jp')],
  },
  EU: {
    courts: [b('European e-Justice Portal', 'https://e-justice.europa.eu')],
    consumer: [b('Your Europe', 'https://europa.eu/youreurope')],
    dataProtection: [b('European Data Protection Board', 'https://www.edpb.europa.eu')],
  },
};

export const PG_EU_MEMBERS = [
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
  'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
];

const EMERGENCY = {
  TR: '112',
  US: '911',
  CA: '911',
  GB: '999 / 112',
  DE: '112 / 110',
  FR: '112 / 17',
  BR: '190 / 192',
  AE: '999',
  SA: '911',
  CN: '110 / 120',
  RU: '112',
  IR: '110 / 115',
  JP: '110 / 119',
};

export function emergencyNumberFor(jurisdiction) {
  const code = String(jurisdiction || '').toUpperCase();
  if (EMERGENCY[code]) return EMERGENCY[code];
  return PG_EU_MEMBERS.includes(code) ? '112' : null;
}

export function getGuide(id) {
  return PROCESS_GUIDES.find((item) => item.id === id) || null;
}

export function guidesInGroup(group) {
  return group ? PROCESS_GUIDES.filter((item) => item.group === group) : PROCESS_GUIDES;
}

/** Case- and accent-insensitive match on the translated title and description. */
export function searchGuides(query, t, list = PROCESS_GUIDES) {
  const fold = (s) =>
    String(s || '')
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const q = fold(query).trim();
  if (!q) return list;
  return list.filter((item) => fold(`${t(item.titleKey)} ${t(item.descKey)}`).includes(q));
}

/** Official bodies for the guide in this jurisdiction (+ EU bodies for members); portal always first. */
export function officialLinksFor(item, jurisdiction) {
  const code = String(jurisdiction || '').toUpperCase();
  const tables = [OFFICIAL_BODIES[code], PG_EU_MEMBERS.includes(code) ? OFFICIAL_BODIES.EU : null].filter(Boolean);
  const seen = new Set();
  const out = [];
  ['portal', ...(item?.bodies || [])].forEach((type) => {
    tables.forEach((table) => {
      (table[type] || []).forEach((body) => {
        if (seen.has(body.url)) return;
        seen.add(body.url);
        out.push({ type, name: body.name, url: body.url });
      });
    });
  });
  return out;
}

/** Plain text for copy / share; the disclaimer is always the last line. */
export function formatGuideText(item, t, { links = [], emergency = null, disclaimer = '' } = {}) {
  if (!item) return '';
  const lines = [t(item.titleKey), t(item.descKey), ''];
  if (item.urgent) {
    lines.push(`${emergency ? t('pgEmergency', { number: emergency }) : t('pgEmergencyGeneric')}`, '');
  }
  lines.push(`${t('pgFocusTitle')}: ${t(item.focusKey)}`, '', t('pgStepsTitle'));
  item.stages.forEach((stage, index) => {
    lines.push(`${index + 1}. ${t(`pgStage_${stage}_t`)}`, `   ${t(`pgStage_${stage}_d`)}`);
  });
  lines.push('', t('pgDocsTitle'));
  item.docKeys.forEach((key) => lines.push(`• ${t(key)}`));
  if (links.length) {
    lines.push('', t('pgLinksTitle'));
    links.forEach((link) => lines.push(`• ${link.name}: ${link.url}`));
  }
  lines.push('', `${t('pgLawyerTitle')}: ${t(item.lawyerKey)}`);
  if (disclaimer) lines.push('', '—', disclaimer);
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Every i18n key the guides need (verify + fixtures). */
export function processGuideKeys() {
  const keys = new Set();
  PROCESS_GUIDES.forEach((item) => {
    [item.titleKey, item.descKey, item.focusKey, item.lawyerKey, ...item.docKeys].forEach((key) => keys.add(key));
  });
  PG_STAGES.forEach((stage) => {
    keys.add(`pgStage_${stage}_t`);
    keys.add(`pgStage_${stage}_d`);
  });
  PG_GROUPS.forEach((group) => keys.add(`pgGroup_${group}`));
  PG_BODY_TYPES.forEach((type) => keys.add(`pgBody_${type}`));
  return [...keys];
}

export function assertProcessGuideFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`processGuides: ${msg}`);
  };
  check(PROCESS_GUIDES.length === 25, 'expected 25 guides');
  check(new Set(PROCESS_GUIDES.map((item) => item.id)).size === 25, 'duplicate guide id');
  check(PROCESS_GUIDES.every((item) => PG_GROUPS.includes(item.group)), 'unknown group');
  check(PROCESS_GUIDES.every((item) => CASE_AREAS.includes(item.area)), 'area must be a case area');
  check(PROCESS_GUIDES.every((item) => item.stages.length >= 4 && item.stages.every((s) => PG_STAGES.includes(s))), 'stages');
  check(PROCESS_GUIDES.every((item) => new Set(item.stages).size === item.stages.length), 'repeated stage');
  check(PROCESS_GUIDES.every((item) => item.docKeys.length >= 3 && item.docKeys.every(Boolean)), 'docs');
  check(PROCESS_GUIDES.every((item) => item.bodies.every((type) => PG_BODY_TYPES.includes(type))), 'body types');
  check(PG_STAGES.every((s) => PROCESS_GUIDES.some((item) => item.stages.includes(s))), 'unused stage');
  check(PG_GROUPS.every((g) => guidesInGroup(g).length >= 2), 'group with fewer than two guides');
  check(PROCESS_GUIDES.filter((item) => item.urgent).every((item) => item.stages[0] === 'safety' || item.stages[0] === 'rights' || item.stages[0] === 'secure_accounts'), 'urgent guides start with safety/rights');
  const urls = Object.values(OFFICIAL_BODIES).flatMap((table) => Object.values(table).flat().map((body) => body.url));
  check(urls.every((url) => /^https:\/\/[a-z0-9.-]+\.[a-z0-9]{2,}(\/[A-Za-z0-9/_-]*)?$/.test(url)), 'body urls must be plain https roots');
  check(Object.values(OFFICIAL_BODIES).every((table) => Object.keys(table).every((type) => PG_BODY_TYPES.includes(type))), 'unknown body type');
  const tr = officialLinksFor(getGuide('consumer_refund'), 'TR');
  check(tr[0].type === 'portal' && tr.some((link) => link.url === 'https://tuketici.ticaret.gov.tr'), 'TR consumer links');
  const de = officialLinksFor(getGuide('data_privacy'), 'DE');
  check(de.some((link) => link.url === 'https://www.bfdi.bund.de') && de.some((link) => link.url === 'https://www.edpb.europa.eu'), 'EU member gets national + EU bodies');
  check(officialLinksFor(getGuide('divorce'), 'BE').every((link) => link.url.includes('europa.eu')), 'EU member without a national table gets EU bodies only');
  check(officialLinksFor(getGuide('divorce'), 'XX').length === 0, 'unknown country has no links');
  check(new Set(officialLinksFor(getGuide('unpaid_wages'), 'CN').map((l) => l.url)).size === officialLinksFor(getGuide('unpaid_wages'), 'CN').length, 'links are de-duplicated');
  check(emergencyNumberFor('BE') === '112' && emergencyNumberFor('US') === '911' && emergencyNumberFor('XX') === null, 'emergency numbers');
  const fakeT = (key, opts) => (opts?.number ? `${key}:${opts.number}` : key);
  const text = formatGuideText(getGuide('traffic_accident'), fakeT, { links: tr, emergency: '112', disclaimer: 'DISCLAIMER' });
  check(text.endsWith('DISCLAIMER') && text.includes('pgEmergency:112') && text.includes('pgStage_safety_t'), 'share text');
  check(searchGuides('pg_divorce', (k) => k).length === 1 && searchGuides('', (k) => k).length === 25, 'search');
  check(searchGuides('BOSANMA', (k) => (k === 'pg_divorce_title' ? 'Boşanma' : k)).length === 1, 'search folds case and accents');
  check(processGuideKeys().length === 25 * 4 + PG_NEW_DOC_KEYS.length + 7 + PG_STAGES.length * 2 + PG_GROUPS.length + PG_BODY_TYPES.length, 'key inventory');
  return { cases, guides: PROCESS_GUIDES.length, bodies: urls.length };
}
