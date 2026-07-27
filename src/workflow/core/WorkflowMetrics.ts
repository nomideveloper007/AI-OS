import { WorkflowObject } from '../types/Workflow';

export interface WorkflowMetricsSummary {
  totalWorkflows: number;
  runningWorkflows: number;
  completedWorkflows: number;
  failedWorkflows: number;
  averageTimeMs: number;
  longestWorkflowMs: number;
  successRate: number;
}

export class WorkflowMetrics {
  public static calculateMetrics(workflows: WorkflowObject[]): WorkflowMetricsSummary {
    const total = workflows.length;
    const running = workflows.filter((w) => w.status === 'Running').length;
    const completed = workflows.filter((w) => w.status === 'Completed').length;
    const failed = workflows.filter((w) => w.status === 'Failed').length;

    let totalDuration = 0;
    let longestMs = 0;
    let totalExecutions = 0;
    let totalSuccess = 0;

    workflows.forEach((w) => {
      totalExecutions += w.executionCount;
      totalSuccess += w.successCount;
      totalDuration += w.averageDuration * w.executionCount;
      if (w.averageDuration > longestMs) longestMs = w.averageDuration;
    });

    const successRate = totalExecutions > 0 ? Math.round((totalSuccess / totalExecutions) * 100) : 100;
    const avgTime = totalExecutions > 0 ? Math.round(totalDuration / totalExecutions) : 0;

    return {
      totalWorkflows: total,
      runningWorkflows: running,
      completedWorkflows: completed,
      failedWorkflows: failed,
      averageTimeMs: avgTime,
      longestWorkflowMs: longestMs,
      successRate
    };
  }
}
