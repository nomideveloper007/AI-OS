import type { AgentMessage, AgentMessageType } from '../types/AgentMessage';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { CollaborationLogger } from './CollaborationLogger';

export type SendMessageInput = {
  sessionId: string;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId?: string;
  toAgentName?: string;
  type: AgentMessageType;
  subject: string;
  body: string;
  payload?: Record<string, unknown>;
  relatedContributionId?: string;
};

/**
 * Structured inter-agent messaging. All messages are persisted.
 */
export class AgentMessenger {
  private repo = CollaborationRepository.getInstance();
  private logger = CollaborationLogger.getInstance();

  public send(input: SendMessageInput): AgentMessage {
    const message: AgentMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sessionId: input.sessionId,
      fromAgentId: input.fromAgentId,
      fromAgentName: input.fromAgentName,
      toAgentId: input.toAgentId,
      toAgentName: input.toAgentName,
      type: input.type,
      subject: input.subject,
      body: input.body,
      payload: input.payload,
      relatedContributionId: input.relatedContributionId,
      createdAt: new Date().toISOString(),
    };
    this.repo.saveMessage(message);
    this.logger.info(
      `Message ${message.type}: ${message.subject} (${message.fromAgentName})`,
      input.sessionId,
      { messageId: message.id, type: message.type }
    );
    return message;
  }

  public list(sessionId: string): AgentMessage[] {
    return this.repo.listMessages(sessionId);
  }

  public broadcastSystem(sessionId: string, subject: string, body: string): AgentMessage {
    return this.send({
      sessionId,
      fromAgentId: 'system',
      fromAgentName: 'Collaboration Engine',
      type: 'system',
      subject,
      body,
    });
  }
}
