import type { RuntimeAgent } from '../types/Agent';
import { AgentRepository } from '../repositories/AgentRepository';

export class AgentRegistry {
  private static instance: AgentRegistry;
  private repo = AgentRepository.getInstance();

  private constructor() {}

  public static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) AgentRegistry.instance = new AgentRegistry();
    return AgentRegistry.instance;
  }

  public register(agent: RuntimeAgent): RuntimeAgent {
    return this.repo.save(agent);
  }

  public unregister(id: string): boolean {
    return this.repo.delete(id);
  }

  public get(id: string): RuntimeAgent | undefined {
    return this.repo.get(id);
  }

  public getAll(): RuntimeAgent[] {
    return this.repo.listAll();
  }

  public update(agent: RuntimeAgent): RuntimeAgent {
    agent.updatedAt = new Date().toISOString();
    return this.repo.save(agent);
  }

  public clear(): void {
    this.repo.clear();
  }
}
