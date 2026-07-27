export type IntelligenceLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface IntelligenceLogEntry {
  id: string;
  level: IntelligenceLogLevel;
  message: string;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

type Listener = (entry: IntelligenceLogEntry) => void;

export class WebsiteLogger {
  private static instance: WebsiteLogger;
  private logs: IntelligenceLogEntry[] = [];
  private listeners = new Set<Listener>();
  private maxLogs = 150;

  private constructor() {}

  public static getInstance(): WebsiteLogger {
    if (!WebsiteLogger.instance) {
      WebsiteLogger.instance = new WebsiteLogger();
    }
    return WebsiteLogger.instance;
  }

  public log(
    level: IntelligenceLogLevel,
    message: string,
    source = 'WebsiteIntelligence',
    metadata?: Record<string, unknown>
  ): IntelligenceLogEntry {
    const entry: IntelligenceLogEntry = {
      id: `wilog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      level,
      message,
      source,
      timestamp: new Date().toISOString(),
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) this.logs.pop();
    this.listeners.forEach((l) => l(entry));
    return entry;
  }

  public info(message: string, source?: string, metadata?: Record<string, unknown>) {
    return this.log('INFO', message, source, metadata);
  }

  public warn(message: string, source?: string, metadata?: Record<string, unknown>) {
    return this.log('WARN', message, source, metadata);
  }

  public error(message: string, source?: string, metadata?: Record<string, unknown>) {
    return this.log('ERROR', message, source, metadata);
  }

  public getLogs(): IntelligenceLogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
