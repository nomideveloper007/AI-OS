import { IAgentTask } from '../interfaces/IAgentTask';
import { IAgentResult } from '../interfaces/IAgentResult';
import { BaseAgent } from '../core/BaseAgent';

export class TaskExecutor {
  public static async executeSingle(agent: BaseAgent, task: IAgentTask): Promise<IAgentResult> {
    return agent.execute(task);
  }
}
