import { WorkflowExecutor } from './WorkflowExecutor';
import { WorkflowObject } from '../types/Workflow';

export class WorkflowRunner {
  public static async run(workflow: WorkflowObject) {
    return WorkflowExecutor.executeWorkflow(workflow);
  }
}
