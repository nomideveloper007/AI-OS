import { WorkflowStatus } from './WorkflowStatus';
import { WorkflowPriority } from './WorkflowPriority';
import { WorkflowTrigger } from './WorkflowTrigger';
import { WorkflowStep } from './WorkflowStep';

export interface WorkflowObject {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: WorkflowPriority;
  status: WorkflowStatus;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  conditions: string[];
  actions: string[];
  assignedAgent?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
}
