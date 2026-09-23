import { Platform } from 'react-native';

type SpeechVoice = {
  identifier?: string;
  language?: string;
  name?: string;
  quality?: string;
};

type SpeechModule = {
  speak: (text: string, options?: Record<string, unknown>) => void;
  stop?: () => Promise<void> | void;
  isSpeakingAsync?: () => Promise<boolean>;
  getAvailableVoicesAsync?: () => Promise<SpeechVoice[]>;
  maxSpeechInputLength?: number;
};

type RecognitionPermission = {
  granted?: boolean;
  status?: string;
  canAskAgain?: boolean;
};

type RecognitionModule = {
  start: (options: Record<string, unknown>) => void;
  stop?: () => void;
  abort?: () => void;
  getPermissionsAsync?: () => Promise<RecognitionPermission>;
  requestPermissionsAsync?: () => Promise<RecognitionPermission>;
  isRecognitionAvailable?: () => boolean;
};

type SpeechCallbacks = {
  onDone?: () => void;
  onError?: (error?: unknown) => void;
};

export type VoiceStartReason =
  | 'permission'
  | 'unavailable'
  | 'empty'
  | 'error';

export type VoiceStartResult = {
  started: boolean;
  reason?: VoiceStartReason;
  needsSettings?: boolean;
};

export type TranscriptHandler = (text: string, interim: boolean) => void;

const SPEECH_LANG: Record<string, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  ar: 'ar-SA',
  it: 'it-IT',
  zh: 'zh-CN',
  ru: 'ru-RU',
  fa: 'fa-IR',
  ja: 'ja-JP',
  pt: 'pt-PT',
  nl: 'nl-NL',
};

export const speechLocale = (lang?: string | null) => {
  const raw = String(lang || 'tr').trim();
  const prefix = raw.split(/[-_]/)[0].toLowerCase();
  return SPEECH_LANG[prefix] || 'en-US';
};

const SCRIPT_HINTS: Array<{ test: RegExp; locale: string }> = [
  { test: /[\u06A9\u06AF\u067E\u0686]/, locale: 'fa-IR' },
  { test: /[\u0600-\u06FF]/, locale: 'ar-SA' },
  { test: /[\u3040-\u30FF]/, locale: 'ja-JP' },
  { test: /[\u4E00-\u9FFF]/, locale: 'zh-CN' },
  { test: /[\u0400-\u04FF]/, locale: 'ru-RU' },
  { test: /[ğüşıöçĞÜŞİÖÇ]/, locale: 'tr-TR' },
];

export function resolveSpeakLocale(text?: string | null, hintLang?: string | null) {
  const raw = String(text || '');
  const hinted = speechLocale(hintLang);
  for (const hint of SCRIPT_HINTS) {
    if (hint.test.test(raw)) {
      if (hint.locale === 'ar-SA' && String(hintLang || '').split(/[-_]/)[0] === 'fa') {
        return 'fa-IR';
      }
      return hint.locale;
    }
  }
  return hinted;
}

const LETTER_ACRONYMS = /\b(KVKK|GDPR|NDA|TBK|BGB|ISO|ICC|IBA|LLC)\b/gi;

function phoneticHints(text: string, locale: string) {
  const lang = String(locale || 'tr').slice(0, 2).toLowerCase();
  let next = text;
  if (lang === 'tr') {
    next = next.replace(/§/g, ' madde ');
    next = next.replace(/\bm\.\s*(?=\d)/gi, 'madde ');
    next = next.replace(/\bArt\.?\s+/g, 'madde ');
  } else if (lang === 'de') {
    next = next.replace(/§/g, ' Paragraph ');
    next = next.replace(/\bArt\.?\s+/g, 'Artikel ');
  } else if (lang === 'fr') {
    next = next.replace(/§/g, ' article ');
    next = next.replace(/\bArt\.?\s+/g, 'article ');
  } else {
    next = next.replace(/§/g, ' section ');
    next = next.replace(/\bArt\.?\s+/g, 'article ');
  }
  next = next.replace(LETTER_ACRONYMS, (match) => match.toUpperCase().split('').join(' '));
  return next;
}

