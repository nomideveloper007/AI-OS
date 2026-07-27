import { Agent } from './Agent';
import { BaseAgent } from './BaseAgent';
import { AgentRole } from '../types/AgentRole';
import { AgentPriority } from '../types/AgentPriority';
import { AgentCapability } from '../types/AgentCapabilities';

export interface AgentBlueprint {
  name: string;
  description: string;
  role: AgentRole;
  priority?: AgentPriority;
  capabilities?: AgentCapability[];
}

export class AgentFactory {
  public static createAgent(blueprint: AgentBlueprint): BaseAgent {
    return new Agent({
      name: blueprint.name,
      description: blueprint.description,
      role: blueprint.role,
      priority: blueprint.priority || 'Medium',
      capabilities: blueprint.capabilities || ['Analyze Data', 'Read Reports']
    });
  }
}
