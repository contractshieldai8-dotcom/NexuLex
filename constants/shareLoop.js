/**
 * WAVE GR.3 — After a first successful scan, invite a second pair of eyes.
 * The payload is the public get page only. No contract text, no report, no win %.
 */

export const SHARE_LOOP_GET_URL = 'https://nexulexai.netlify.app/get.html';
export const SHARE_LOOP_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.nexulex.ai';

export const SHARE_LOOP_KEYS = [
  'vlTitle',
  'vlHint',
  'vlShare',
  'vlShareHint',
  'vlCopy',
  'vlCopied',
  'vlRate',
  'vlRateHint',
  'vlSkip',
  'vlDisclaimer',
  'vlInviteBody',
  'vlCardTitle',
  'vlCardBody',
  'vlRateFailed',
  'vlShareFailed',
  'vlLinkLabel',
];

export const SHARE_LOOP_LOCALE_KEYS = [
  'gr7RateHint',
  'gr7InviteHint',
  'gr7Play',
  'gr7Get',
  'gr7NoApple',
  'gr7Align',
  'gr7Country',
  'gr7Note',
];

const STORE_LANGS = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];

export function inviteUrl(language) {
  const lang = String(language || '')
    .split(/[-_]/)[0]
    .toLowerCase();
  if (STORE_LANGS.includes(lang)) return `${SHARE_LOOP_GET_URL}?lang=${lang}`;
  return SHARE_LOOP_GET_URL;
}

export function playUrlForLocale(language, country) {
  const hl = String(language || '')
    .split(/[-_]/)[0]
    .toLowerCase();
  const gl = String(country || '')
    .split(/[-_]/)[0]
    .toUpperCase();
  const parts = [];
  if (STORE_LANGS.includes(hl)) parts.push(`hl=${hl}`);
  if (/^[A-Z]{2}$/.test(gl) && gl !== 'EU') parts.push(`gl=${gl}`);
  if (!parts.length) return SHARE_LOOP_PLAY_URL;
  return `${SHARE_LOOP_PLAY_URL}&${parts.join('&')}`;
}

export function rateUrl(platform, locale) {
  if (platform === 'android') {
    if (!locale) return SHARE_LOOP_PLAY_URL;
    return playUrlForLocale(locale.language, locale.country);
  }
  if (!locale) return SHARE_LOOP_GET_URL;
  return inviteUrl(locale.language);
}

export function buildInvitePayload(t, url = SHARE_LOOP_GET_URL) {
  const href = String(url || SHARE_LOOP_GET_URL).trim();
  const message = String(t('vlInviteBody', { url: href }) || '').trim();
  return { message, url: href };
}

export function inviteLeaksAnalysis(message, analysis) {
  const hay = String(message || '');
  const suspects = [
    analysis?.contract_text,
    analysis?.contractText,
    analysis?.summary,
    analysis?.revised_contract_text,
    analysis?.id,
  ]
    .map((value) => String(value || '').trim())
    .filter((value) => value.length >= 12);
  return suspects.some((value) => hay.includes(value));
}

export function assertShareLoopFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`shareLoop: ${msg}`);
  };
  check(/^https:\/\/nexulexai\.netlify\.app\/get\.html$/.test(SHARE_LOOP_GET_URL), 'public get page');
  check(SHARE_LOOP_PLAY_URL.endsWith('id=com.nexulex.ai'), 'Play package id');
  check(rateUrl('android') === SHARE_LOOP_PLAY_URL && rateUrl('ios') === SHARE_LOOP_GET_URL, 'rate targets');
  const payload = buildInvitePayload((key, opts) => `NexuLex invite ${opts.url}`, SHARE_LOOP_GET_URL);
  check(payload.message.includes(SHARE_LOOP_GET_URL) && payload.url === SHARE_LOOP_GET_URL, 'invite carries the get URL');
  check(
    !inviteLeaksAnalysis(payload.message, {
      contract_text: 'Secret lease clause about deposit return timing',
      id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    }),
    'invite never includes the contract or analysis id'
  );
  check(inviteLeaksAnalysis('Secret lease clause about deposit return timing', { contract_text: 'Secret lease clause about deposit return timing' }), 'leak detector works');
  check(SHARE_LOOP_KEYS.length === 16 && SHARE_LOOP_KEYS.includes('vlInviteBody'), 'sixteen keys including the invite body');
  check(!/%|win rate|best lawyer/i.test(payload.message), 'no rankings or win rate');
  return { cases };
}

/** WAVE GR.7 — country-aware Play listing + get.html?lang=; iOS stays on the public page (no Apple id yet). */
export function assertShareLoopLocaleFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`shareLoopLocale: ${msg}`);
  };
  check(rateUrl('android') === SHARE_LOOP_PLAY_URL && rateUrl('ios') === SHARE_LOOP_GET_URL, 'bare rateUrl stays GR.3-identical');
  check(inviteUrl() === SHARE_LOOP_GET_URL && inviteUrl('xx') === SHARE_LOOP_GET_URL, 'unknown language stays on get.html');
  check(inviteUrl('tr') === `${SHARE_LOOP_GET_URL}?lang=tr` && inviteUrl('de') === `${SHARE_LOOP_GET_URL}?lang=de`, 'invite adds lang');
  const playTr = playUrlForLocale('tr', 'TR');
  check(playTr.includes('id=com.nexulex.ai') && playTr.includes('hl=tr') && playTr.includes('gl=TR'), 'Play TR locale');
  check(rateUrl('android', { language: 'fr', country: 'FR' }).includes('hl=fr'), 'Android rate follows language');
  check(rateUrl('ios', { language: 'ja' }) === `${SHARE_LOOP_GET_URL}?lang=ja`, 'iOS rate stays on get.html with lang');
  check(!playUrlForLocale('en', 'auto').includes('gl='), 'auto country does not invent a Play gl');
  check(inviteUrl('tr').startsWith(SHARE_LOOP_GET_URL) && !inviteUrl('tr').includes('contract'), 'invite never leaves get.html');
  check(SHARE_LOOP_LOCALE_KEYS.length === 8 && SHARE_LOOP_LOCALE_KEYS.includes('gr7NoApple'), 'eight locale keys including no Apple id');
  check(playUrlForLocale('', '') === SHARE_LOOP_PLAY_URL, 'empty locale stays on the bare Play url');
  return { cases };
}
