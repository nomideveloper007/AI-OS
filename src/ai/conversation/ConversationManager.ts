import { ConversationStorage, ConversationSession } from './ConversationStorage';
import { AIChatMessage, AIChatRole } from '../core/types';
import { AILogger } from '../utils/Logger';

export class ConversationManager {
  private static instance: ConversationManager;
  private storage = ConversationStorage.getInstance();
  private logger = AILogger.getInstance();

  private constructor() {}

  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  public createSession(title: string = 'New AI Conversation', websiteId?: string): ConversationSession {
    const now = new Date().toISOString();
    const session: ConversationSession = {
      id: `conv-${Date.now()}`,
      title,
      websiteId,
      createdAt: now,
      updatedAt: now,
      messages: []
    };

    this.storage.saveSession(session);
    this.logger.info(`Created new conversation session: ${session.id}`, 'ConversationManager');
    return session;
  }

  public addMessage(sessionId: string, role: AIChatRole, content: string, metadata?: Record<string, any>): AIChatMessage {
    let session = this.storage.getSession(sessionId);
    if (!session) {
      session = this.createSession('AI Session', undefined);
    }

    const message: AIChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    this.storage.saveSession(session);

    return message;
  }

  public getMessages(sessionId: string): AIChatMessage[] {
    const session = this.storage.getSession(sessionId);
    return session ? session.messages : [];
  }

  public getAllSessions(): ConversationSession[] {
    return this.storage.getAllSessions();
  }

  public clearSession(sessionId: string): void {
    const session = this.storage.getSession(sessionId);
    if (session) {
      session.messages = [];
      session.updatedAt = new Date().toISOString();
      this.storage.saveSession(session);
      this.logger.info(`Cleared messages for session: ${sessionId}`, 'ConversationManager');
    }
  }
}
