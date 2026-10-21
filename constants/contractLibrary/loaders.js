/**
 * Lazy loaders for the vendored contract texts. Metro needs literal require() paths; wrapping each in a function
 * keeps the (large) texts out of memory until the user actually opens that template.
 */

/* eslint-disable global-require */
const LOADERS = {
  mutual_nda: () => require('./texts/mutual_nda').CONTRACT_TEXT,
  one_way_nda: () => require('./texts/one_way_nda').CONTRACT_TEXT,
  master_services_agreement: () => require('./texts/master_services_agreement').CONTRACT_TEXT,
  advisor_agreement: () => require('./texts/advisor_agreement').CONTRACT_TEXT,
  dpa_global: () => require('./texts/dpa_global').CONTRACT_TEXT,
  terms_of_use: () => require('./texts/terms_of_use').CONTRACT_TEXT,
  privacy_policy_gdpr: () => require('./texts/privacy_policy_gdpr').CONTRACT_TEXT,
  cookie_notice: () => require('./texts/cookie_notice').CONTRACT_TEXT,
};

export function loadContractSource(templateId) {
  const load = LOADERS[templateId];
  return load ? String(load() || '') : '';
}

export const CONTRACT_SOURCE_IDS = Object.keys(LOADERS);