export function sanitizeSpokenText(text?: string | null, locale?: string | null) {
  const tag = speechLocale(locale);
  let next = phoneticHints(String(text || ''), tag);
  next = next.replace(/\uFEFF/g, '');
  next = next.replace(/```[\s\S]*?```/g, ' ');
  next = next.replace(/[#*_`|>]+/g, ' ');
  next = next.replace(/[•●▪▸►‣∙·□■◆★☆✔✗✕×]/g, '. ');
  next = next.replace(/[\[\]{}]/g, ' ');
  next = next.replace(/n\s*\/\s*a/gi, ' ');
  next = next.replace(/\b(unspecified|belirtilmedi|not specified)\b/gi, ' ');
  next = next.replace(/https?:\/\/\S+/gi, ' ');
  next = next.replace(/\s*\/\s*/g, ' ');
  next = next.replace(/[—–]+/g, ', ');
  next = next.replace(/\s*[;:]\s*/g, ', ');
  next = next.replace(/[\u0000-\u001F\u007F]/g, ' ');
  next = next.replace(/\s*\n+\s*/g, '. ');
  next = next.replace(/\s{2,}/g, ' ');
  next = next.replace(/\.{2,}/g, '. ');
  next = next.replace(/\s+([,.!?…])/g, '$1');
  next = next.replace(/([.!?…]){2,}/g, '$1');
  next = next.trim();
  if (next && !/[.!?…]$/.test(next)) next += '.';
  return next;
}

const SAFE_CHUNK = 1600;

export function splitSpeakChunks(text: string, maxLen = SAFE_CHUNK) {
  const cap = Math.max(280, Math.min(Number(maxLen) || SAFE_CHUNK, SAFE_CHUNK));
  const cleaned = String(text || '').trim();
  if (!cleaned) return [];
  if (cleaned.length <= cap) return [cleaned];

  const sentences: string[] = [];
  let current = '';
  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    current += ch;
    const isStop = ch === '.' || ch === '!' || ch === '?' || ch === '…';
    const next = cleaned[i + 1];
    if (isStop && (next == null || /\s/.test(next))) {
      const piece = current.trim();
      if (piece) sentences.push(piece);
      current = '';
      while (i + 1 < cleaned.length && /\s/.test(cleaned[i + 1])) i += 1;
    }
  }
  if (current.trim()) sentences.push(current.trim());

  const chunks: string[] = [];
  let buffer = '';

  const pushBuffer = () => {
    const piece = buffer.trim();
    if (piece) chunks.push(piece);
    buffer = '';
  };

  const appendPiece = (part: string) => {
    if (!part) return;
    if (part.length > cap) {
      if (buffer) pushBuffer();
      for (let i = 0; i < part.length; i += cap) {
        const slice = part.slice(i, i + cap).trim();
        if (slice) chunks.push(slice);
      }
      return;
    }
    if ((buffer + ' ' + part).trim().length > cap) {
      pushBuffer();
      buffer = part;
    } else {
      buffer = buffer ? `${buffer} ${part}` : part;
    }
  };

  for (const sentence of sentences) {
    if (sentence.length > cap) {
      sentence.split(',').forEach((part, index, list) => {
        const piece = (index < list.length - 1 ? `${part},` : part).trim();
        appendPiece(piece);
      });
    } else {
      appendPiece(sentence);
    }
  }
  pushBuffer();
  return chunks.filter(Boolean);
}

let speakSession = 0;

export function composeSpokenText(base: string, transcript: string): string {
  const prefix = String(base || '').replace(/\s+$/g, '');
  const spoken = String(transcript || '').trim();
  if (!spoken) return String(base || '');
  if (!prefix) return spoken;
  return `${prefix} ${spoken}`;
}

function loadSpeech(): SpeechModule | null {
  try {
    const mod = require('expo-speech');
    return mod?.speak ? mod : null;
  } catch {
    return null;
  }
}

function loadRecognitionPackage(): {
  ExpoSpeechRecognitionModule?: RecognitionModule;
  useSpeechRecognitionEvent?: (event: string, listener: (...args: any[]) => void) => void;
} | null {
  try {
    return require('expo-speech-recognition');
  } catch {
    return null;
  }
}

function webSynth() {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) return window.speechSynthesis;
  } catch {
    return null;
  }
  return null;
}

function webRecognitionCtor(): (new () => any) | null {
  try {
    if (typeof window === 'undefined') return null;
    return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
  } catch {
    return null;
  }
}

