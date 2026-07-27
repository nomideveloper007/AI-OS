import { WorkflowPriority } from '../types/WorkflowPriority';
import { WorkflowStatus } from '../types/WorkflowStatus';

export interface WorkflowQueueItem {
  id: string;
  workflowId: string;
  workflowName: string;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  enqueuedAt: string;
  website?: string;
}
