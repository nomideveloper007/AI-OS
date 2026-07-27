import type { Task } from '../types/Task';

const STORAGE_KEY = 'aios.taskengine.queue';

/** Persists queued task IDs for reload resilience. */
export class QueueRepository {
  private static instance: QueueRepository;

  private constructor() {}

  public static getInstance(): QueueRepository {
    if (!QueueRepository.instance) QueueRepository.instance = new QueueRepository();
    return QueueRepository.instance;
  }

  public saveQueueIds(taskIds: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(taskIds));
    } catch {
      // ignore
    }
  }

  public loadQueueIds(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public syncFromTasks(tasks: Task[]): void {
    this.saveQueueIds(tasks.filter((t) => t.status === 'queued').map((t) => t.id));
  }
}
