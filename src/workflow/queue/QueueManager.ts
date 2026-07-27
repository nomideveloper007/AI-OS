import { WorkflowQueue } from './WorkflowQueue';
import { WorkflowQueueItem } from './QueueItem';

export class QueueManager {
  private static instance: QueueManager;
  private priorityQueue = new WorkflowQueue();
  private fifoQueue = new WorkflowQueue();

  private constructor() {
    this.seedDefaultQueue();
  }

  public static getInstance(): QueueManager {
    if (!QueueManager.instance) {
      QueueManager.instance = new QueueManager();
    }
    return QueueManager.instance;
  }

  private seedDefaultQueue(): void {
    const items: WorkflowQueueItem[] = [
      {
        id: 'q-1',
        workflowId: 'wf-101',
        workflowName: 'Website Health Check',
        priority: 'High',
        status: 'Waiting Approval',
        enqueuedAt: new Date(Date.now() - 1800000).toISOString(),
        website: 'tasktomoney.com'
      },
      {
        id: 'q-2',
        workflowId: 'wf-102',
        workflowName: 'Daily SEO Review',
        priority: 'Medium',
        status: 'Ready',
        enqueuedAt: new Date(Date.now() - 3600000).toISOString(),
        website: 'ai-os.io'
      }
    ];

    items.forEach((item) => this.priorityQueue.enqueue(item));
  }

  public getQueue(): WorkflowQueueItem[] {
    return this.priorityQueue.getItems();
  }

  public addToQueue(item: WorkflowQueueItem): void {
    this.priorityQueue.enqueue(item);
  }

  public removeFromQueue(id: string): boolean {
    return this.priorityQueue.remove(id);
  }
}