let Speech: SpeechModule | null = null;
let recognitionPkg = loadRecognitionPackage();
let webRec: any = null;

const recognitionModule = (): RecognitionModule | null => {
  if (!recognitionPkg) recognitionPkg = loadRecognitionPackage();
  return recognitionPkg?.ExpoSpeechRecognitionModule || null;
};

const isGranted = (result?: RecognitionPermission | null) =>
  Boolean(result?.granted || result?.status === 'granted');

export function speechAvailable(): boolean {
  try {
    if (!Speech) Speech = loadSpeech();
    if (Speech?.speak) return true;
    return Boolean(webSynth());
  } catch {
    return Boolean(webSynth());
  }
}

export function recognitionAvailable(): boolean {
  try {
    const module = recognitionModule();
    if (module?.start) {
      if (typeof module.isRecognitionAvailable === 'function') {
        return Boolean(module.isRecognitionAvailable());
      }
      return true;
    }
    return Boolean(webRecognitionCtor());
  } catch {
    return Boolean(webRecognitionCtor());
  }
}

export async function ensureSpeechPermissions(): Promise<{
  granted: boolean;
  needsSettings?: boolean;
  fallback?: boolean;
}> {
  const module = recognitionModule();
  if (module) {
    try {
      let current =
        typeof module.getPermissionsAsync === 'function'
          ? await module.getPermissionsAsync()
          : null;
      if (isGranted(current)) return { granted: true };
      const canAskAgain = current == null || current.canAskAgain !== false;
      if (canAskAgain && typeof module.requestPermissionsAsync === 'function') {
        current = await module.requestPermissionsAsync();
        if (isGranted(current)) return { granted: true };
      }
      return {
        granted: false,
        needsSettings: current?.canAskAgain === false || current?.status === 'denied',
      };
    } catch {
      return { granted: Boolean(webRecognitionCtor()), fallback: true };
    }
  }
  return { granted: Boolean(webRecognitionCtor()), fallback: Boolean(webRecognitionCtor()) };
}

export async function requestSpeechPermissions() {
  const result = await ensureSpeechPermissions();
  return Boolean(result?.granted || result?.fallback);
}

function speakWeb(
  chunks: string[],
  lang?: string | null,
  { onDone, onError }: SpeechCallbacks = {},
  session = speakSession
) {
  const synth = webSynth();
  if (!synth) return false;
  const parts = (chunks || []).map((item) => String(item || '').trim()).filter(Boolean);
  if (!parts.length) return false;
  try {
    synth.cancel();
    let index = 0;
    const locale = resolveSpeakLocale(parts.join(' '), lang);
    const play = () => {
      if (session !== speakSession) {
        onDone?.();
        return;
      }
      if (index >= parts.length) {
        onDone?.();
        return;
      }
      const utterance = new (window as any).SpeechSynthesisUtterance(parts[index]);
      utterance.lang = locale;
      utterance.rate = 0.94;
      utterance.pitch = 1;
      utterance.onend = () => {
        index += 1;
        play();
      };
      utterance.onerror = (error: unknown) => {
        if (isBenignSpeechError(error) || session !== speakSession) {
          onDone?.();
          return;
        }
        onError?.(error);
      };
      synth.speak(utterance);
    };
    play();
    return true;
  } catch (error) {
    onError?.(error);
    return false;
  }
}

function isBenignSpeechError(error: unknown) {
  const message = String((error as { message?: string })?.message || error || '');
  return /interrupt|cancel|stopped|not_in_progress|already/i.test(message);
}

