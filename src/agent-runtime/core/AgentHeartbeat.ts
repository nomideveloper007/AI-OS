import { AgentRegistry } from './AgentRegistry';
import { AgentEvents } from './AgentEvents';
import { AgentLogger } from './AgentLogger';
import { AgentHealth } from './AgentHealth';
import { AgentLifecycle } from './AgentLifecycle';
import { RuntimeRepository } from '../repositories/RuntimeRepository';
import type { AgentHeartbeatRecord } from '../types/AgentHeartbeat';

/**
 * Emits heartbeats for online agents every few seconds.
 * Updates mock CPU / memory and health scores.
 */
export class AgentHeartbeatService {
  private static instance: AgentHeartbeatService;
  private registry = AgentRegistry.getInstance();
  private runtimeRepo = RuntimeRepository.getInstance();
  private events = AgentEvents.getInstance();
  private logger = AgentLogger.getInstance();
  private timer: ReturnType<typeof setInterval> | null = null;
  private intervalMs = 4000;

  private constructor() {}

  public static getInstance(): AgentHeartbeatService {
    if (!AgentHeartbeatService.instance) {
      AgentHeartbeatService.instance = new AgentHeartbeatService();
    }
    return AgentHeartbeatService.instance;
  }

  public start(intervalMs = 4000): void {
    this.intervalMs = intervalMs;
    if (this.timer) return;
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    this.logger.info(`Heartbeat service started (${intervalMs}ms)`, 'AgentHeartbeat');
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      this.logger.info('Heartbeat service stopped', 'AgentHeartbeat');
    }
  }

  public isRunning(): boolean {
    return this.timer != null;
  }

  public tick(): void {
    const now = new Date().toISOString();
    for (const agent of this.registry.getAll()) {
      if (!AgentLifecycle.isOnline(agent.status)) continue;

      const baseCpu = agent.status === 'Busy' ? 55 : agent.status === 'Recovering' ? 40 : 8;
      const baseMem = agent.status === 'Busy' ? 48 : 18;
      agent.cpuUsage = Math.min(99, Math.max(2, Math.round(baseCpu + Math.random() * 25)));
      agent.memoryUsage = Math.min(99, Math.max(5, Math.round(baseMem + Math.random() * 20)));
      agent.lastHeartbeat = now;
      agent.missedHeartbeats = 0;
      agent.lastActivity = now;

      const health = AgentHealth.evaluate(agent);
      agent.health = health.status;

      const record: AgentHeartbeatRecord = {
        id: `hb-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        agentId: agent.id,
        timestamp: now,
        status: agent.status,
        cpuUsage: agent.cpuUsage,
        memoryUsage: agent.memoryUsage,
        queueLength: agent.queueLength,
        healthy: health.status === 'healthy',
      };
      this.runtimeRepo.addHeartbeat(record);
      this.registry.update(agent);

      this.events.emit('agent_heartbeat', `${agent.name} heartbeat`, {
        agentId: agent.id,
        agentName: agent.name,
        metadata: { cpu: agent.cpuUsage, memory: agent.memoryUsage, health: agent.health },
      });
    }
  }
}
