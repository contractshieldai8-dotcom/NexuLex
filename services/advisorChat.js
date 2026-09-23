// Danışman sohbetlerinin cihazda kalıcı saklanması.
// Aktif oturum + son 5 arşiv, AsyncStorage üzerinde tutulur.

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@nexulex/advisorChats';
export const MAX_ADVISOR_SESSIONS = 5;

let messageSeq = 0;

export const nextMessageId = () => `msg-${Date.now()}-${++messageSeq}`;

export const greetingMessage = (text) => ({
  id: 'greeting',
  role: 'assistant',
  text: String(text || ''),
});

export function createSession({ greeting, country = 'auto' } = {}) {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    country,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [greetingMessage(greeting)],
  };
}

export function sessionTitle(session, fallback = '') {
  const firstUser = (session?.messages || []).find(
    (msg) => msg?.role === 'user' && String(msg.text || '').trim()
  );
  const text = String(firstUser?.text || '').replace(/\s+/g, ' ').trim();
  if (!text) return fallback;
  return text.length > 72 ? `${text.slice(0, 72).trim()}…` : text;
}

export function hasConversation(session) {
  return (session?.messages || []).some(
    (msg) => msg?.role === 'user' && String(msg.text || '').trim()
  );
}

export function archiveSession(session, fallbackTitle = '') {
  if (!session || !hasConversation(session)) return null;
  return {
    ...session,
    title: sessionTitle(session, fallbackTitle),
    updatedAt: Date.now(),
  };
}

export function prependSession(list, session) {
  if (!session) return (list || []).slice(0, MAX_ADVISOR_SESSIONS);
  return [session, ...(list || []).filter((item) => item.id !== session.id)].slice(
    0,
    MAX_ADVISOR_SESSIONS
  );
}

export function removeSession(list, id) {
  return (list || []).filter((item) => item.id !== id);
}

export async function loadAdvisorState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      active: parsed?.active && typeof parsed.active === 'object' ? parsed.active : null,
      sessions: Array.isArray(parsed?.sessions) ? parsed.sessions.slice(0, MAX_ADVISOR_SESSIONS) : [],
    };
  } catch (error) {
    console.warn('Danışman sohbeti okunamadı:', error?.message);
    return null;
  }
}

export async function saveAdvisorState({ active, sessions }) {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        active: active || null,
        sessions: (sessions || []).slice(0, MAX_ADVISOR_SESSIONS),
      })
    );
  } catch (error) {
    console.warn('Danışman sohbeti kaydedilemedi:', error?.message);
  }
}
