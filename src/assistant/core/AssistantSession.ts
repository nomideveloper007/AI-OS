import { ConversationMessage } from '../types';
import { AssistantLogger } from './AssistantLogger';

export class AssistantSession {
  private static instance: AssistantSession;
  private messages: ConversationMessage[] = [];
  private startTime = new Date().toISOString();
  private turns = 0;
  private logger = AssistantLogger.getInstance();

  private constructor() {}

  public static getInstance(): AssistantSession {
    if (!AssistantSession.instance) {
      AssistantSession.instance = new AssistantSession();
    }
    return AssistantSession.instance;
  }

  public startNewSession(): void {
    this.messages = [];
    this.startTime = new Date().toISOString();
    this.turns = 0;
    this.logger.info('Started new conversation session', 'AssistantSession');
  }

  public addMessage(role: 'user' | 'assistant' | 'system', content: string): ConversationMessage {
    const msg: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(msg);
    if (role !== 'system') {
      this.turns++;
    }
    return msg;
  }

  public getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  public getSessionStats() {
    return {
      startTime: this.startTime,
      turns: this.turns,
      messageCount: this.messages.length,
    };
  }
}
