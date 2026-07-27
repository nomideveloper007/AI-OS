import { WorkflowStatus } from './WorkflowStatus';

export interface WorkflowExecutionRecord {
  id: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowStatus;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  retryCount: number;
  logs: string[];
}
