export type AgentHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface AgentHealthSnapshot {
  status: AgentHealthStatus;
  score: number; // 0–100
  lastHeartbeatAt?: string;
  heartbeatAgeMs?: number;
  missedHeartbeats: number;
  crashCount: number;
  message: string;
  checkedAt: string;
}