async function resolveVoice(
  SpeechMod: SpeechModule,
  lang?: string | null,
  preferEnglish = false
): Promise<{ language: string; voice?: string }> {
  const requested = preferEnglish ? 'en-US' : speechLocale(lang) || 'tr-TR';
  try {
    const voices = await SpeechMod.getAvailableVoicesAsync?.();
    if (!Array.isArray(voices) || !voices.length) {
      return { language: requested };
    }
    const wanted = requested.toLowerCase();
    const prefix = wanted.slice(0, 2);
    const langMatch = (item: SpeechVoice) => String(item.language || '').toLowerCase() === wanted;
    const prefixMatch = (item: SpeechVoice) => String(item.language || '').toLowerCase().startsWith(prefix);
    const enhanced = (item: SpeechVoice) => String(item.quality || '').toLowerCase() === 'enhanced';
    const match =
      voices.find((item) => langMatch(item) && enhanced(item)) ||
      voices.find(langMatch) ||
      voices.find((item) => prefixMatch(item) && enhanced(item)) ||
      voices.find(prefixMatch) ||
      (preferEnglish
        ? voices.find((item) => String(item.language || '').toLowerCase().startsWith('en'))
        : null) ||
      voices.find((item) => String(item.language || '').toLowerCase().startsWith('tr')) ||
      voices.find((item) => String(item.language || '').toLowerCase().startsWith('en')) ||
      voices[0];
    if (!match) return { language: requested };
    return {
      language: String(match.language || requested),
      voice: match.identifier,
    };
  } catch {
    return { language: requested };
  }
}

async function stopNativeSpeech(SpeechMod: SpeechModule | null) {
  if (!SpeechMod) return;
  try {
    if (SpeechMod.isSpeakingAsync) {
      const speaking = await SpeechMod.isSpeakingAsync();
      if (speaking) await SpeechMod.stop?.();
    } else {
      await SpeechMod.stop?.();
    }
  } catch {
    try {
      await SpeechMod.stop?.();
    } catch {
      /* ignore */
    }
  }
}

