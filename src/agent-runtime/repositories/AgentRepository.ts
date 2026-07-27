import type { RuntimeAgent } from '../types/Agent';
import type { AgentRuntimeStatus } from '../types/AgentStatus';

const STORAGE_KEY = 'aios.agentruntime.agents';

export class AgentRepository {
  private static instance: AgentRepository;
  private agents: Map<string, RuntimeAgent> = new Map();

  private constructor() {
    this.load();
  }

  public static getInstance(): AgentRepository {
    if (!AgentRepository.instance) AgentRepository.instance = new AgentRepository();
    return AgentRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as RuntimeAgent[];
      if (!Array.isArray(list)) return;
      for (const a of list) this.agents.set(a.id, a);
    } catch {
      // ignore corrupt storage
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.listAll().slice(0, 200)));
    } catch {
      // ignore quota
    }
  }

  public save(agent: RuntimeAgent): RuntimeAgent {
    this.agents.set(agent.id, agent);
    this.persist();
    return agent;
  }

  public get(id: string): RuntimeAgent | undefined {
    return this.agents.get(id);
  }

  public delete(id: string): boolean {
    const ok = this.agents.delete(id);
    if (ok) this.persist();
    return ok;
  }

  public listAll(): RuntimeAgent[] {
    return Array.from(this.agents.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public listByStatus(status: AgentRuntimeStatus): RuntimeAgent[] {
    return this.listAll().filter((a) => a.status === status);
  }

  public clear(): void {
    this.agents.clear();
    this.persist();
  }
}
