import { AgentPriority } from '../types/AgentPriority';

export interface IAgentTask {
  id: string;
  agentId: string;
  type: string;
  title: string;
  payload: Record<string, any>;
  priority: AgentPriority;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}
