export type ScannerLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface ScannerLogEntry {
  id: string;
  level: ScannerLogLevel;
  message: string;
  timestamp: string;
  websiteId?: string;
  metadata?: Record<string, unknown>;
}

export class ScanLogger {
  private static instance: ScanLogger;
  private logs: ScannerLogEntry[] = [];
  private max = 200;

  public static getInstance(): ScanLogger {
    if (!ScanLogger.instance) ScanLogger.instance = new ScanLogger();
    return ScanLogger.instance;
  }

  public log(
    level: ScannerLogLevel,
    message: string,
    websiteId?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.logs.unshift({
      id: `slog-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      websiteId,
      metadata,
    });
    if (this.logs.length > this.max) this.logs.pop();
  }

  public info(message: string, websiteId?: string, metadata?: Record<string, unknown>) {
    this.log('INFO', message, websiteId, metadata);
  }

  public warn(message: string, websiteId?: string, metadata?: Record<string, unknown>) {
    this.log('WARN', message, websiteId, metadata);
  }

  public error(message: string, websiteId?: string, metadata?: Record<string, unknown>) {
    this.log('ERROR', message, websiteId, metadata);
  }

  public getLogs(websiteId?: string): ScannerLogEntry[] {
    if (!websiteId) return [...this.logs];
    return this.logs.filter((l) => l.websiteId === websiteId);
  }
}
