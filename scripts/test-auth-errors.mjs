// Offline test: account errors become localized keys, never the server's English text.
//   node scripts/test-auth-errors.mjs
import fs from 'fs';
import { createAppLoader } from './lib/app-modules.mjs';

const loader = createAppLoader();
const { authErrorKey, authErrorMessage } = loader.load('utils/authErrors.js');

let cases = 0;
const failures = [];
const eq = (actual, expected, label) => {
  cases += 1;
  if (actual !== expected) failures.push(`${label}: got ${actual}, want ${expected}`);
};

const table = [
  [{ code: 'invalid_credentials', message: 'Invalid login credentials', status: 400 }, 'authErrInvalidCreds'],
  [{ message: 'Invalid login credentials' }, 'authErrInvalidCreds'],
  [{ code: 'user_already_exists', message: 'User already registered', status: 422 }, 'authErrEmailTaken'],
  [{ message: 'User already registered' }, 'authErrEmailTaken'],
  [{ code: 'email_not_confirmed', message: 'Email not confirmed', status: 400 }, 'authErrEmailUnconfirmed'],
  [{ code: 'weak_password', message: 'Password should be at least 6 characters.', status: 422 }, 'authErrWeakPassword'],
  [{ name: 'AuthWeakPasswordError', message: 'x' }, 'authErrWeakPassword'],
  [{ code: 'same_password', message: 'New password should be different from the old password.', status: 422 }, 'authErrSamePassword'],
  [{ message: 'Unable to validate email address: invalid format' }, 'authErrInvalidEmail'],
  [{ code: 'over_email_send_rate_limit', message: 'email rate limit exceeded', status: 429 }, 'errRateLimited'],
  [{ message: 'For security purposes, you can only request this after 20 seconds.', status: 429 }, 'errRateLimited'],
  [{ code: 'session_not_found', message: 'Session not found' }, 'errSessionExpired'],
  [{ message: 'Auth session missing!' }, 'errSessionExpired'],
  [{ name: 'AuthRetryableFetchError', message: 'Network request failed', status: 0 }, 'errNetwork'],
  [{ message: 'Network request failed' }, 'errNetwork'],
  [{ message: 'upstream exploded', status: 503 }, 'errServiceUnavailable'],
  [{ message: 'something we have never seen' }, 'errUnexpected'],
  [{}, 'errUnexpected'],
  [null, 'errUnexpected'],
  [undefined, 'errUnexpected'],
];
for (const [err, key] of table) eq(authErrorKey(err), key, JSON.stringify(err));

// A server error with no status field must not be mistaken for a network failure.
eq(authErrorKey({ message: 'weird' }), 'errUnexpected', 'missing status is not offline');

// The user-facing text comes from t(), never from error.message.
const seen = [];
const out = authErrorMessage({ message: 'Invalid login credentials' }, (k) => { seen.push(k); return `T(${k})`; });
eq(out, 'T(authErrInvalidCreds)', 'message goes through t()');
eq(out.includes('Invalid login'), false, 'server text is not shown');

// Every key the mapper can return exists in all 13 languages.
const keys = new Set([...table.map(([, k]) => k)]);
for (const lang of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const bundle = JSON.parse(fs.readFileSync(`locales/bundles/${lang}.json`, 'utf8'));
  for (const key of keys) eq(typeof bundle[key] === 'string' && bundle[key].trim().length > 0, true, `${lang}.${key} exists`);
}

if (failures.length) {
  console.error(`auth errors: ${failures.length} failing of ${cases}\n${failures.join('\n')}`);
  process.exit(1);
}
console.log(`auth errors: ${cases} cases OK`);
