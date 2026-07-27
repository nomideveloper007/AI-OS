import { WorkflowStatus } from './WorkflowStatus';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  assignedAgent?: string;
  action: string;
  condition?: string;
  retryCount: number;
  timeout: number;
  estimatedDuration: number;
}
