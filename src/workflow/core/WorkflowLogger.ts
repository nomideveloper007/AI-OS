export interface WorkflowLogEntry {
  id: string;
  workflowId: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: string;
  stepId?: string;
}

export class WorkflowLogger {
  private logs: WorkflowLogEntry[] = [];

  public log(level: 'info' | 'warn' | 'error' | 'success', workflowId: string, message: string, stepId?: string): WorkflowLogEntry {
    const entry: WorkflowLogEntry = {
      id: `wflog-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      workflowId,
      level,
      message,
      timestamp: new Date().toLocaleTimeString(),
      stepId
    };
    this.logs.unshift(entry);
    return entry;
  }

  public getLogsForWorkflow(workflowId: string): WorkflowLogEntry[] {
    return this.logs.filter((l) => l.workflowId === workflowId);
  }

  public getAllLogs(): WorkflowLogEntry[] {
    return [...this.logs];
  }
}
