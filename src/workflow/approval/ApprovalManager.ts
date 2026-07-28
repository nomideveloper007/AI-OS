import { WorkflowApprovalRequest } from './ApprovalRequest';

export class ApprovalManager {
  private static instance: ApprovalManager;
  private requests: Map<string, WorkflowApprovalRequest> = new Map();

  private constructor() {
    this.seedDefaultApprovals();
  }

  public static getInstance(): ApprovalManager {
    if (!ApprovalManager.instance) {
      ApprovalManager.instance = new ApprovalManager();
    }
    return ApprovalManager.instance;
  }

  private seedDefaultApprovals(): void {
    const defaults: WorkflowApprovalRequest[] = [
      {
        id: 'appr-1',
        workflowId: 'wf-101',
        workflowName: 'Website Health Check',
        stepName: 'Execute Automated Fix',
        requester: 'Website Auditor Agent',
        reason: 'Automated HTTPS redirect header fix requires admin sign-off.',
        status: 'Pending',
        createdTime: new Date(Date.now() - 3600000 * 2).toISOString(),
        website: 'barlytics.com'
      },
      {
        id: 'appr-2',
        workflowId: 'wf-104',
        workflowName: 'Content Planning',
        stepName: 'Publish Blog Strategy',
        requester: 'Content Strategist Agent',
        reason: 'New SEO blog schedule ready for executive approval.',
        status: 'Pending',
        createdTime: new Date(Date.now() - 3600000 * 5).toISOString(),
        website: 'promptvault.online'
      }
    ];

    defaults.forEach((a) => this.requests.set(a.id, a));
  }

  public createRequest(req: WorkflowApprovalRequest): void {
    this.requests.set(req.id, req);
  }

  public getPendingRequests(): WorkflowApprovalRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === 'Pending');
  }

  public getAllRequests(): WorkflowApprovalRequest[] {
    return Array.from(this.requests.values());
  }

  public approve(id: string, approver: string = 'Administrator', comments?: string): boolean {
    const req = this.requests.get(id);
    if (req) {
      req.status = 'Approved';
      req.approver = approver;
      req.approvedTime = new Date().toISOString();
      req.comments = comments || 'Approved by admin.';
      return true;
    }
    return false;
  }

  public reject(id: string, approver: string = 'Administrator', comments?: string): boolean {
    const req = this.requests.get(id);
    if (req) {
      req.status = 'Rejected';
      req.approver = approver;
      req.rejectedTime = new Date().toISOString();
      req.comments = comments || 'Rejected by admin.';
      return true;
    }
    return false;
  }
}
