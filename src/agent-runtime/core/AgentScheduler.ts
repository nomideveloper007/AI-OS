import { AgentRegistry } from './AgentRegistry';
import { AgentExecutor } from './AgentExecutor';
import { AgentEvents } from './AgentEvents';
import { AgentLogger } from './AgentLogger';
import { AgentLifecycle } from './AgentLifecycle';
import type { RuntimeTaskInput } from '../types/AgentExecution';

type PendingItem = { agentId: string; input: RuntimeTaskInput };

/**
 * Schedules pending executions onto idle runtime agents.
 */
export class AgentScheduler {
  private registry = AgentRegistry.getInstance();
  private executor = new AgentExecutor();
  private events = AgentEvents.getInstance();
  private logger = AgentLogger.getInstance();
  private pending: PendingItem[] = [];
  private running = new Set<string>();

  public enqueue(input: RuntimeTaskInput, preferredAgentId?: string): string {
    const agentId = preferredAgentId || input.agentId || this.pickIdleAgent()?.id;
    if (!agentId) {
      throw new Error('No runtime agent available to accept work');
    }

    const agent = this.registry.get(agentId);
    if (!agent) throw new Error(`Agent ${agentId} not found`);

    agent.queueLength += 1;
    if (agent.status === 'Idle') {
      AgentLifecycle.assertTransition('Idle', 'Waiting');
      agent.status = 'Waiting';
    }
    agent.lastActivity = new Date().toISOString();
    this.registry.update(agent);

    const pendingId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    this.pending.push({ agentId, input: { ...input, agentId } });

    this.events.emit('execution_queued', `Queued: ${input.title}`, {
      agentId,
      agentName: agent.name,
      taskId: input.taskId,
      metadata: { pendingId },
    });
    this.logger.info(`Queued task ${input.taskId} for ${agent.name}`, 'AgentScheduler', { agentId });

    return pendingId;
  }

  public listPending(): PendingItem[] {
    return [...this.pending];
  }

  public async dispatchNext(): Promise<boolean> {
    if (this.pending.length === 0) return false;

    const idx = this.pending.findIndex((p) => !this.running.has(p.agentId));
    if (idx < 0) return false;

    const item = this.pending.splice(idx, 1)[0];
    const agent = this.registry.get(item.agentId);
    if (!agent || agent.status === 'Paused' || agent.status === 'Offline') {
      this.logger.warn('Skipping dispatch — agent unavailable', 'AgentScheduler', {
        agentId: item.agentId,
      });
      return true;
    }

    this.running.add(item.agentId);
    try {
      await this.executor.execute(item.agentId, item.input);
    } catch {
      // recorded in executor
    } finally {
      this.running.delete(item.agentId);
    }
    return true;
  }

  public async dispatchAll(): Promise<number> {
    let count = 0;
    const max = 20;
    while (this.pending.length > 0 && count < max) {
      const ok = await this.dispatchNext();
      if (!ok) break;
      count += 1;
    }
    return count;
  }

  public async runNow(input: RuntimeTaskInput, agentId?: string) {
    const target = agentId || input.agentId || this.pickIdleAgent()?.id;
    if (!target) throw new Error('No available runtime agent');
    const agent = this.registry.get(target);
    if (!agent) throw new Error(`Agent ${target} not found`);

    if (agent.status === 'Offline' || agent.status === 'Error' || agent.status === 'Completed') {
      agent.status = 'Idle';
      agent.health = 'healthy';
      agent.missedHeartbeats = 0;
      agent.lastHeartbeat = new Date().toISOString();
    }
    if (agent.status === 'Paused') {
      throw new Error(`Agent ${agent.name} is paused`);
    }

    agent.queueLength += 1;
    this.registry.update(agent);
    return this.executor.execute(target, { ...input, agentId: target });
  }

  public pickIdleAgent() {
    return (
      this.registry.getAll().find((a) => a.status === 'Idle') ||
      this.registry.getAll().find((a) => a.status === 'Waiting') ||
      this.registry.getAll().find((a) => AgentLifecycle.isOnline(a.status))
    );
  }
}
