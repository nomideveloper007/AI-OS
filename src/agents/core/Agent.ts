import { BaseAgent } from './BaseAgent';
import { IAgentTask } from '../interfaces/IAgentTask';
import { AgentRole } from '../types/AgentRole';
import { AgentPriority } from '../types/AgentPriority';
import { AgentCapability } from '../types/AgentCapabilities';

export class Agent extends BaseAgent {
  constructor(config: {
    id?: string;
    name: string;
    description: string;
    role: AgentRole;
    priority?: AgentPriority;
    capabilities?: AgentCapability[];
  }) {
    super(config);
  }

  protected async performTaskExecution(task: IAgentTask): Promise<any> {
    // Architecture task simulation logic
    return {
      output: `Executed ${task.title} for agent ${this.name} (${this.role}).`,
      taskId: task.id,
      timestamp: new Date().toISOString()
    };
  }
}
