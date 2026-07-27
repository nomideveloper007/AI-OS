import { WorkflowObject } from '../types/Workflow';
import { WorkflowStep } from '../types/WorkflowStep';
import { WorkflowPriority } from '../types/WorkflowPriority';
import { WorkflowTrigger } from '../types/WorkflowTrigger';
import { WorkflowStatus } from '../types/WorkflowStatus';

export class WorkflowBuilder {
  private workflow: Partial<WorkflowObject> = {
    steps: [],
    conditions: [],
    actions: [],
    status: 'Draft',
    priority: 'Medium',
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    averageDuration: 0
  };

  public setName(name: string): this {
    this.workflow.name = name;
    return this;
  }

  public setDescription(description: string): this {
    this.workflow.description = description;
    return this;
  }

  public setCategory(category: string): this {
    this.workflow.category = category;
    return this;
  }

  public setPriority(priority: WorkflowPriority): this {
    this.workflow.priority = priority;
    return this;
  }

  public setTrigger(trigger: WorkflowTrigger): this {
    this.workflow.trigger = trigger;
    return this;
  }

  public setWebsite(website: string): this {
    this.workflow.website = website;
    return this;
  }

  public addStep(step: WorkflowStep): this {
    this.workflow.steps!.push(step);
    if (step.action && !this.workflow.actions!.includes(step.action)) {
      this.workflow.actions!.push(step.action);
    }
    if (step.condition && !this.workflow.conditions!.includes(step.condition)) {
      this.workflow.conditions!.push(step.condition);
    }
    return this;
  }

  public build(): WorkflowObject {
    if (!this.workflow.name || !this.workflow.category) {
      throw new Error('Workflow name and category are required.');
    }
    const now = new Date().toISOString();
    return {
      id: `wf-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: this.workflow.name,
      description: this.workflow.description || '',
      category: this.workflow.category,
      priority: (this.workflow.priority as WorkflowPriority) || 'Medium',
      status: (this.workflow.status as WorkflowStatus) || 'Draft',
      trigger: (this.workflow.trigger as WorkflowTrigger) || 'Manual',
      steps: this.workflow.steps || [],
      conditions: this.workflow.conditions || [],
      actions: this.workflow.actions || [],
      assignedAgent: this.workflow.assignedAgent,
      website: this.workflow.website,
      createdAt: now,
      updatedAt: now,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageDuration: 0
    };
  }
}
