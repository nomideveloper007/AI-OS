import { ApprovalStatus } from './ApprovalStatus';

export interface WorkflowApprovalRequest {
  id: string;
  workflowId: string;
  workflowName: string;
  stepName: string;
  requester: string;
  approver?: string;
  reason: string;
  status: ApprovalStatus;
  createdTime: string;
  approvedTime?: string;
  rejectedTime?: string;
  comments?: string;
  website?: string;
}
