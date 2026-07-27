import { IAgentMetricsData } from '../interfaces/IAgent';

export class AgentMetrics {
  public static calculateSuccessRate(metrics: IAgentMetricsData): number {
    if (metrics.executionCount === 0) return 100;
    return Math.round((metrics.successCount / metrics.executionCount) * 100);
  }
}
