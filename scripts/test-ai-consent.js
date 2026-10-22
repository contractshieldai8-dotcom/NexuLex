/* eslint-disable no-console */
// Behaviour test for services/aiConsent.js: device-first dual write, offline fallback, queued retry, re-consent.
// The service is real; react-native, AsyncStorage, i18n and supabase are replaced by in-memory fakes.
//   node scripts/test-ai-consent.js
const fs = require('fs');
const path = require('path');
const Module = require('module');
const babel = require('@babel/core');

const root = path.join(__dirname, '..');
const USER = '00000000-0000-0000-0000-000000000001';

const store = new Map();
const ledger = [];
const net = { online: true, error: null };
let session = { user: { id: USER } };

const fakes = {
  'react-native': { Alert: { alert() {} }, Linking: { openURL: async () => {} } },
  '@react-native-async-storage/async-storage': {
    getItem: async (k) => (store.has(k) ? store.get(k) : null),
    setItem: async (k, v) => { store.set(k, v); },
    removeItem: async (k) => { store.delete(k); },
  },
  '../i18n': { t: (k) => k },
  './supabase': {
    supabase: {
      auth: { getSession: async () => ({ data: { session } }) },
      from: (table) => ({
        insert: async (row) => {
          if (table !== 'consents') throw new Error('unexpected table');
          if (!net.online) throw new Error('Network request failed');
          if (net.error) return { error: net.error };
          ledger.push({ ...row });
          return { error: null };
        },
      }),
    },
  },
  '../constants/settingsTrust': { TRUST_URLS: { privacy: 'https://example.test/privacy' } },
};

const file = path.join(root, 'services', 'aiConsent.js');
const { code } = babel.transformSync(fs.readFileSync(file, 'utf8'), {
  filename: file,
  babelrc: false,
  configFile: false,
  plugins: ['@babel/plugin-transform-modules-commonjs'],
});
const mod = new Module(file, module);
mod.filename = file;
mod.paths = Module._nodeModulePaths(path.dirname(file));
mod.require = (id) => {
  if (id === '../i18n') return { __esModule: true, default: fakes[id] };
  if (fakes[id]) return fakes[id];
  throw new Error(`unmocked import ${id}`);
};
mod._compile(code, file);
const svc = mod.exports;

let fail = 0;
const ok = (cond, msg) => { if (!cond) { fail += 1; console.log('FAIL', msg); } };
const settle = () => new Promise((r) => setTimeout(r, 20));

(async () => {
  ok(svc.AI_CONSENT_VERSION >= 1 && svc.AI_CONSENT_TYPE === 'ai_processing', 'version/type exported');
  ok((await svc.getAiConsentStatus()) === 'none' && (await svc.hasAiConsent()) === false, 'fresh device: no consent');

  // Online grant: device + ledger.
  ok((await svc.setAiConsent(true)) === true, 'setAiConsent resolves true');
  await settle();
  ok((await svc.hasAiConsent()) === true, 'device consent valid after grant');
  ok(ledger.length === 1 && ledger[0].granted === true && ledger[0].user_id === USER && ledger[0].consent_type === 'ai_processing' && ledger[0].version === svc.AI_CONSENT_VERSION, 'grant appended to the ledger');
  ok(Object.keys(ledger[0]).sort().join() === 'consent_type,granted,user_id,version', 'ledger row carries no free text and no client timestamp');
  ok(JSON.parse(store.get(`@nexulex/aiConsent/v1/${USER}`)).synced === true, 'record marked synced');
  ok(!store.has(`@nexulex/aiConsentQueue/v1/${USER}`), 'queue empty after a successful write');

  // Offline withdrawal: device decision applies at once, ledger write waits.
  net.online = false;
  ok((await svc.setAiConsent(false)) === true, 'withdraw while offline still succeeds');
  await settle();
  ok((await svc.hasAiConsent()) === false, 'withdrawal is effective on the device while offline');
  ok(ledger.length === 1, 'nothing reached the ledger while offline');
  ok(JSON.parse(store.get(`@nexulex/aiConsentQueue/v1/${USER}`)).length === 1, 'withdrawal waits in the retry queue');

  // Offline grant on top: device consent valid, queue keeps order.
  ok((await svc.setAiConsent(true)) === true, 'grant while offline succeeds');
  await settle();
  ok((await svc.hasAiConsent()) === true, 'device consent valid offline (fallback counts as consent)');
  ok(JSON.parse(store.get(`@nexulex/aiConsentQueue/v1/${USER}`)).map((q) => q.granted).join() === 'false,true', 'queue keeps decisions in order');

  // Transient server error keeps the queue.
  net.online = true;
  net.error = { code: '57014', message: 'timeout' };
  ok((await svc.flushConsentQueue()) === 2, 'transient server error keeps both entries queued');

  // Back online: queue drains in order, record becomes synced.
  net.error = null;
  ok((await svc.flushConsentQueue()) === 0, 'queue drains once the server accepts writes');
  ok(ledger.map((r) => r.granted).join() === 'true,false,true', 'ledger holds the full history in order');
  ok(JSON.parse(store.get(`@nexulex/aiConsent/v1/${USER}`)).synced === true, 'record synced after the retry');

  // Permanent rejection must not wedge the queue.
  net.error = { code: '23514', message: 'check violation' };
  await svc.setAiConsent(false);
  await settle();
  ok(!store.has(`@nexulex/aiConsentQueue/v1/${USER}`), 'permanently rejected entry is dropped, not retried forever');
  net.error = null;

  // Legacy record (written before the ledger) is backfilled once.
  const before = ledger.length;
  store.set(`@nexulex/aiConsent/v1/${USER}`, JSON.stringify({ granted: true, version: svc.AI_CONSENT_VERSION, at: '2026-01-01T00:00:00.000Z' }));
  store.delete(`@nexulex/aiConsentQueue/v1/${USER}`);
  ok((await svc.hasAiConsent()) === true, 'legacy device record stays valid');
  await settle();
  ok(ledger.length === before + 1 && ledger[ledger.length - 1].granted === true, 'legacy consent is backfilled into the ledger');
  await svc.flushConsentQueue();
  ok(ledger.length === before + 1, 'backfill happens only once');

  // Re-consent: an older wording version is not valid and is reported as outdated.
  store.set(`@nexulex/aiConsent/v1/${USER}`, JSON.stringify({ granted: true, version: 0, at: '2026-01-01T00:00:00.000Z', synced: true }));
  ok((await svc.getAiConsentStatus()) === 'outdated' && (await svc.hasAiConsent()) === false, 'older consent version asks again');

  // Signed out: nothing is read or written.
  session = null;
  ok((await svc.hasAiConsent()) === false && (await svc.setAiConsent(true)) === false, 'no user, no consent and no write');

  console.log(fail ? `ai consent: ${fail} failing` : 'ai consent: OK');
  process.exit(fail ? 1 : 0);
})();
