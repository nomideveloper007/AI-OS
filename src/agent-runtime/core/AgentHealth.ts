import type { RuntimeAgent } from '../types/Agent';
import type { AgentHealthSnapshot } from '../types/AgentHealthStatus';

const HEARTBEAT_STALE_MS = 12000;
const HEARTBEAT_DEAD_MS = 25000;

export class AgentHealth {
  public static evaluate(agent: RuntimeAgent, now = Date.now()): AgentHealthSnapshot {
    const lastHb = agent.lastHeartbeat ? new Date(agent.lastHeartbeat).getTime() : 0;
    const age = lastHb ? now - lastHb : undefined;

    let status: AgentHealthSnapshot['status'] = 'unknown';
    let score = 50;
    let message = 'No heartbeat yet';

    if (agent.status === 'Offline') {
      status = 'unknown';
      score = 0;
      message = 'Agent is offline';
    } else if (agent.status === 'Error') {
      status = 'unhealthy';
      score = 15;
      message = 'Agent in error state';
    } else if (agent.status === 'Recovering') {
      status = 'degraded';
      score = 40;
      message = 'Agent recovering from crash';
    } else if (age == null) {
      status = 'degraded';
      score = 45;
      message = 'Waiting for first heartbeat';
    } else if (age > HEARTBEAT_DEAD_MS || agent.missedHeartbeats >= 3) {
      status = 'unhealthy';
      score = 20;
      message = `Heartbeat stale (${Math.round(age / 1000)}s)`;
    } else if (age > HEARTBEAT_STALE_MS || agent.missedHeartbeats >= 1) {
      status = 'degraded';
      score = 60;
      message = `Heartbeat delayed (${Math.round(age / 1000)}s)`;
    } else if (agent.cpuUsage > 90 || agent.memoryUsage > 90) {
      status = 'degraded';
      score = 65;
      message = 'High resource usage';
    } else {
      status = 'healthy';
      score = 100 - Math.min(30, agent.missedHeartbeats * 10 + Math.floor(agent.cpuUsage / 10));
      message = 'Agent healthy';
    }

    return {
      status,
      score: Math.max(0, Math.min(100, score)),
      lastHeartbeatAt: agent.lastHeartbeat,
      heartbeatAgeMs: age,
      missedHeartbeats: agent.missedHeartbeats,
      crashCount: agent.crashCount,
      message,
      checkedAt: new Date(now).toISOString(),
    };
  }
}
