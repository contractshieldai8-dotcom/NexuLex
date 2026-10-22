// App Review readiness guard: the "13 rejection reasons" that can be checked offline from the repo.
// Items that need a live account or the store consoles (demo credentials, App Privacy labels, screenshots) are
// reported as warnings so they are never forgotten, and never committed.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
let failed = 0;
let passed = 0;
const warnings = [];
const check = (ok, msg) => {
  if (ok) passed += 1;
  else {
    failed += 1;
    console.log(`FAIL  ${msg}`);
  }
};

const pkg = JSON.parse(read('package.json'));
const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
const sources = ['App.js', 'components/Auth.js', 'services/purchases.js', 'services/account.js', 'screens/PaywallScreen.js']
  .map((p) => read(p))
  .join('\n');

// 1. Privacy policy / terms / deletion URLs: https, one host, identical everywhere they are declared.
const urlOf = (src, key) => (src.match(new RegExp(`${key}\\s*[:=]\\s*'(https://[^']+)'`)) || [])[1];
const trust = read('constants/settingsTrust.js');
const listing = read('constants/storeListing.js');
const paywall = read('screens/PaywallScreen.js');
const privacy = [urlOf(trust, 'privacy'), urlOf(listing, 'privacy'), urlOf(paywall, 'PRIVACY_URL')];
const terms = [urlOf(trust, 'terms'), urlOf(listing, 'terms'), urlOf(paywall, 'TERMS_URL')];
const del = [urlOf(trust, 'deleteAccount'), urlOf(listing, 'deleteAccount')];
check(privacy.every(Boolean) && new Set(privacy).size === 1, 'privacy policy URL is declared identically in settings, store listing and paywall');
check(terms.every(Boolean) && new Set(terms).size === 1, 'terms URL is declared identically in settings, store listing and paywall');
check(del.every(Boolean) && new Set(del).size === 1, 'delete-account URL is declared identically');
for (const u of [...privacy, ...terms, ...del]) check(/^https:\/\/[a-z0-9.-]+\/[a-z-]+\.html$/.test(u || ''), `URL is plain https and not a Notion/Docs link: ${u}`);
for (const f of ['privacy', 'terms', 'delete-account']) check(existsSync(join(root, 'web', `${f}.html`)), `web/${f}.html exists`);
check(existsSync(join(root, 'STORE_PRIVACY_MAPPING.md')), 'STORE_PRIVACY_MAPPING.md (App Privacy label mapping) exists');

// 2. AI consent gate before any content leaves the device.
const ai = read('services/ai.js');
check(/requireAiConsent|ensureAiConsent|hasAiConsent|AI_CONSENT_REQUIRED/.test(ai + read('services/aiConsent.js')), 'AI calls are gated by the consent service');
check(existsSync(join(root, 'scripts/test-ai-consent.js')), 'AI consent test exists');

// 3 + 11. No placeholder, "coming soon" or beta wording in any shipped language.
const banned = /lorem ipsum|coming soon|\bbeta\b|testflight|todo:|fixme|tbd\b|your@email|example@|@example\.com|dummy text|placeholder text/i;
const bundleDir = join(root, 'locales/bundles');
for (const file of readdirSync(bundleDir).filter((f) => f.endsWith('.json'))) {
  const bundle = JSON.parse(readFileSync(join(bundleDir, file), 'utf8'));
  const hits = Object.entries(bundle).filter(([, v]) => typeof v === 'string' && banned.test(v)).map(([k]) => k);
  check(hits.length === 0, `${file}: no placeholder / coming-soon / beta copy (${hits.slice(0, 5).join(', ')})`);
}
for (const f of readdirSync(join(root, 'web')).filter((n) => n.endsWith('.html'))) {
  const html = read(`web/${f}`);
  check(!/lorem ipsum|coming soon|testflight|\bbeta\b/i.test(html), `web/${f}: no placeholder / coming-soon / beta wording`);
}

// 4. Demo credentials for App Review.
check(existsSync(join(root, 'APP_REVIEW_NOTES.md')), 'APP_REVIEW_NOTES.md exists');
if (existsSync(join(root, 'APP_REVIEW_NOTES.md'))) {
  const notes = read('APP_REVIEW_NOTES.md');
  if (/<DEMO_EMAIL>|<DEMO_PASSWORD>/.test(notes)) warnings.push('APP_REVIEW_NOTES.md: demo e-mail / password are not filled in yet (paste them into App Store Connect, do not commit them).');
}

