export type WorkflowEventType = 'workflow_created' | 'workflow_started' | 'workflow_paused' | 'workflow_completed' | 'workflow_failed' | 'step_executed';

export interface WorkflowEvent {
  id: string;
  type: WorkflowEventType;
  workflowId: string;
  payload?: any;
  timestamp: string;
}

export class WorkflowEvents {
  private static listeners: Set<(evt: WorkflowEvent) => void> = new Set();

  public static emit(type: WorkflowEventType, workflowId: string, payload?: any): void {
    const evt: WorkflowEvent = {
      id: `wfevt-${Date.now()}`,
      type,
      workflowId,
      payload,
      timestamp: new Date().toISOString()
    };
    WorkflowEvents.listeners.forEach((fn) => fn(evt));
  }

  public static subscribe(fn: (evt: WorkflowEvent) => void): () => void {
    WorkflowEvents.listeners.add(fn);
    return () => WorkflowEvents.listeners.delete(fn);
  }
}
