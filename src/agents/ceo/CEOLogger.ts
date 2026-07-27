export interface CEOLogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
}

export class CEOLogger {
  private logs: CEOLogEntry[] = [];

  public log(level: 'info' | 'warn' | 'error' | 'success', message: string, details?: any): CEOLogEntry {
    const entry: CEOLogEntry = {
      id: `ceolog-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      details
    };
    this.logs.unshift(entry);
    return entry;
  }

  public getLogs(): CEOLogEntry[] {
    return [...this.logs];
  }
}
