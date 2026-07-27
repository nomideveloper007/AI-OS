import type { TaskExecutionRecord } from '../types/Task';

const STORAGE_KEY = 'aios.taskengine.executions';

export class ExecutionRepository {
  private static instance: ExecutionRepository;
  private executions: TaskExecutionRecord[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): ExecutionRepository {
    if (!ExecutionRepository.instance) ExecutionRepository.instance = new ExecutionRepository();
    return ExecutionRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) this.executions = parsed;
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.executions.slice(0, 500)));
    } catch {
      // ignore
    }
  }

  public save(execution: TaskExecutionRecord): void {
    this.executions = [execution, ...this.executions.filter((e) => e.id !== execution.id)].slice(0, 500);
    this.persist();
  }

  public listForTask(taskId: string): TaskExecutionRecord[] {
    return this.executions.filter((e) => e.taskId === taskId);
  }

  public listAll(): TaskExecutionRecord[] {
    return [...this.executions];
  }

  public clear(): void {
    this.executions = [];
    this.persist();
  }
}
