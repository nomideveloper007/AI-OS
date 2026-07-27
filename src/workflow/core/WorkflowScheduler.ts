import { WorkflowObject } from '../types/Workflow';

export class WorkflowScheduler {
  private scheduled: Map<string, string> = new Map();

  public scheduleWorkflow(workflow: WorkflowObject, cronOrTrigger: string): void {
    this.scheduled.set(workflow.id, cronOrTrigger);
  }

  public getSchedule(workflowId: string): string | undefined {
    return this.scheduled.get(workflowId);
  }
}
