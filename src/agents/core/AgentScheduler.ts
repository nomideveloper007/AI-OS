import { IAgentTask } from '../interfaces/IAgentTask';

export class AgentScheduler {
  private queue: IAgentTask[] = [];

  public scheduleTask(task: IAgentTask): void {
    this.queue.push(task);
  }

  public getNextTask(): IAgentTask | undefined {
    return this.queue.shift();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }
}
