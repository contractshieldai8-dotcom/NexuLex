/**
 * WAVE UX.2 — First-open locale corridor copy order. Existing welcome title/body stay first.
 */

export const CORRIDOR_EXTRA_KEYS = [
  'ux2Hint',
  'ux2Guess',
  'ux2Free',
  'ux2Generic',
  'ux2Intent',
  'ux2Change',
  'ux2Settings',
  'ux2Disclaimer',
];

export function corridorMessage(t, { language, country }) {
  return [
    t('localeWelcomeBody', { language, country }),
    t('ux2Hint'),
    t('ux2Guess'),
    t('ux2Free'),
    t('ux2Generic'),
    t('ux2Intent'),
    t('ux2Change'),
    t('ux2Settings'),
    t('ux2Disclaimer'),
  ].join('\n\n');
}

export function assertLocaleCorridorFixtures() {
  let cases = 0;
  const check = (cond, msg) => {
    cases += 1;
    if (!cond) throw new Error(`localeCorridor: ${msg}`);
  };
  check(CORRIDOR_EXTRA_KEYS.length === 8 && CORRIDOR_EXTRA_KEYS[CORRIDOR_EXTRA_KEYS.length - 1] === 'ux2Disclaimer', 'eight keys, disclaimer last');
  const t = (key, opts) => {
    if (key === 'localeWelcomeBody') return `Interface: ${opts.language} · Law: ${opts.country}`;
    return key;
  };
  const text = corridorMessage(t, { language: 'English', country: 'Türkiye' });
  check(text.startsWith('Interface: English'), 'existing welcome body stays first');
  check(text.trim().endsWith('ux2Disclaimer'), 'disclaimer is last');
  check(text.includes('{{') === false, 'placeholders are interpolated');
  check(!/%|win rate|best lawyer/.test(text), 'no banned claims in the join');
  return { cases };
}
