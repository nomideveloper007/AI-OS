import { IAgentTask } from '../interfaces/IAgentTask';
import { IAgentResult } from '../interfaces/IAgentResult';
import { BaseAgent } from '../core/BaseAgent';

export class QueueExecutor {
  public static async processQueue(agent: BaseAgent, tasks: IAgentTask[]): Promise<IAgentResult[]> {
    const results: IAgentResult[] = [];
    for (const task of tasks) {
      const res = await agent.execute(task);
      results.push(res);
    }
    return results;
  }
}
