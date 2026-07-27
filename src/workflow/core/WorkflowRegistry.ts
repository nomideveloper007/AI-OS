import { WorkflowRepository } from '../repositories/WorkflowRepository';
import { WorkflowObject } from '../types/Workflow';

export class WorkflowRegistry {
  private static instance: WorkflowRegistry;
  private repo = WorkflowRepository.getInstance();

  private constructor() {}

  public static getInstance(): WorkflowRegistry {
    if (!WorkflowRegistry.instance) {
      WorkflowRegistry.instance = new WorkflowRegistry();
    }
    return WorkflowRegistry.instance;
  }

  public register(workflow: WorkflowObject): void {
    this.repo.save(workflow);
  }

  public get(id: string): WorkflowObject | undefined {
    return this.repo.get(id);
  }

  public getAll(): WorkflowObject[] {
    return this.repo.getAll();
  }
}
