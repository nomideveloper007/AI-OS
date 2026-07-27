export type MissionLogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';

export interface MissionLogEntry {
  id: string;
  level: MissionLogLevel;
  message: string;
  timestamp: string;
  missionId?: string;
  stage?: string;
  metadata?: Record<string, unknown>;
}

export class MissionLogger {
  private static instance: MissionLogger;
  private logs: MissionLogEntry[] = [];
  private max = 500;

  public static getInstance(): MissionLogger {
    if (!MissionLogger.instance) MissionLogger.instance = new MissionLogger();
    return MissionLogger.instance;
  }

  public log(
    level: MissionLogLevel,
    message: string,
    missionId?: string,
    stage?: string,
    metadata?: Record<string, unknown>
  ): MissionLogEntry {
    const entry: MissionLogEntry = {
      id: `mlog-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      missionId,
      stage,
      metadata,
    };
    this.logs.unshift(entry);
    if (this.logs.length > this.max) this.logs.pop();
    return entry;
  }

  public info(message: string, missionId?: string, stage?: string, metadata?: Record<string, unknown>) {
    return this.log('INFO', message, missionId, stage, metadata);
  }

  public warn(message: string, missionId?: string, stage?: string, metadata?: Record<string, unknown>) {
    return this.log('WARN', message, missionId, stage, metadata);
  }

  public error(message: string, missionId?: string, stage?: string, metadata?: Record<string, unknown>) {
    return this.log('ERROR', message, missionId, stage, metadata);
  }

  public success(message: string, missionId?: string, stage?: string, metadata?: Record<string, unknown>) {
    return this.log('SUCCESS', message, missionId, stage, metadata);
  }

  public getLogs(missionId?: string): MissionLogEntry[] {
    if (!missionId) return [...this.logs];
    return this.logs.filter((l) => l.missionId === missionId);
  }

  public clear(missionId?: string): void {
    if (!missionId) this.logs = [];
    else this.logs = this.logs.filter((l) => l.missionId !== missionId);
  }
}
