import type { Task } from '../types/Task';
import { TaskMetrics, type TaskEngineMetricsSnapshot } from './TaskMetrics';
import { TaskEvents, type TaskEvent } from './TaskEvents';
import { TaskLogger } from './TaskLogger';

/**
 * Observability facade for running/queued/failed tasks and agent utilization.
 */
export class TaskMonitor {
  private events = TaskEvents.getInstance();
  private logger = TaskLogger.getInstance();

  public snapshot(tasks: Task[]): TaskEngineMetricsSnapshot {
    return TaskMetrics.compute(tasks);
  }

  public running(tasks: Task[]): Task[] {
    return tasks.filter((t) => t.status === 'running');
  }

  public queued(tasks: Task[]): Task[] {
    return tasks.filter((t) => t.status === 'queued');
  }

  public failed(tasks: Task[]): Task[] {
    return tasks.filter((t) => t.status === 'failed');
  }

  public completed(tasks: Task[]): Task[] {
    return tasks.filter((t) => t.status === 'completed');
  }

  public recentEvents(limit = 50): TaskEvent[] {
    return this.events.getEvents().slice(0, limit);
  }

  public health(tasks: Task[]): {
    ok: boolean;
    running: number;
    failed: number;
    queueLength: number;
    message: string;
  } {
    const metrics = this.snapshot(tasks);
    const ok = metrics.failed < Math.max(3, metrics.total * 0.5);
    return {
      ok,
      running: metrics.running,
      failed: metrics.failed,
      queueLength: metrics.queueLength,
      message: ok
        ? `Task engine healthy · ${metrics.running} running · ${metrics.queueLength} queued`
        : `Elevated failures detected (${metrics.failed})`,
    };
  }

  public logStatus(tasks: Task[]): void {
    const h = this.health(tasks);
    this.logger.info(h.message, 'TaskMonitor');
  }
}
