import { WorkflowExecutionRecord } from '../types/WorkflowExecution';

export class WorkflowHistory {
  private history: WorkflowExecutionRecord[] = [];

  public recordExecution(record: WorkflowExecutionRecord): void {
    this.history.unshift(record);
  }

  public getHistoryForWorkflow(workflowId: string): WorkflowExecutionRecord[] {
    return this.history.filter((h) => h.workflowId === workflowId);
  }

  public getAllHistory(): WorkflowExecutionRecord[] {
    return [...this.history];
  }
}
