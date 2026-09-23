import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  archiveSession,
  createSession,
  greetingMessage,
  hasConversation,
  loadAdvisorState,
  prependSession,
  removeSession,
  saveAdvisorState,
  sessionTitle,
} from '../services/advisorChat';

const AdvisorChatContext = createContext(null);

export function AdvisorChatProvider({ children }) {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(() => createSession({ greeting: t('advisorGreeting') }));
  const [sessions, setSessions] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const persistTimer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    loadAdvisorState().then((stored) => {
      if (cancelled) return;
      if (stored?.active?.messages?.length) setActive(stored.active);
      if (stored?.sessions?.length) setSessions(stored.sessions);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      saveAdvisorState({ active, sessions });
    }, 180);
    return () => clearTimeout(persistTimer.current);
  }, [active, sessions, hydrated]);

  useEffect(() => {
    setActive((prev) => {
      const messages = prev?.messages || [];
      const greeting = messages.find((msg) => msg.id === 'greeting');
      if (greeting?.text === t('advisorGreeting')) return prev;
      return {
        ...prev,
        messages: messages.map((msg) =>
          msg.id === 'greeting' ? greetingMessage(t('advisorGreeting')) : msg
        ),
      };
    });
  }, [i18n.language, t]);

  const messages = active?.messages || [];

  const setMessages = useCallback((updater) => {
    setActive((prev) => {
      const current = prev?.messages || [];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return { ...prev, messages: next, updatedAt: Date.now() };
    });
  }, []);

  const resetActive = useCallback(
    ({ archive = true, country } = {}) => {
      setSessions((prevSessions) => {
        const copy = archive ? archiveSession(active, t('recentChatsUntitled')) : null;
        return prependSession(prevSessions, copy);
      });
      setActive(createSession({ greeting: t('advisorGreeting'), country: country || active?.country || 'auto' }));
    },
    [active, t]
  );

  const openSession = useCallback(
    (id) => {
      const target = sessions.find((item) => item.id === id);
      if (!target) return false;
      setSessions((prev) => {
        const rest = prev.filter((item) => item.id !== id);
        const copy = hasConversation(active) && active.id !== id
          ? archiveSession(active, t('recentChatsUntitled'))
          : null;
        return prependSession(rest, copy);
      });
      setActive({
        ...target,
        messages: (target.messages || []).map((msg) =>
          msg.id === 'greeting' ? greetingMessage(t('advisorGreeting')) : msg
        ),
        updatedAt: Date.now(),
      });
      return true;
    },
    [active, sessions, t]
  );

  const deleteSession = useCallback((id) => {
    if (!id) return;
    setSessions((prev) => removeSession(prev, id));
    setActive((prev) => {
      if (prev?.id !== id) return prev;
      return createSession({ greeting: t('advisorGreeting'), country: prev?.country || 'auto' });
    });
  }, [t]);

  const value = useMemo(
    () => ({
      hydrated,
      active,
      messages,
      sessions,
      setMessages,
      resetActive,
      openSession,
      deleteSession,
      sessionTitle: (session) => sessionTitle(session, t('recentChatsUntitled')),
    }),
    [active, deleteSession, hydrated, messages, openSession, resetActive, sessions, setMessages, t]
  );

  return <AdvisorChatContext.Provider value={value}>{children}</AdvisorChatContext.Provider>;
}

export function useAdvisorChat() {
  const value = useContext(AdvisorChatContext);
  if (!value) {
    throw new Error('useAdvisorChat AdvisorChatProvider içinde kullanılmalıdır.');
  }
  return value;
}
