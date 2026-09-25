// WAVE LR.2 — Case files and evidence live on this device only (document directory + AsyncStorage), purged with the account.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Directory, File as FSFile, Paths } from 'expo-file-system';

import { cancelAnalysisReminders, scheduleTrapReminders } from './notifications';
import { reminderDates } from '../utils/documentExplain';
import { base64ToBytes, fingerprintBytes, newId, normalizeCase, utf8Bytes } from '../utils/caseFiles';

const CASES_KEY = '@nexulex/caseFiles';
const EVIDENCE_DIR = 'nexulex-evidence';
export const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024;

export async function loadCases() {
  try {
    const raw = await AsyncStorage.getItem(CASES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.map(normalizeCase).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export async function saveCases(list) {
  try {
    await AsyncStorage.setItem(CASES_KEY, JSON.stringify(list));
    return true;
  } catch (error) {
    console.log('Dosyalar kaydedilemedi:', error?.message);
    return false;
  }
}

const evidenceDir = () => {
  const dir = new Directory(Paths.document, EVIDENCE_DIR);
  dir.create({ idempotent: true, intermediates: true });
  return dir;
};

export function evidenceUri(fileName) {
  if (!fileName) return '';
  try {
    return new FSFile(Paths.document, EVIDENCE_DIR, fileName).uri;
  } catch {
    return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}${EVIDENCE_DIR}/${fileName}` : '';
  }
}

// Returns evidence metadata; the fingerprint is computed from the exact bytes written to disk.
export async function storeFileEvidence({ base64, ext, label, kind }) {
  const payload = String(base64 || '').replace(/^data:[^;]+;base64,/, '');
  const bytes = base64ToBytes(payload);
  if (!bytes.length) throw Object.assign(new Error('EMPTY'), { code: 'EMPTY' });
  if (bytes.length > MAX_EVIDENCE_BYTES) throw Object.assign(new Error('TOO_LARGE'), { code: 'TOO_LARGE' });
  const id = newId('v');
  const fileName = `${id}.${String(ext || 'bin').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'bin'}`;
  const dest = new FSFile(evidenceDir(), fileName);
  dest.write(bytes);
  return { id, label, kind, fileName, size: bytes.length, fingerprint: fingerprintBytes(bytes) };
}

export function noteEvidence({ label, note }) {
  const text = String(note || '').trim();
  return { id: newId('v'), label, kind: 'note', note: text, fingerprint: fingerprintBytes(utf8Bytes(text)) };
}

export function deleteEvidenceFiles(fileNames) {
  for (const name of fileNames || []) {
    if (!name) continue;
    try {
      const file = new FSFile(Paths.document, EVIDENCE_DIR, name);
      if (file.exists) file.delete();
    } catch {
      /* already gone */
    }
  }
}

export async function purgeEvidenceFiles() {
  try {
    const dir = new Directory(Paths.document, EVIDENCE_DIR);
    if (dir.exists) dir.delete();
  } catch {
    /* nothing stored */
  }
}

export const caseReminderId = (caseId, eventId) => `case-${caseId}-${eventId}`;

export async function scheduleCaseEventReminders({ caseId, event, title }) {
  const dates = reminderDates(event?.date).map((date) => ({
    date,
    label: `${event.title} · ${event.date}`,
    kind: 'DEADLINE',
  }));
  if (!dates.length) return { scheduled: 0, denied: false, unavailable: false };
  return scheduleTrapReminders({ analysisId: caseReminderId(caseId, event.id), dates, title, prompt: true });
}

export async function cancelCaseReminders(item, eventIds) {
  const ids = eventIds || (item?.events || []).map((ev) => ev.id);
  await Promise.allSettled(ids.map((eventId) => cancelAnalysisReminders(caseReminderId(item.id, eventId))));
}
