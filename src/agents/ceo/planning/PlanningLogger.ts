export type PlanningLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';

export interface PlanningLogEntry {
  id: string;
  level: PlanningLogLevel;
  message: string;
  timestamp: string;
  domain?: string;
  metadata?: Record<string, unknown>;
}

export class PlanningLogger {
  private static instance: PlanningLogger;
  private logs: PlanningLogEntry[] = [];
  private max = 300;

  public static getInstance(): PlanningLogger {
    if (!PlanningLogger.instance) PlanningLogger.instance = new PlanningLogger();
    return PlanningLogger.instance;
  }

  public log(
    level: PlanningLogLevel,
    message: string,
    domain?: string,
    metadata?: Record<string, unknown>
  ): PlanningLogEntry {
    const entry: PlanningLogEntry = {
      id: `plog-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      domain,
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.max) this.logs.pop();
    return entry;
  }

  public info(message: string, domain?: string, metadata?: Record<string, unknown>) {
    return this.log('INFO', message, domain, metadata);
  }

  public warn(message: string, domain?: string, metadata?: Record<string, unknown>) {
    return this.log('WARN', message, domain, metadata);
  }

  public error(message: string, domain?: string, metadata?: Record<string, unknown>) {
    return this.log('ERROR', message, domain, metadata);
  }

  public success(message: string, domain?: string, metadata?: Record<string, unknown>) {
    return this.log('SUCCESS', message, domain, metadata);
  }

  public getLogs(domain?: string): PlanningLogEntry[] {
    if (!domain) return [...this.logs];
    return this.logs.filter((l) => l.domain === domain);
  }

  public clear(): void {
    this.logs = [];
  }
}