export function isSpeakableText(text?: string | null): boolean {
  const cleaned = sanitizeSpokenText(text)
    .replace(/n\s*\/\s*a/gi, ' ')
    .replace(/unspecified/gi, ' ')
    .replace(/[\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (cleaned.length < 12) return false;
  const letters = cleaned.replace(/[\s0-9.,;:!?()[\]{}"'`~@#$%^&*_+=<>/\\|-]+/g, '');
  return letters.length >= 8;
}

export async function speakBriefing(
  text: string,
  lang?: string | null,
  { onDone, onError }: SpeechCallbacks = {}
): Promise<boolean> {
  const locale = resolveSpeakLocale(text, lang);
  const script = sanitizeSpokenText(text, locale);
  if (!isSpeakableText(script)) {
    onDone?.();
    return false;
  }

  const session = ++speakSession;
  if (!Speech) Speech = loadSpeech();
  const engineLimit = Speech?.maxSpeechInputLength;
  const cap =
    Number.isFinite(engineLimit) && Number(engineLimit) > 0 && Number(engineLimit) < 1e8
      ? Math.min(SAFE_CHUNK, Number(engineLimit))
      : SAFE_CHUNK;
  const chunks = splitSpeakChunks(script, cap);
  if (!chunks.length) {
    onDone?.();
    return false;
  }

  if (Speech?.speak) {
    let queueGen = 0;
    const startNative = async (preferEnglish: boolean, fromIndex = 0): Promise<boolean> => {
      if (!Speech?.speak) return false;
      if (session !== speakSession) {
        onDone?.();
        return false;
      }
      const myQueue = ++queueGen;
      await stopNativeSpeech(Speech);
      if (myQueue !== queueGen || session !== speakSession) {
        onDone?.();
        return false;
      }
      const resolved = await resolveVoice(Speech, preferEnglish ? 'en' : locale, preferEnglish);
      const play = (index: number) => {
        if (myQueue !== queueGen || session !== speakSession) {
          onDone?.();
          return;
        }
        if (index >= chunks.length) {
          onDone?.();
          return;
        }
        const options: Record<string, unknown> = {
          language: resolved.language || locale || 'tr-TR',
          pitch: 1,
          rate: Platform.OS === 'ios' ? 0.94 : 0.92,
          volume: 1.0,
          onDone: () => {
            if (session !== speakSession) {
              onDone?.();
              return;
            }
            if (myQueue !== queueGen) return;
            play(index + 1);
          },
          onStopped: () => {
            if (session !== speakSession) onDone?.();
          },
          onError: (error: unknown) => {
            if (session !== speakSession || myQueue !== queueGen) {
              if (session !== speakSession) onDone?.();
              return;
            }
            if (isBenignSpeechError(error)) {
              onDone?.();
              return;
            }
            if (!preferEnglish) {
              startNative(true, index).then((ok) => {
                if (ok) return;
                if (!speakWeb(chunks.slice(index), 'en', { onDone, onError }, session)) {
                  onError?.(error);
                  onDone?.();
                }
              });
              return;
            }
            if (!speakWeb(chunks.slice(index), resolved.language, { onDone, onError }, session)) {
              onError?.(error);
              onDone?.();
            }
          },
        };
        if (resolved.voice) options.voice = resolved.voice;
        if (Platform.OS === 'ios') options.useApplicationAudioSession = false;
        Speech?.speak(chunks[index], options);
      };
      play(fromIndex);
      return true;
    };

    try {
      if (await startNative(false)) return true;
    } catch (error) {
      if (speakWeb(chunks, locale, { onDone, onError }, session)) return true;
      onError?.(error);
      return false;
    }
  }

  return speakWeb(chunks, locale, { onDone, onError }, session);
}

export async function speakAnalysisSummary(
  text: string,
  lang?: string | null,
  callbacks: SpeechCallbacks = {}
): Promise<boolean> {
  try {
    const started = await speakBriefing(text, lang, {
      onDone: () => {
        try {
          callbacks.onDone?.();
        } catch {
          /* yut */
        }
      },
      onError: () => {
        try {
          callbacks.onError?.();
        } catch {
          /* cihaz ses motoru hataları konsola düşmez */
        }
      },
    });
    return Boolean(started);
  } catch {
    try {
      callbacks.onError?.();
      callbacks.onDone?.();
    } catch {
      /* yut */
    }
    return false;
  }
}

export async function stopBriefing() {
  speakSession += 1;
  try {
    if (!Speech) Speech = loadSpeech();
    await Speech?.stop?.();
  } catch {
    /* ignore */
  }
  try {
    webSynth()?.cancel?.();
  } catch {
    /* ignore */
  }
  try {
    webRec?.stop?.();
  } catch {
    /* ignore */
  }
}

export async function isSpeaking() {
  try {
    if (!Speech) Speech = loadSpeech();
    if (Speech?.isSpeakingAsync) return await Speech.isSpeakingAsync();
    return Boolean(webSynth()?.speaking);
  } catch {
    return false;
  }
}

export async function startVoiceInput(
  lang?: string | null,
  { onTranscript }: { onTranscript?: TranscriptHandler } = {}
): Promise<VoiceStartResult> {
  const locale = speechLocale(lang);
  const module = recognitionModule();
  if (module?.start) {
    if (typeof module.isRecognitionAvailable === 'function' && !module.isRecognitionAvailable()) {
      return { started: false, reason: 'unavailable' };
    }
    const permission = await ensureSpeechPermissions();
    if (!permission.granted && !permission.fallback) {
      return {
        started: false,
        reason: 'permission',
        needsSettings: permission.needsSettings,
      };
    }
    try {
      module.start({
        lang: locale,
        interimResults: true,
        continuous: false,
        addsPunctuation: true,
      });
      return { started: true };
    } catch {
      return { started: false, reason: 'error' };
    }
  }

  const Ctor = webRecognitionCtor();
  if (!Ctor) return { started: false, reason: 'unavailable' };
  try {
    webRec?.stop?.();
    webRec = new Ctor();
    webRec.lang = locale;
    webRec.interimResults = true;
    webRec.continuous = false;
    webRec.onresult = (event: any) => {
      const text = event?.results?.[0]?.[0]?.transcript;
      if (text) onTranscript?.(String(text).trim(), !event.results[0].isFinal);
    };
    webRec.start();
    return { started: true };
  } catch {
    return { started: false, reason: 'error' };
  }
}

export function stopVoiceInput() {
  const module = recognitionModule();
  try {
    module?.stop?.();
  } catch {
    /* ignore */
  }
  try {
    module?.abort?.();
  } catch {
    /* ignore */
  }
  try {
    webRec?.stop?.();
  } catch {
    /* ignore */
  }
}

const noopHook = (_event: string, _listener: (...args: any[]) => void) => {};
const speechRecognitionEventHook =
  recognitionPkg?.useSpeechRecognitionEvent || noopHook;

export function useSpeechRecognitionEventSafe(
  eventName: string,
  listener: (...args: any[]) => void
) {
  speechRecognitionEventHook(eventName, listener);
}

export const SpeechRecognitionModule = recognitionModule();
