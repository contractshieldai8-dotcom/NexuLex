/**
 * WAVE ST.2 — Settings trust surface. Same public URLs the stores already list.
 * Not imported from storeListing so the listing file stays out of the app bundle.
 */

export const TRUST_URLS = {
  privacy: 'https://nexulexai.netlify.app/privacy.html',
  terms: 'https://nexulexai.netlify.app/terms.html',
  deleteAccount: 'https://nexulexai.netlify.app/delete-account.html',
};

export const TRUST_KEYS = [
  'st2Title',
  'st2Keep',
  'st2Ai',
  'st2Picker',
  'st2Sub',
  'st2Quota',
  'st2WebDelete',
  'st2Disclaimer',
  'st2Hint',
];

export function assertSettingsTrustFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`settingsTrust: ${msg}`);
  };
  check(TRUST_URLS.privacy.endsWith('/privacy.html') && TRUST_URLS.terms.endsWith('/terms.html'), 'privacy and terms URLs');
  check(TRUST_URLS.deleteAccount.endsWith('/delete-account.html'), 'web delete URL');
  check(TRUST_KEYS.length === 9 && TRUST_KEYS.includes('st2Disclaimer') && TRUST_KEYS.includes('st2Ai'), 'nine copy keys');
  check(!/anonymi|hashed|anonimleştir/i.test(TRUST_KEYS.join(' ')), 'ids are not privacy overclaims');
  check(Object.values(TRUST_URLS).every((url) => url.startsWith('https://nexulexai.netlify.app/')), 'all trust URLs stay on the public site');
  return { cases };
}