// 5. Sign in with Apple is mandatory only when another third-party/social login exists.
const social = /signInWithOAuth|signInWithIdToken|GoogleSignin|expo-auth-session|react-native-fbsdk|facebook/i.test(sources) || deps.some((d) => /google-signin|fbsdk|expo-auth-session/.test(d));
const hasApple = deps.includes('expo-apple-authentication');
check(!social || hasApple, 'a third-party login exists, so Sign in with Apple must exist too');

// 6. In-app account deletion.
const account = read('services/account.js');
check(/functions\.invoke\('delete-account'/.test(account), 'account deletion calls the delete-account function');
check(existsSync(join(root, 'supabase/functions/delete-account/index.ts')), 'delete-account edge function exists');
check(/accountDeleteTitle/.test(read('App.js')) && /handleDeleteAccount/.test(read('App.js')), 'Settings has an in-app delete account button');
check(/auth\.admin\.deleteUser/.test(read('supabase/functions/delete-account/index.ts')), 'delete-account really deletes the auth user');

// 7. Permission strings are covered by test-store-config.mjs (specific, per permission).
const app = JSON.parse(read('app.json'));
const infoPlist = app.expo?.ios?.infoPlist || {};
const usage = Object.entries(infoPlist).filter(([k]) => /UsageDescription$/.test(k));
check(usage.length > 0 && usage.every(([, v]) => String(v).length >= 40 && !/needs? (access|permission)|this app (needs|requires)/i.test(v)), 'every iOS permission string states a concrete reason');

// 8. Not a bare WebView wrapper.
check(!deps.includes('react-native-webview'), 'no WebView dependency (native app, Guideline 4.2)');

// 9. Fresh install resilience.
check(/missing-config\.invalid/.test(read('services/supabase.js')), 'missing backend config cannot crash the app at launch');
check(/bootstrapFailsafe/.test(read('App.js')), 'splash cannot hang on the session check');

// 10. No other-platform references in the iOS build (App Store Review 2.3.10). Shared two-store strings must have an
// iOS "<key>Ios" variant in all 13 languages that names no other platform and is rendered through storeKey(); the
// few Android-only notes must sit behind the IS_ANDROID guard.
const otherPlatform = /\bandroid\b|play store|google play|بلاي|谷歌|プレイストア|Google\s?Play/i;
const langs = ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl'];
const bundles = Object.fromEntries(langs.map((l) => [l, JSON.parse(readFileSync(join(bundleDir, `${l}.json`), 'utf8'))]));
const flagged = new Set();
for (const l of langs) for (const [k, v] of Object.entries(bundles[l])) if (!k.endsWith('Ios') && otherPlatform.test(String(v))) flagged.add(k);
const androidOnly = new Set(['gr7RateHint', 'gr7Play', 'ux17Store']);
const shareSheet = read('components/ShareLoopSheet.js');
const uiSrc = `${read('App.js')}\n${read('screens/PaywallScreen.js')}`;
for (const key of flagged) {
  if (androidOnly.has(key)) {
    check(new RegExp(`IS_ANDROID \\? <Text[^\\n]*t\\('${key}'\\)`).test(shareSheet), `${key} (names Android / Google Play) is only rendered on Android`);
    continue;
  }
  check(uiSrc.includes(`t(storeKey('${key}', Platform.OS))`), `${key} (names Google Play) renders through storeKey so iOS gets the App Store only variant`);
  for (const l of langs) {
    const v = bundles[l][`${key}Ios`];
    check(typeof v === 'string' && v.length > 20 && !otherPlatform.test(v), `${l}.${key}Ios exists and names no other platform`);
  }
}
for (const k of ['gr7NoApple', 'gr7Align', 'gr7Get']) {
  check(!shareSheet.includes(`t('${k}')`), `pre-launch note ${k} (store listing not live yet) is not rendered`);
}

// 13. Digital goods only through IAP.
check(deps.includes('react-native-purchases'), 'subscriptions use RevenueCat / StoreKit');
check(!deps.some((d) => /stripe|paypal|iyzipay|braintree|razorpay/i.test(d)), 'no external payment SDK in dependencies');
check(!/(^|[^a-z])(stripe|paypal|iyzico)([^a-z]|$)|checkout\.stripe|buy\.stripe/i.test(sources), 'no external checkout in app code');

if (warnings.length) for (const w of warnings) console.log(`WARN  ${w}`);
console.log(failed ? `\nreview-readiness: ${failed} failed, ${passed} passed` : `OK  review-readiness: ${passed} checks`);
process.exit(failed ? 1 : 0);
