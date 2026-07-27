import { AgentRegistry } from './AgentRegistry';
import { AgentLifecycle } from './AgentLifecycle';
import { AgentHealth } from './AgentHealth';
import { AgentEvents } from './AgentEvents';
import { AgentLogger } from './AgentLogger';

type RecoverFn = (agentId: string) => Promise<void>;

/**
 * Crash detection + auto-recovery supervisor.
 */
export class AgentSupervisor {
  private static instance: AgentSupervisor;
  private registry = AgentRegistry.getInstance();
  private events = AgentEvents.getInstance();
  private logger = AgentLogger.getInstance();
  private timer: ReturnType<typeof setInterval> | null = null;
  private recoverFn: RecoverFn | null = null;
  private recovering = new Set<string>();

  private constructor() {}

  public static getInstance(): AgentSupervisor {
    if (!AgentSupervisor.instance) AgentSupervisor.instance = new AgentSupervisor();
    return AgentSupervisor.instance;
  }

  public setRecoverHandler(fn: RecoverFn): void {
    this.recoverFn = fn;
  }

  public start(intervalMs = 6000): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.inspect(), intervalMs);
    this.logger.info('Supervisor started', 'AgentSupervisor');
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public inspect(): void {
    for (const agent of this.registry.getAll()) {
      if (!AgentLifecycle.isOnline(agent.status)) continue;

      const health = AgentHealth.evaluate(agent);
      agent.health = health.status;

      if (health.status === 'unhealthy' && agent.status !== 'Recovering' && agent.status !== 'Error') {
        agent.missedHeartbeats += 1;
        agent.crashCount += 1;
        agent.status = 'Error';
        agent.updatedAt = new Date().toISOString();
        this.registry.update(agent);

        this.events.emit('agent_crash', `${agent.name} crash detected: ${health.message}`, {
          agentId: agent.id,
          agentName: agent.name,
          metadata: { health },
        });
        this.logger.error(`${agent.name} unhealthy — ${health.message}`, 'AgentSupervisor', {
          agentId: agent.id,
        });

        if (agent.autoRecover && this.recoverFn && !this.recovering.has(agent.id)) {
          void this.autoRecover(agent.id);
        }
      } else {
        this.registry.update(agent);
      }
    }
  }

  private async autoRecover(agentId: string): Promise<void> {
    this.recovering.add(agentId);
    const agent = this.registry.get(agentId);
    if (!agent || !this.recoverFn) {
      this.recovering.delete(agentId);
      return;
    }

    try {
      AgentLifecycle.assertTransition(agent.status, 'Recovering');
      agent.status = 'Recovering';
      agent.updatedAt = new Date().toISOString();
      this.registry.update(agent);
      this.events.emit('agent_recovering', `${agent.name} auto-recovering`, {
        agentId: agent.id,
        agentName: agent.name,
      });
      await this.recoverFn(agentId);
    } catch (err) {
      this.logger.error(
        `Recovery failed: ${err instanceof Error ? err.message : String(err)}`,
        'AgentSupervisor',
        { agentId }
      );
    } finally {
      this.recovering.delete(agentId);
    }
  }
}
