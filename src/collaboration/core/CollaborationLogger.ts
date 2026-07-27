export type CollaborationLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';

export interface CollaborationLogEntry {
  id: string;
  level: CollaborationLogLevel;
  message: string;
  timestamp: string;
  sessionId?: string;
  agentId?: string;
  metadata?: Record<string, unknown>;
}

export class CollaborationLogger {
  private static instance: CollaborationLogger;
  private logs: CollaborationLogEntry[] = [];
  private max = 400;

  public static getInstance(): CollaborationLogger {
    if (!CollaborationLogger.instance) CollaborationLogger.instance = new CollaborationLogger();
    return CollaborationLogger.instance;
  }

  public log(
    level: CollaborationLogLevel,
    message: string,
    sessionId?: string,
    agentId?: string,
    metadata?: Record<string, unknown>
  ): CollaborationLogEntry {
    const entry: CollaborationLogEntry = {
      id: `clog-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId,
      agentId,
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.max) this.logs.pop();
    return entry;
  }

  public info(message: string, sessionId?: string, metadata?: Record<string, unknown>) {
    return this.log('INFO', message, sessionId, undefined, metadata);
  }

  public warn(message: string, sessionId?: string, metadata?: Record<string, unknown>) {
    return this.log('WARN', message, sessionId, undefined, metadata);
  }

  public error(message: string, sessionId?: string, metadata?: Record<string, unknown>) {
    return this.log('ERROR', message, sessionId, undefined, metadata);
  }

  public success(message: string, sessionId?: string, metadata?: Record<string, unknown>) {
    return this.log('SUCCESS', message, sessionId, undefined, metadata);
  }

  public getLogs(sessionId?: string): CollaborationLogEntry[] {
    if (!sessionId) return [...this.logs];
    return this.logs.filter((l) => l.sessionId === sessionId);
  }

  public clear(): void {
    this.logs = [];
  }
}
