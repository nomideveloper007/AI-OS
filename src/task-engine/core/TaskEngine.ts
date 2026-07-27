import type { CreateTaskInput, Task } from '../types/Task';
import { TaskDispatcher } from './TaskDispatcher';
import { TaskHistory } from './TaskHistory';
import { TaskLogger } from './TaskLogger';
import { TaskEvents } from './TaskEvents';

/**
 * Task Engine facade — central nervous system for AI employee coordination.
 */
export class TaskEngine {
  private static instance: TaskEngine;
  private dispatcher = new TaskDispatcher();
  private logger = TaskLogger.getInstance();

  private constructor() {
    this.logger.info('Task Engine ready', 'TaskEngine');
  }

  public static getInstance(): TaskEngine {
    if (!TaskEngine.instance) TaskEngine.instance = new TaskEngine();
    return TaskEngine.instance;
  }

  public createTask(input: CreateTaskInput): Task {
    return this.dispatcher.createTask(input);
  }

  public async submitAndRun(input: CreateTaskInput): Promise<Task> {
    const task = this.dispatcher.createTask(input);
    await this.dispatcher.dispatchAllReady();
    return this.dispatcher.getTask(task.id) || task;
  }

  public async processQueue(): Promise<Task[]> {
    return this.dispatcher.dispatchAllReady();
  }

  public assign(taskId: string): Task {
    return this.dispatcher.assignTask(taskId);
  }

  public pause(taskId: string): Task {
    return this.dispatcher.pauseTask(taskId);
  }

  public resume(taskId: string): Task {
    return this.dispatcher.resumeTask(taskId);
  }

  public cancel(taskId: string): Task {
    return this.dispatcher.cancelTask(taskId);
  }

  public retry(taskId: string): Task {
    return this.dispatcher.retryTask(taskId);
  }

  public approve(taskId: string): Task {
    return this.dispatcher.approveTask(taskId);
  }

  public getTask(taskId: string): Task | undefined {
    return this.dispatcher.getTask(taskId);
  }

  public listTasks(): Task[] {
    return this.dispatcher.listTasks();
  }

  public getQueue(): Task[] {
    return this.dispatcher.getQueue();
  }

  public getMetrics() {
    return this.dispatcher.getMetrics();
  }

  public getMonitor() {
    return this.dispatcher.getMonitor();
  }

  public getRoutableAgents() {
    return this.dispatcher.getRouter().listRoutableAgents();
  }

  public getEvents(taskId?: string) {
    return TaskEvents.getInstance().getEvents(taskId);
  }

  public getTimeline(taskId: string) {
    const task = this.getTask(taskId);
    if (!task) return [];
    return TaskHistory.flattenTimeline(task, this.getEvents(taskId));
  }

  public getDispatcher(): TaskDispatcher {
    return this.dispatcher;
  }
}
