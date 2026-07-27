import type { Task } from '../types/Task';
import { TaskQueue } from './TaskQueue';
import { TaskValidator } from './TaskValidator';
import { TaskLogger } from './TaskLogger';

/**
 * Decides which assigned tasks may enter the queue based on dependencies & pause state.
 */
export class TaskScheduler {
  private logger = TaskLogger.getInstance();

  public scheduleReady(tasks: Task[], queue: TaskQueue): Task[] {
    const enqueued: Task[] = [];

    for (const task of tasks) {
      if (task.status !== 'assigned' && task.status !== 'queued') continue;
      if (!TaskValidator.dependenciesSatisfied(task, tasks)) {
        this.logger.info(
          `Task ${task.id} waiting on dependencies`,
          'TaskScheduler',
          task.id,
          { dependencies: task.dependencies }
        );
        continue;
      }

      if (!queue.contains(task.id) && task.status === 'assigned') {
        enqueued.push(task);
      }
    }

    return enqueued;
  }

  public nextRunnable(queue: TaskQueue, runningCount: number, maxConcurrent: number): Task | undefined {
    if (runningCount >= maxConcurrent) return undefined;
    return queue.peek();
  }
}
