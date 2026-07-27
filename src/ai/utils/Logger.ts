export type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  source: string;
  metadata?: Record<string, any>;
}

type LogListener = (entry: LogEntry) => void;

export class AILogger {
  private static instance: AILogger;
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();
  private maxLogs: number = 200;

  private constructor() {}

  public static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  public log(level: LogLevel, message: string, source: string = 'AIEngine', metadata?: Record<string, any>): LogEntry {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      level,
      message,
      timestamp: new Date().toLocaleTimeString(),
      source,
      metadata
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    this.listeners.forEach((listener) => listener(entry));
    return entry;
  }

  public info(message: string, source: string = 'AIEngine', metadata?: Record<string, any>): LogEntry {
    return this.log('INFO', message, source, metadata);
  }

  public debug(message: string, source: string = 'AIEngine', metadata?: Record<string, any>): LogEntry {
    return this.log('DEBUG', message, source, metadata);
  }

  public warn(message: string, source: string = 'AIEngine', metadata?: Record<string, any>): LogEntry {
    return this.log('WARN', message, source, metadata);
  }

  public error(message: string, source: string = 'AIEngine', metadata?: Record<string, any>): LogEntry {
    return this.log('ERROR', message, source, metadata);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public subscribe(listener: LogListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
