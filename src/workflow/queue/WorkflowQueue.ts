import { WorkflowQueueItem } from './QueueItem';

export class WorkflowQueue {
  private queue: WorkflowQueueItem[] = [];

  public enqueue(item: WorkflowQueueItem): void {
    this.queue.push(item);
  }

  public dequeue(): WorkflowQueueItem | undefined {
    return this.queue.shift();
  }

  public remove(id: string): boolean {
    const idx = this.queue.findIndex((i) => i.id === id || i.workflowId === id);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  public getItems(): WorkflowQueueItem[] {
    return [...this.queue];
  }

  public clear(): void {
    this.queue = [];
  }
}
