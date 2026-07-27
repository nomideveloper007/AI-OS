export type SEOLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';

export interface SEOLogEntry {
  id: string;
  level: SEOLogLevel;
  message: string;
  timestamp: string;
  auditId?: string;
  metadata?: Record<string, unknown>;
}

type Listener = (entry: SEOLogEntry) => void;

export class SEOLogger {
  private static instance: SEOLogger;
  private logs: SEOLogEntry[] = [];
  private listeners = new Set<Listener>();
  private maxLogs = 300;

  private constructor() {}

  public static getInstance(): SEOLogger {
    if (!SEOLogger.instance) SEOLogger.instance = new SEOLogger();
    return SEOLogger.instance;
  }

  public log(
    level: SEOLogLevel,
    message: string,
    auditId?: string,
    metadata?: Record<string, unknown>
  ): SEOLogEntry {
    const entry: SEOLogEntry = {
      id: `seolog-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      auditId,
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.pop();
    this.listeners.forEach((l) => l(entry));
    return entry;
  }

  public info(message: string, auditId?: string, metadata?: Record<string, unknown>) {
    return this.log('INFO', message, auditId, metadata);
  }

  public warn(message: string, auditId?: string, metadata?: Record<string, unknown>) {
    return this.log('WARN', message, auditId, metadata);
  }

  public error(message: string, auditId?: string, metadata?: Record<string, unknown>) {
    return this.log('ERROR', message, auditId, metadata);
  }

  public success(message: string, auditId?: string, metadata?: Record<string, unknown>) {
    return this.log('SUCCESS', message, auditId, metadata);
  }

  public getLogs(auditId?: string): SEOLogEntry[] {
    if (!auditId) return [...this.logs];
    return this.logs.filter((l) => l.auditId === auditId);
  }

  public clear(): void {
    this.logs = [];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
