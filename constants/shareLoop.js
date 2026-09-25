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

export function inviteUrl() {
  return SHARE_LOOP_GET_URL;
}

export function rateUrl(platform) {
  return platform === 'android' ? SHARE_LOOP_PLAY_URL : SHARE_LOOP_GET_URL;
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
