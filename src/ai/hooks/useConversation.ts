import { useState, useEffect } from 'react';
import { ConversationManager } from '../conversation/ConversationManager';
import { ConversationSession } from '../conversation/ConversationStorage';
import { AIChatMessage } from '../core/types';
import { TokenCounter } from '../utils/TokenCounter';

export function useConversation(sessionId?: string) {
  const [manager] = useState(() => ConversationManager.getInstance());
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(0);

  useEffect(() => {
    let currentId = sessionId;
    if (!currentId) {
      const sessions = manager.getAllSessions();
      if (sessions.length > 0) {
        currentId = sessions[0].id;
      } else {
        const newSession = manager.createSession('AI Engine Test Session');
        currentId = newSession.id;
      }
    }

    const currentSession = manager.getAllSessions().find((s) => s.id === currentId) || null;
    setActiveSession(currentSession);
    const msgs = manager.getMessages(currentId);
    setMessages(msgs);
    setTokenCount(TokenCounter.estimateMessageTokens(msgs));
  }, [sessionId, manager]);

  const sendMessage = (content: string, role: 'user' | 'assistant' = 'user') => {
    if (!activeSession) return;
    const msg = manager.addMessage(activeSession.id, role, content);
    const updatedMsgs = manager.getMessages(activeSession.id);
    setMessages(updatedMsgs);
    setTokenCount(TokenCounter.estimateMessageTokens(updatedMsgs));
    return msg;
  };

  const clearMessages = () => {
    if (!activeSession) return;
    manager.clearSession(activeSession.id);
    setMessages([]);
    setTokenCount(0);
  };

  return {
    activeSession,
    messages,
    tokenCount,
    sendMessage,
    clearMessages
  };
}
