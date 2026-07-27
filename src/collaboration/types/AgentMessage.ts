export type AgentMessageType =
  | 'request_info'
  | 'share_finding'
  | 'ask_clarification'
  | 'report_completion'
  | 'system'
  | 'conflict_notice'
  | 'consensus';

export interface AgentMessage {
  id: string;
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
  createdAt: string;
}
