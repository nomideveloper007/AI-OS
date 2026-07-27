export type TaskEngineLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface TaskEngineLogEntry {
  id: string;
  level: TaskEngineLogLevel;
  message: string;
  source: string;
  timestamp: string;
  taskId?: string;
  metadata?: Record<string, unknown>;
}

type Listener = (entry: TaskEngineLogEntry) => void;

export class TaskLogger {
  private static instance: TaskLogger;
  private logs: TaskEngineLogEntry[] = [];
  private listeners = new Set<Listener>();
  private maxLogs = 300;

  private constructor() {}

  public static getInstance(): TaskLogger {
    if (!TaskLogger.instance) TaskLogger.instance = new TaskLogger();
    return TaskLogger.instance;
  }

  public log(
    level: TaskEngineLogLevel,
    message: string,
    source = 'TaskEngine',
    taskId?: string,
    metadata?: Record<string, unknown>
  ): TaskEngineLogEntry {
    const entry: TaskEngineLogEntry = {
      id: `tlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      level,
      message,
      source,
      timestamp: new Date().toISOString(),
      taskId,
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.pop();
    this.listeners.forEach((l) => l(entry));
    return entry;
  }

  public info(message: string, source?: string, taskId?: string, metadata?: Record<string, unknown>) {
    return this.log('INFO', message, source, taskId, metadata);
  }

  public warn(message: string, source?: string, taskId?: string, metadata?: Record<string, unknown>) {
    return this.log('WARN', message, source, taskId, metadata);
  }

  public error(message: string, source?: string, taskId?: string, metadata?: Record<string, unknown>) {
    return this.log('ERROR', message, source, taskId, metadata);
  }

  public getLogs(taskId?: string): TaskEngineLogEntry[] {
    if (!taskId) return [...this.logs];
    return this.logs.filter((l) => l.taskId === taskId);
  }

  public clear(): void {
    this.logs = [];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
