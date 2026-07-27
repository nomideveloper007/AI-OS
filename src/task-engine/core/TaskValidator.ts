import type { CreateTaskInput, Task } from '../types/Task';
import { TASK_CATEGORIES } from '../types/TaskCategory';
import { TASK_PRIORITY_WEIGHT } from '../types/TaskPriority';

export class TaskValidator {
  public static validateCreate(input: CreateTaskInput): string[] {
    const errors: string[] = [];
    if (!input.title || !input.title.trim()) errors.push('Title is required.');
    if (input.title && input.title.trim().length > 200) errors.push('Title must be ≤ 200 characters.');
    if (input.category && !TASK_CATEGORIES.includes(input.category)) {
      errors.push(`Invalid category: ${input.category}`);
    }
    if (input.priority && !(input.priority in TASK_PRIORITY_WEIGHT)) {
      errors.push(`Invalid priority: ${input.priority}`);
    }
    if (input.estimatedDurationMs != null && input.estimatedDurationMs < 0) {
      errors.push('Estimated duration must be ≥ 0.');
    }
    if (input.dependencies && input.dependencies.some((d) => !d)) {
      errors.push('Dependencies must be valid task IDs.');
    }
    return errors;
  }

  public static assertCreate(input: CreateTaskInput): void {
    const errors = TaskValidator.validateCreate(input);
    if (errors.length) throw new Error(errors.join(' '));
  }

  public static validateDependencies(task: Task, allTasks: Task[]): string[] {
    const errors: string[] = [];
    const ids = new Set(allTasks.map((t) => t.id));
    for (const dep of task.dependencies) {
      if (!ids.has(dep)) errors.push(`Missing dependency task: ${dep}`);
      if (dep === task.id) errors.push('Task cannot depend on itself.');
    }
    return errors;
  }

  public static dependenciesSatisfied(task: Task, allTasks: Task[]): boolean {
    if (!task.dependencies.length) return true;
    const byId = new Map(allTasks.map((t) => [t.id, t]));
    return task.dependencies.every((depId) => {
      const dep = byId.get(depId);
      return dep?.status === 'completed';
    });
  }
}
