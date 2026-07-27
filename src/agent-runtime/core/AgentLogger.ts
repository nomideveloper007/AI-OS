export type AgentRuntimeLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface AgentRuntimeLogEntry {
  id: string;
  level: AgentRuntimeLogLevel;
  message: string;
  source: string;
  timestamp: string;
  agentId?: string;
  executionId?: string;
  metadata?: Record<string, unknown>;
}

type Listener = (entry: AgentRuntimeLogEntry) => void;

export class AgentLogger {
  private static instance: AgentLogger;
  private logs: AgentRuntimeLogEntry[] = [];
  private listeners = new Set<Listener>();
  private maxLogs = 400;

  private constructor() {}

  public static getInstance(): AgentLogger {
    if (!AgentLogger.instance) AgentLogger.instance = new AgentLogger();
    return AgentLogger.instance;
  }

  public log(
    level: AgentRuntimeLogLevel,
    message: string,
    source = 'AgentRuntime',
    extras?: { agentId?: string; executionId?: string; metadata?: Record<string, unknown> }
  ): AgentRuntimeLogEntry {
    const entry: AgentRuntimeLogEntry = {
      id: `arlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      level,
      message,
      source,
      timestamp: new Date().toISOString(),
      agentId: extras?.agentId,
      executionId: extras?.executionId,
      metadata: extras?.metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.pop();
    this.listeners.forEach((l) => l(entry));
    return entry;
  }

  public info(message: string, source?: string, extras?: {
    agentId?: string;
    executionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.log('INFO', message, source, extras);
  }

  public warn(message: string, source?: string, extras?: {
    agentId?: string;
    executionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.log('WARN', message, source, extras);
  }

  public error(message: string, source?: string, extras?: {
    agentId?: string;
    executionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.log('ERROR', message, source, extras);
  }

  public debug(message: string, source?: string, extras?: {
    agentId?: string;
    executionId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return this.log('DEBUG', message, source, extras);
  }

  public getLogs(agentId?: string): AgentRuntimeLogEntry[] {
    if (!agentId) return [...this.logs];
    return this.logs.filter((l) => l.agentId === agentId);
  }

  public clear(): void {
    this.logs = [];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
