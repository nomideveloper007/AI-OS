import { WorkflowBuilder } from '../builders/WorkflowBuilder';
import { WorkflowObject } from '../types/Workflow';
import { WorkflowTrigger } from '../types/WorkflowTrigger';

export class WorkflowFactory {
  public static createBasicWorkflow(name: string, category: string, trigger: WorkflowTrigger = 'Manual'): WorkflowObject {
    return new WorkflowBuilder()
      .setName(name)
      .setCategory(category)
      .setTrigger(trigger)
      .build();
  }
}
