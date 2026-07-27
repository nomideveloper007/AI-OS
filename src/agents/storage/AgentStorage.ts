import { BaseAgent } from '../core/BaseAgent';

export class AgentStorage {
  private static instance: AgentStorage;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): AgentStorage {
    if (!AgentStorage.instance) {
      AgentStorage.instance = new AgentStorage();
    }
    return AgentStorage.instance;
  }

  public saveAgentState(agent: BaseAgent): void {
    this.cache.set(agent.id, agent.report());
  }

  public getAgentState(id: string): any {
    return this.cache.get(id);
  }
}
