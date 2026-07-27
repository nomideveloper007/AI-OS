import { AIChatMessage } from '../core/types';

export interface ConversationSession {
  id: string;
  title: string;
  websiteId?: string;
  agentId?: string;
  createdAt: string;
  updatedAt: string;
  messages: AIChatMessage[];
  metadata?: Record<string, any>;
}

export class ConversationStorage {
  private static instance: ConversationStorage;
  private sessions: Map<string, ConversationSession> = new Map();

  private constructor() {}

  public static getInstance(): ConversationStorage {
    if (!ConversationStorage.instance) {
      ConversationStorage.instance = new ConversationStorage();
    }
    return ConversationStorage.instance;
  }

  public saveSession(session: ConversationSession): void {
    this.sessions.set(session.id, session);
  }

  public getSession(id: string): ConversationSession | undefined {
    return this.sessions.get(id);
  }

  public getAllSessions(): ConversationSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }
}
