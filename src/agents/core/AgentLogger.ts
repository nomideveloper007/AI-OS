import { IAgentLog } from '../interfaces/IAgent';

export class AgentLogger {
  private logs: IAgentLog[] = [];

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, any>): IAgentLog {
    const entry: IAgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      level,
      message,
      timestamp: new Date().toLocaleTimeString(),
      metadata
    };
    this.logs.unshift(entry);
    return entry;
  }

  public getLogs(): IAgentLog[] {
    return [...this.logs];
  }
}
