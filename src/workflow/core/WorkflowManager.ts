import { WorkflowRepository } from '../repositories/WorkflowRepository';
import { WorkflowObject } from '../types/Workflow';
import { WorkflowValidator } from './WorkflowValidator';
import { WorkflowEvents } from './WorkflowEvents';

export class WorkflowManager {
  private static instance: WorkflowManager;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): WorkflowManager {
    if (!WorkflowManager.instance) {
      WorkflowManager.instance = new WorkflowManager();
    }
    return WorkflowManager.instance;
  }

  public createWorkflow(wf: WorkflowObject): WorkflowObject {
    const val = WorkflowValidator.validate(wf);
    if (!val.valid) {
      throw new Error(`Workflow validation failed: ${val.errors.join(', ')}`);
    }

    this.repo.save(wf);
    WorkflowEvents.emit('workflow_created', wf.id);
    return wf;
  }

  public getWorkflows(): WorkflowObject[] {
    return this.repo.getAll();
  }

  public getWorkflowById(id: string): WorkflowObject | undefined {
    return this.repo.get(id);
  }

  public updateWorkflowStatus(id: string, status: any): void {
    const wf = this.repo.get(id);
    if (wf) {
      wf.status = status;
      wf.updatedAt = new Date().toISOString();
      this.repo.save(wf);
    }
  }

  public deleteWorkflow(id: string): boolean {
    return this.repo.delete(id);
  }
}
