import { CEOExecutiveReport } from './CEOContext';
import { MemoryManager } from '../../memory/core/MemoryManager';
import { ApprovalManager } from '../../workflow/approval/ApprovalManager';

export class CEOReporter {
  private memoryManager = MemoryManager.getInstance();
  private approvalManager = ApprovalManager.getInstance();

  public async publishReport(report: CEOExecutiveReport): Promise<void> {
    // 1. Store Executive Report into Long-Term Memory System
    this.memoryManager.createMemoryItem({
      title: `CEO Executive Audit Report (${report.website})`,
      description: report.executiveSummary.substring(0, 140) + '...',
      content: `Executive Summary: ${report.executiveSummary}\nOverall Health Score: ${report.healthScores.overall}/100\nSEO Score: ${report.healthScores.seo}/100\nSecurity Score: ${report.healthScores.security}/100\nTop Priorities: ${report.recommendedPriorities.join('; ')}`,
      type: 'Project Memory',
      category: 'Reports',
      priority: 'High',
      visibility: 'Global',
      website: report.website,
      tags: ['CEO Report', 'Executive Audit', 'Health Score', 'Tasks'],
      source: 'CEO Executive Agent'
    });

    // 2. Submit Task Recommendations to Approval Queue
    report.tasks.forEach((t) => {
      this.approvalManager.createRequest({
        id: `appr-ceo-${t.id}`,
        workflowId: 'wf-ceo-planning',
        workflowName: 'CEO Task Recommendation Approval',
        stepName: t.title,
        requester: 'CEO Agent',
        reason: `[${t.category} - ${t.priority} Priority] ${t.reason}`,
        status: 'Pending',
        createdTime: new Date().toISOString()
      });
    });
  }
}
