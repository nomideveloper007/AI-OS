import { BaseAgent } from './BaseAgent';
import { IAgentTask } from '../interfaces/IAgentTask';
import { IAgentResult } from '../interfaces/IAgentResult';

export class AgentRunner {
  public static async runTask(agent: BaseAgent, task: IAgentTask): Promise<IAgentResult> {
    return agent.execute(task);
  }
}
