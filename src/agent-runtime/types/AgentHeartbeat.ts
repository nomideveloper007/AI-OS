export interface AgentHeartbeatRecord {
  id: string;
  agentId: string;
  timestamp: string;
  status: string;
  cpuUsage: number;
  memoryUsage: number;
  queueLength: number;
  healthy: boolean;
}
