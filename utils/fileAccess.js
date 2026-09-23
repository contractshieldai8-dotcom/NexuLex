// Uygulama-owned cache dosyası: Print/picker URI’sini Go cache’ten okumadan kopyala.

import * as FileSystem from 'expo-file-system/legacy';
import { File as FSFile, Paths } from 'expo-file-system';

export const isExpoGoUri = (uri) => /host\.exp\.exponential/i.test(String(uri || ''));

const encodingOf = (asBase64) =>
  asBase64 ? FileSystem.EncodingType.Base64 : FileSystem.EncodingType.UTF8 || 'utf8';

const ownedName = (name) =>
  String(name || `nexulex-${Date.now()}`).replace(/[^\w.-]+/g, '_');

export async function writeOwnedUtf8(text, name) {
  const payload = String(text || '');
  if (!payload) return '';
  const fileName = ownedName(name);
  try {
    if (Paths?.cache) {
      const dest = new FSFile(Paths.cache, fileName);
      if (typeof dest.write === 'function') {
        await dest.write(payload);
        return dest.uri || `${FileSystem.cacheDirectory || ''}${fileName}`;
      }
    }
  } catch {
    /* legacy yaz */
  }
  const root = FileSystem.cacheDirectory;
  if (!root) return '';
  const uri = `${root}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, payload, {
    encoding: FileSystem.EncodingType.UTF8 || 'utf8',
  });
  return uri;
}

export async function writeOwnedBase64(base64, name) {
  const payload = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!payload) return '';
  const fileName = ownedName(name);
  try {
    if (Paths?.cache) {
      const dest = new FSFile(Paths.cache, fileName);
      if (typeof dest.write === 'function') {
        await dest.write(payload, { encoding: 'base64' });
        return dest.uri || `${FileSystem.cacheDirectory || ''}${fileName}`;
      }
    }
  } catch {
    /* legacy yaz */
  }
  const root = FileSystem.cacheDirectory;
  if (!root) return '';
  const uri = `${root}${fileName}`;
  await FileSystem.writeAsStringAsync(uri, payload, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}

async function readLegacy(uri, asBase64) {
  return FileSystem.readAsStringAsync(uri, { encoding: encodingOf(asBase64) });
}

export async function readOwnedFile(uri, { asBase64 = false } = {}) {
  const source = String(uri || '');
  if (!source) throw new Error('READ');

  const isFile = /^(file:|\/)/i.test(source) && !/^content:/i.test(source);
  if (isFile) {
    try {
      return await readLegacy(source, asBase64);
    } catch (error) {
      console.warn('legacy file okunamadı:', error?.message);
    }
  }

  const stamp = ownedName(`nexulex-source-${Date.now()}.${asBase64 ? 'bin' : 'txt'}`);

  try {
    const response = await fetch(source);
    if (response?.ok) {
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      if (Paths?.cache) {
        try {
          const dest = new FSFile(Paths.cache, stamp);
          if (typeof dest.write === 'function') {
            await dest.write(bytes);
            return asBase64 ? await dest.base64() : await dest.text();
          }
        } catch (writeError) {
          console.warn('Paths.cache write başarısız:', writeError?.message);
        }
      }
      let binary = '';
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
      }
      const b64 = globalThis.btoa ? globalThis.btoa(binary) : null;
      if (b64) {
        const owned = await writeOwnedBase64(b64, stamp);
        if (owned) return asBase64 ? b64 : await readLegacy(owned, false);
      }
    }
  } catch (error) {
    console.warn('fetch owned cache başarısız:', error?.message);
  }

  try {
    if (Paths?.cache) {
      const dest = new FSFile(Paths.cache, stamp);
      await new FSFile(source).copy(dest);
      return asBase64 ? await dest.base64() : await dest.text();
    }
  } catch (error) {
    console.warn('Paths.cache kopyası başarısız:', error?.message);
  }

  try {
    const root = FileSystem.cacheDirectory;
    if (root) {
      const cacheUri = `${root}${stamp}`;
      await FileSystem.copyAsync({ from: source, to: cacheUri });
      return await readLegacy(cacheUri, asBase64);
    }
  } catch (error) {
    console.warn('copyAsync cache başarısız:', error?.message);
  }

  throw new Error('READ');
}

/**
 * Soft-purge stale NexuLex export files from cache (24h default).
 * Accepts an options object or a bare max age in ms; `0` purges every NexuLex export.
 * Never throws into the share/export UX path.
 */
export async function cleanStaleExportCache(options = {}) {
  const {
    maxAgeMs = 86400000,
    prefixPatterns = [/^NexuLex-/i, /^nexulex-/i],
  } = typeof options === 'number' ? { maxAgeMs: options } : options || {};
  const purgeAll = maxAgeMs <= 0;
  try {
    const root = FileSystem.cacheDirectory;
    if (!root || typeof FileSystem.readDirectoryAsync !== 'function') {
      return { deleted: 0 };
    }
    const names = await FileSystem.readDirectoryAsync(root);
    const now = Date.now();
    let deleted = 0;
    for (const name of names) {
      if (!prefixPatterns.some((re) => re.test(String(name || '')))) continue;
      const uri = `${root}${name}`;
      try {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info?.exists) continue;
        if (!purgeAll) {
          const mod = Number(info.modificationTime || 0);
          if (!mod) continue;
          const modMs = mod > 1e12 ? mod : mod * 1000;
          if (now - modMs < maxAgeMs) continue;
        }
        await FileSystem.deleteAsync(uri, { idempotent: true });
        deleted += 1;
      } catch {
        /* skip one file */
      }
    }
    return { deleted };
  } catch {
    return { deleted: 0 };
  }
}

/** Android SAF klasör kaydı; iptal/hata durumunda null döner (çağıran Sharing’e düşer). */
export async function trySaveBase64ViaSaf(base64, filename, mimeType = 'application/pdf') {
  const payload = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
  if (!payload) return null;
  const saf = FileSystem.StorageAccessFramework;
  if (!saf?.requestDirectoryPermissionsAsync) return null;
  try {
    const permissions = await saf.requestDirectoryPermissionsAsync();
    if (!permissions?.granted) return null;
    const safUri = await saf.createFileAsync(
      permissions.directoryUri,
      String(filename || 'nexulex').replace(/\.[^.]+$/i, ''),
      mimeType
    );
    await FileSystem.writeAsStringAsync(safUri, payload, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return safUri || true;
  } catch (error) {
    console.warn('SAF kaydı başarısız:', error?.message);
    return null;
  }
}
