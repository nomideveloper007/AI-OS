import type { Task } from '../types/Task';
import type { TaskStatus } from '../types/TaskStatus';

export interface TaskEngineMetricsSnapshot {
  total: number;
  draft: number;
  waitingAssignment: number;
  assigned: number;
  queued: number;
  running: number;
  waitingApproval: number;
  completed: number;
  failed: number;
  cancelled: number;
  paused: number;
  queueLength: number;
  averageDurationMs: number;
  totalRetries: number;
  agentUtilization: Array<{
    agentId: string;
    agentName: string;
    running: number;
    completed: number;
    failed: number;
  }>;
  updatedAt: string;
}

function countStatus(tasks: Task[], status: TaskStatus): number {
  return tasks.filter((t) => t.status === status).length;
}

export class TaskMetrics {
  public static compute(tasks: Task[]): TaskEngineMetricsSnapshot {
    const completed = tasks.filter((t) => t.status === 'completed' && t.actualDurationMs != null);
    const avg =
      completed.length === 0
        ? 0
        : Math.round(
            completed.reduce((sum, t) => sum + (t.actualDurationMs || 0), 0) / completed.length
          );

    const utilMap = new Map<
      string,
      { agentId: string; agentName: string; running: number; completed: number; failed: number }
    >();

    for (const task of tasks) {
      if (!task.assignedAgentId) continue;
      const key = task.assignedAgentId;
      const row = utilMap.get(key) || {
        agentId: task.assignedAgentId,
        agentName: task.assignedAgentName || task.assignedAgentId,
        running: 0,
        completed: 0,
        failed: 0,
      };
      if (task.status === 'running') row.running += 1;
      if (task.status === 'completed') row.completed += 1;
      if (task.status === 'failed') row.failed += 1;
      utilMap.set(key, row);
    }

    return {
      total: tasks.length,
      draft: countStatus(tasks, 'draft'),
      waitingAssignment: countStatus(tasks, 'waiting_assignment'),
      assigned: countStatus(tasks, 'assigned'),
      queued: countStatus(tasks, 'queued'),
      running: countStatus(tasks, 'running'),
      waitingApproval: countStatus(tasks, 'waiting_approval'),
      completed: countStatus(tasks, 'completed'),
      failed: countStatus(tasks, 'failed'),
      cancelled: countStatus(tasks, 'cancelled'),
      paused: countStatus(tasks, 'paused'),
      queueLength: countStatus(tasks, 'queued'),
      averageDurationMs: avg,
      totalRetries: tasks.reduce((sum, t) => sum + t.retryCount, 0),
      agentUtilization: Array.from(utilMap.values()),
      updatedAt: new Date().toISOString(),
    };
  }
}
