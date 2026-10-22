// Store-readiness guard for app.json (Google Play + App Store). Fails on anything a reviewer or the
// "install, use, reinstall" test would trip over.
//   node scripts/test-store-config.mjs
import fs from 'fs';

const { expo } = JSON.parse(fs.readFileSync('app.json', 'utf8'));
const problems = [];
const need = (cond, msg) => { if (!cond) problems.push(msg); };

need(expo.orientation === 'portrait', 'orientation must stay locked to portrait (layouts are portrait-only)');
need(expo.userInterfaceStyle === 'automatic', 'userInterfaceStyle must be automatic (dark mode follows the device)');
need(expo.android?.allowBackup === false,
  'android.allowBackup must be false: session tokens and private contract data must not be restored from Google Drive after a reinstall');
need(expo.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false, 'ITSAppUsesNonExemptEncryption must be declared');
need(expo.ios?.bundleIdentifier && expo.android?.package, 'bundle identifier and android package are required');
need(/^\d+\.\d+\.\d+$/.test(expo.version || ''), 'version must be semver (x.y.z)');

// Every iOS permission the app can trigger needs a purpose string a person can read.
const plist = expo.ios?.infoPlist || {};
for (const key of ['NSMicrophoneUsageDescription', 'NSSpeechRecognitionUsageDescription', 'NSPhotoLibraryUsageDescription']) {
  need(typeof plist[key] === 'string' && plist[key].trim().length >= 20, `${key} needs a clear purpose string`);
}

// Android: nothing beyond what the features use; camera / media-read stay blocked (the photo picker needs neither).
const perms = expo.android?.permissions || [];
const allowed = new Set(['android.permission.RECORD_AUDIO', 'android.permission.MODIFY_AUDIO_SETTINGS', 'android.permission.POST_NOTIFICATIONS']);
for (const p of perms) need(allowed.has(p), `unexpected Android permission ${p}`);
for (const p of ['android.permission.CAMERA', 'android.permission.READ_MEDIA_IMAGES', 'android.permission.READ_MEDIA_VIDEO']) {
  need((expo.android?.blockedPermissions || []).includes(p), `${p} must stay in blockedPermissions`);
}

// Store listing languages: every app language has localized system strings.
for (const lang of ['tr', 'en', 'de', 'fr', 'es', 'ar', 'it', 'zh', 'ru', 'fa', 'ja', 'pt', 'nl']) {
  const file = expo.locales?.[lang];
  need(file && fs.existsSync(file), `locales.${lang} missing or file not found`);
}

if (problems.length) {
  console.error(`store config: ${problems.length} problem(s)\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log('store config: OK (portrait, backup off, purpose strings, permissions minimal, 13 locales)');
