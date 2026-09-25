// Bakes web/brief.html → gitignored web/dist/index.html. Copies web/get.html,
// web/privacy.html, web/terms.html, and web/delete-account.html → web/dist/.
// Deploy those files to EXPO_PUBLIC_BRIEF_VIEW_BASE (same Netlify site). Do not log keys.

const fs = require('fs');
const path = require('path');

try {
  require('dotenv').config();
} catch {
  /* .env optional when vars are already in the environment */
}

const supabaseUrl = String(process.env.EXPO_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const anonKey = String(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '');

if (!supabaseUrl || !anonKey) {
  console.error('Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

function isLivePlayStoreUrl(value) {
  try {
    const parsed = new URL(String(value || '').trim());
    const host = parsed.hostname.toLowerCase();
    return parsed.protocol === 'https:' && (host === 'play.google.com' || host.endsWith('.play.google.com'));
  } catch {
    return false;
  }
}

const playStoreUrl = String(process.env.EXPO_PUBLIC_PLAY_STORE_URL || '').trim();
const getAppHref = isLivePlayStoreUrl(playStoreUrl) ? playStoreUrl : 'get.html';
const playStoreHref = isLivePlayStoreUrl(playStoreUrl) ? playStoreUrl : '#';

const sourcePath = path.join(__dirname, '..', 'web', 'brief.html');
const getSourcePath = path.join(__dirname, '..', 'web', 'get.html');
const privacySourcePath = path.join(__dirname, '..', 'web', 'privacy.html');
const termsSourcePath = path.join(__dirname, '..', 'web', 'terms.html');
const distDir = path.join(__dirname, '..', 'web', 'dist');
const distPath = path.join(distDir, 'index.html');
const getDistPath = path.join(distDir, 'get.html');
const privacyDistPath = path.join(distDir, 'privacy.html');
const termsDistPath = path.join(distDir, 'terms.html');
const deleteSourcePath = path.join(__dirname, '..', 'web', 'delete-account.html');
const deleteDistPath = path.join(distDir, 'delete-account.html');

let html = fs.readFileSync(sourcePath, 'utf8');
html = html.split('__SUPABASE_URL__').join(supabaseUrl);
html = html.split('__SUPABASE_ANON_KEY__').join(anonKey);
html = html.split('__GET_APP_HREF__').join(getAppHref);

if (/supabase\.co/i.test(getAppHref) || !String(getAppHref || '').trim()) {
  console.error('GET_APP href invalid');
  process.exit(1);
}

let getHtml = fs.readFileSync(getSourcePath, 'utf8');
if (!getHtml.includes('__PLAY_STORE_HREF__')) {
  console.error('get.html missing PLAY placeholder');
  process.exit(1);
}
if (/play\.google\.com\/store\/apps\/details/.test(getHtml) || /apps\.apple\.com\/app\/id\d+/.test(getHtml)) {
  console.error('get.html must not hardcode a store details URL');
  process.exit(1);
}
if (/supabase\.co/i.test(playStoreHref)) {
  console.error('PLAY href invalid');
  process.exit(1);
}
getHtml = getHtml.split('__PLAY_STORE_HREF__').join(playStoreHref);

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(distPath, html, { encoding: 'utf8' });
fs.writeFileSync(getDistPath, getHtml, { encoding: 'utf8' });
fs.copyFileSync(privacySourcePath, privacyDistPath);
fs.copyFileSync(termsSourcePath, termsDistPath);
fs.copyFileSync(deleteSourcePath, deleteDistPath);
console.log('web/dist/index.html written');
console.log('web/dist/get.html written');
console.log('web/dist/privacy.html written');
console.log('web/dist/terms.html written');
console.log('web/dist/delete-account.html written');
