import { BaseAgent } from '../core/BaseAgent';

export class AgentValidator {
  public static validateAgent(agent: BaseAgent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!agent.id) errors.push('Agent missing unique ID');
    if (!agent.name || agent.name.trim().length === 0) errors.push('Agent missing name');
    if (!agent.role) errors.push('Agent missing assigned role');
    if (!agent.capabilities || agent.capabilities.length === 0) errors.push('Agent requires at least 1 capability');

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
