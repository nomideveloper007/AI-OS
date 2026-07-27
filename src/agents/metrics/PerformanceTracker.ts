import { IAgentMetricsData } from '../interfaces/IAgent';

export class PerformanceTracker {
  private metricsMap: Map<string, IAgentMetricsData> = new Map();

  public trackExecution(agentId: string, durationMs: number, success: boolean): void {
    const existing = this.metricsMap.get(agentId) || {
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      totalDurationMs: 0,
      averageDurationMs: 0
    };

    existing.executionCount += 1;
    if (success) existing.successCount += 1;
    else existing.failureCount += 1;
    existing.totalDurationMs += durationMs;
    existing.averageDurationMs = Math.round(existing.totalDurationMs / existing.executionCount);
    existing.lastExecutionTime = new Date().toISOString();

    this.metricsMap.set(agentId, existing);
  }

  public getMetrics(agentId: string): IAgentMetricsData | undefined {
    return this.metricsMap.get(agentId);
  }
}
