import type { TaskPriority } from './TaskPriority';
import type { TaskCategory } from './TaskCategory';
import type { TaskStatus } from './TaskStatus';

export interface TaskLogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  agentId?: string;
  agentName?: string;
}

export interface TaskExecutionRecord {
  id: string;
  taskId: string;
  agentId: string;
  agentName: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  result?: string;
  success: boolean;
  errorMessage?: string;
  logs: TaskLogEntry[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  websiteId?: string;
  websiteDomain?: string;
  requestedBy: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  status: TaskStatus;
  dependencies: string[];
  estimatedDurationMs: number;
  actualDurationMs?: number;
  retryCount: number;
  maxRetries: number;
  approvalRequired: boolean;
  executionHistory: TaskExecutionRecord[];
  logs: TaskLogEntry[];
  createdAt: string;
  updatedAt: string;
  queuedAt?: string;
  startedAt?: string;
  completedAt?: string;
  resultSummary?: string;
  payload?: Record<string, unknown>;
}

export type CreateTaskInput = {
  title: string;
  description?: string;
  priority?: TaskPriority;
  category?: TaskCategory;
  websiteId?: string;
  websiteDomain?: string;
  requestedBy?: string;
  dependencies?: string[];
  estimatedDurationMs?: number;
  approvalRequired?: boolean;
  assignedAgentId?: string;
  payload?: Record<string, unknown>;
};
