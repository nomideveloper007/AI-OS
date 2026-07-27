import type { AgentRuntimeCapability } from './AgentCapability';
import type { AgentHealthStatus } from './AgentHealthStatus';
import type { AgentRuntimeRole } from './AgentRole';
import type { AgentRuntimeStatus } from './AgentStatus';

export interface RuntimeAgent {
  id: string;
  name: string;
  role: AgentRuntimeRole;
  description: string;
  capabilities: AgentRuntimeCapability[];
  skills: string[];
  currentTaskId?: string;
  currentTaskTitle?: string;
  queueLength: number;
  health: AgentHealthStatus;
  cpuUsage: number;
  memoryUsage: number;
  status: AgentRuntimeStatus;
  lastHeartbeat?: string;
  lastActivity: string;
  tasksCompleted: number;
  tasksFailed: number;
  averageExecutionTimeMs: number;
  totalExecutionTimeMs: number;
  crashCount: number;
  missedHeartbeats: number;
  maxConcurrent: number;
  timeoutMs: number;
  autoRecover: boolean;
  linkedRegistryAgentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateRuntimeAgentInput = {
  name: string;
  role: AgentRuntimeRole;
  description?: string;
  capabilities?: AgentRuntimeCapability[];
  skills?: string[];
  maxConcurrent?: number;
  timeoutMs?: number;
  autoRecover?: boolean;
  linkedRegistryAgentId?: string;
  id?: string;
};
