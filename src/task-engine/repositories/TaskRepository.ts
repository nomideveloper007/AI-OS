import type { Task } from '../types/Task';
import { TASK_PRIORITY_WEIGHT } from '../types/TaskPriority';

const STORAGE_KEY = 'aios.taskengine.tasks';

export class TaskRepository {
  private static instance: TaskRepository;
  private tasks: Map<string, Task> = new Map();

  private constructor() {
    this.load();
  }

  public static getInstance(): TaskRepository {
    if (!TaskRepository.instance) TaskRepository.instance = new TaskRepository();
    return TaskRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as Task[];
      if (!Array.isArray(list)) return;
      for (const t of list) this.tasks.set(t.id, t);
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.listAll().slice(0, 300)));
    } catch {
      // ignore
    }
  }

  public save(task: Task): Task {
    this.tasks.set(task.id, task);
    this.persist();
    return task;
  }

  public get(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public delete(id: string): boolean {
    const ok = this.tasks.delete(id);
    if (ok) this.persist();
    return ok;
  }

  public listAll(): Task[] {
    return Array.from(this.tasks.values()).sort((a, b) => {
      const pw = TASK_PRIORITY_WEIGHT[b.priority] - TASK_PRIORITY_WEIGHT[a.priority];
      if (pw !== 0) return pw;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }

  public listByStatus(status: Task['status']): Task[] {
    return this.listAll().filter((t) => t.status === status);
  }

  public clear(): void {
    this.tasks.clear();
    this.persist();
  }
}
