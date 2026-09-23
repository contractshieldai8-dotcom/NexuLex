const { withAndroidManifest } = require('expo/config-plugins');

const AUDIO_PERMISSIONS = [
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS',
];

function ensurePermission(manifest, name) {
  if (!manifest['uses-permission']) manifest['uses-permission'] = [];
  const exists = manifest['uses-permission'].some(
    (item) => item?.$?.['android:name'] === name
  );
  if (!exists) {
    manifest['uses-permission'].push({ $: { 'android:name': name } });
  }
}

module.exports = function withAudioPermissions(config) {
  return withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    AUDIO_PERMISSIONS.forEach((name) => ensurePermission(manifest, name));
    return mod;
  });
};
