export type AgentExecutionStatus =
  | 'queued'
  | 'validating'
  | 'loading_context'
  | 'calling_ai'
  | 'finalizing'
  | 'completed'
  | 'failed'
  | 'timed_out'
  | 'cancelled';

export type AgentProgressPercent = 0 | 10 | 25 | 50 | 75 | 100;

export interface AgentExecutionLogEntry {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  progress?: AgentProgressPercent;
  metadata?: Record<string, unknown>;
}

export interface AgentTokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  agentName: string;
  taskId: string;
  taskTitle: string;
  status: AgentExecutionStatus;
  progress: AgentProgressPercent;
  promptSent?: string;
  responseReceived?: string;
  structuredResult?: Record<string, unknown>;
  websiteId?: string;
  websiteDomain?: string;
  memoryContextLoaded: boolean;
  websiteContextLoaded: boolean;
  tokenUsage?: AgentTokenUsage;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  logs: AgentExecutionLogEntry[];
  notifiedTaskEngine: boolean;
}

/** Lightweight task payload received from Task Engine (or demo UI). */
export interface RuntimeTaskInput {
  taskId: string;
  title: string;
  description?: string;
  category?: string;
  priority?: string;
  websiteId?: string;
  websiteDomain?: string;
  agentId?: string;
  payload?: Record<string, unknown>;
  timeoutMs?: number;
}
