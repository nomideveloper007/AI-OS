import type { TaskStatus } from '../types/TaskStatus';

const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  draft: ['created', 'cancelled'],
  created: ['waiting_assignment', 'assigned', 'cancelled'],
  waiting_assignment: ['assigned', 'cancelled'],
  assigned: ['queued', 'waiting_assignment', 'cancelled'],
  queued: ['running', 'paused', 'cancelled'],
  running: ['waiting_approval', 'completed', 'failed', 'paused', 'cancelled'],
  waiting_approval: ['completed', 'failed', 'cancelled', 'queued'],
  paused: ['queued', 'running', 'cancelled'],
  completed: [],
  failed: ['queued', 'cancelled'], // retry → queued
  cancelled: [],
};

export class TaskLifecycle {
  public static canTransition(from: TaskStatus, to: TaskStatus): boolean {
    if (from === to) return true;
    return (TRANSITIONS[from] || []).includes(to);
  }

  public static assertTransition(from: TaskStatus, to: TaskStatus): void {
    if (!TaskLifecycle.canTransition(from, to)) {
      throw new Error(`Invalid task lifecycle transition: ${from} → ${to}`);
    }
  }

  public static isTerminal(status: TaskStatus): boolean {
    return status === 'completed' || status === 'failed' || status === 'cancelled';
  }

  public static isActive(status: TaskStatus): boolean {
    return status === 'running' || status === 'queued' || status === 'waiting_approval';
  }

  public static label(status: TaskStatus): string {
    return status.replace(/_/g, ' ');
  }
}
