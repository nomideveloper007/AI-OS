import { WorkflowStep } from '../types/WorkflowStep';
import { WorkflowStatus } from '../types/WorkflowStatus';

export class StepBuilder {
  private step: Partial<WorkflowStep> = {
    retryCount: 1,
    timeout: 10000,
    estimatedDuration: 1000,
    status: 'Ready'
  };

  public setName(name: string): this {
    this.step.name = name;
    return this;
  }

  public setDescription(description: string): this {
    this.step.description = description;
    return this;
  }

  public setAction(action: string): this {
    this.step.action = action;
    return this;
  }

  public setAgent(agentName: string): this {
    this.step.assignedAgent = agentName;
    return this;
  }

  public setCondition(condition: string): this {
    this.step.condition = condition;
    return this;
  }

  public build(): WorkflowStep {
    if (!this.step.name || !this.step.action) {
      throw new Error('Step name and action are required.');
    }
    return {
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: this.step.name,
      description: this.step.description || '',
      status: (this.step.status as WorkflowStatus) || 'Ready',
      assignedAgent: this.step.assignedAgent,
      action: this.step.action,
      condition: this.step.condition,
      retryCount: this.step.retryCount || 1,
      timeout: this.step.timeout || 10000,
      estimatedDuration: this.step.estimatedDuration || 1000
    };
  }
}
