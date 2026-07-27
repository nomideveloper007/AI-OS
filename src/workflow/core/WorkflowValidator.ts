import { WorkflowObject } from '../types/Workflow';

export class WorkflowValidator {
  public static validate(workflow: Partial<WorkflowObject>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!workflow.name || workflow.name.trim().length === 0) errors.push('Workflow name is required.');
    if (!workflow.category) errors.push('Workflow category is required.');
    if (!workflow.steps || workflow.steps.length === 0) errors.push('Workflow must contain at least 1 step.');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
