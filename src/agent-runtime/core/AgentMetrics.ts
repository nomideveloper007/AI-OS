import type { RuntimeAgent } from '../types/Agent';
import type { AgentExecution } from '../types/AgentExecution';

export interface AgentRuntimeMetricsSnapshot {
  totalAgents: number;
  online: number;
  offline: number;
  running: number;
  idle: number;
  paused: number;
  error: number;
  recovering: number;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageDurationMs: number;
  agentUtilization: Array<{
    agentId: string;
    agentName: string;
    status: string;
    completed: number;
    failed: number;
    queueLength: number;
    utilizationPct: number;
  }>;
  recentExecutions: number;
  updatedAt: string;
}

export class AgentMetrics {
  public static compute(
    agents: RuntimeAgent[],
    executions: AgentExecution[]
  ): AgentRuntimeMetricsSnapshot {
    const completed = agents.reduce((s, a) => s + a.tasksCompleted, 0);
    const failed = agents.reduce((s, a) => s + a.tasksFailed, 0);
    const totalDone = completed + failed;
    const durations = agents.filter((a) => a.averageExecutionTimeMs > 0);
    const avg =
      durations.length === 0
        ? 0
        : Math.round(
            durations.reduce((s, a) => s + a.averageExecutionTimeMs, 0) / durations.length
          );

    return {
      totalAgents: agents.length,
      online: agents.filter((a) => a.status !== 'Offline').length,
      offline: agents.filter((a) => a.status === 'Offline').length,
      running: agents.filter((a) => a.status === 'Busy' || a.status === 'Starting').length,
      idle: agents.filter((a) => a.status === 'Idle').length,
      paused: agents.filter((a) => a.status === 'Paused').length,
      error: agents.filter((a) => a.status === 'Error').length,
      recovering: agents.filter((a) => a.status === 'Recovering').length,
      completedTasks: completed,
      failedTasks: failed,
      successRate: totalDone === 0 ? 100 : Math.round((completed / totalDone) * 1000) / 10,
      averageDurationMs: avg,
      agentUtilization: agents.map((a) => {
        const done = a.tasksCompleted + a.tasksFailed;
        const util =
          a.status === 'Busy'
            ? 100
            : a.status === 'Idle'
              ? Math.min(40, a.queueLength * 20)
              : a.status === 'Offline'
                ? 0
                : 55;
        return {
          agentId: a.id,
          agentName: a.name,
          status: a.status,
          completed: a.tasksCompleted,
          failed: a.tasksFailed,
          queueLength: a.queueLength,
          utilizationPct: done === 0 && a.status !== 'Busy' ? util : Math.max(util, Math.min(100, Math.round((a.tasksCompleted / Math.max(done, 1)) * 100))),
        };
      }),
      recentExecutions: executions.length,
      updatedAt: new Date().toISOString(),
    };
  }
}
