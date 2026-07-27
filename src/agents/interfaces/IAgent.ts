import { AgentStatus } from '../types/AgentStatus';
import { AgentPriority } from '../types/AgentPriority';
import { AgentRole } from '../types/AgentRole';
import { AgentCapability } from '../types/AgentCapabilities';
import { IAgentTask } from './IAgentTask';
import { IAgentResult } from './IAgentResult';
import { IAgentContext } from './IAgentContext';

export interface IAgentLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IAgentTimelineEvent {
  id: string;
  event: 'Created' | 'Started' | 'Paused' | 'Resumed' | 'Stopped' | 'Completed' | 'Failed';
  details: string;
  timestamp: string;
}

export interface IAgentMetricsData {
  executionCount: number;
  successCount: number;
  failureCount: number;
  totalDurationMs: number;
  averageDurationMs: number;
  lastExecutionTime?: string;
}

export interface IAgent {
  id: string;
  name: string;
  description: string;
  role: AgentRole;
  status: AgentStatus;
  priority: AgentPriority;
  capabilities: AgentCapability[];
  createdAt: string;
  updatedAt: string;

  initialize(context?: Partial<IAgentContext>): Promise<void>;
  start(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(): Promise<void>;
  execute(task: IAgentTask): Promise<IAgentResult>;
  cancel(taskId: string): Promise<void>;
  validate(): boolean;
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, any>): void;
  report(): Record<string, any>;
  cleanup(): Promise<void>;
}
