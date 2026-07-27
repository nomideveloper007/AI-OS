export type AgentMessageKind =
  | 'task_received'
  | 'progress'
  | 'result'
  | 'error'
  | 'heartbeat'
  | 'lifecycle'
  | 'notify_task_engine'
  | 'system';

export interface AgentMessage {
  id: string;
  agentId: string;
  kind: AgentMessageKind;
  subject: string;
  body: string;
  progress?: number;
  taskId?: string;
  executionId?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}
