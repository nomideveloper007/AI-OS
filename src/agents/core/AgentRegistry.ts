import { BaseAgent } from './BaseAgent';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private registry: Map<string, BaseAgent> = new Map();

  private constructor() {}

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  public register(agent: BaseAgent): void {
    this.registry.set(agent.id, agent);
  }

  public unregister(id: string): boolean {
    return this.registry.delete(id);
  }

  public get(id: string): BaseAgent | undefined {
    return this.registry.get(id);
  }

  public getAll(): BaseAgent[] {
    return Array.from(this.registry.values());
  }

  public clear(): void {
    this.registry.clear();
  }
}
