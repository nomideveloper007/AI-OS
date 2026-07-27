import type { Task } from '../types/Task';
import { TASK_PRIORITY_WEIGHT } from '../types/TaskPriority';

/**
 * In-memory priority queue for tasks ready to run.
 * Critical > High > Medium > Low > Support; FIFO within same priority.
 */
export class TaskQueue {
  private items: Task[] = [];

  public enqueue(task: Task): void {
    this.items = this.items.filter((t) => t.id !== task.id);
    this.items.push(task);
    this.sort();
  }

  public dequeue(): Task | undefined {
    this.sort();
    return this.items.shift();
  }

  public peek(): Task | undefined {
    this.sort();
    return this.items[0];
  }

  public remove(taskId: string): boolean {
    const before = this.items.length;
    this.items = this.items.filter((t) => t.id !== taskId);
    return this.items.length < before;
  }

  public contains(taskId: string): boolean {
    return this.items.some((t) => t.id === taskId);
  }

  public list(): Task[] {
    this.sort();
    return [...this.items];
  }

  public length(): number {
    return this.items.length;
  }

  public clear(): void {
    this.items = [];
  }

  public rebalance(tasks: Task[]): void {
    this.items = tasks.filter((t) => t.status === 'queued');
    this.sort();
  }

  private sort(): void {
    this.items.sort((a, b) => {
      const pw = TASK_PRIORITY_WEIGHT[b.priority] - TASK_PRIORITY_WEIGHT[a.priority];
      if (pw !== 0) return pw;
      return new Date(a.queuedAt || a.createdAt).getTime() - new Date(b.queuedAt || b.createdAt).getTime();
    });
  }
}
