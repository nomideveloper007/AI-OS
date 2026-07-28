import { CEOExecutiveReport } from './CEOContext';
import { MemoryManager } from '../../memory/core/MemoryManager';
import { ApprovalManager } from '../../workflow/approval/ApprovalManager';

export class CEOReporter {
  private memoryManager = MemoryManager.getInstance();
  private approvalManager = ApprovalManager.getInstance();

  public async publishReport(report: CEOExecutiveReport): Promise<void> {
    const plan = report.strategicPlan;
    const goals = plan?.strategicGoals?.map((g) => g.title).join('; ') || '';
    const impact = report.estimatedImpact || plan?.estimatedImpact || '';
    const employees = (report.recommendedEmployees || plan?.recommendedEmployees || []).join(', ');

    // 1. Store Strategic Plan / Executive Report into Long-Term Memory System
    this.memoryManager.createMemoryItem({
      title: `CEO Strategic Plan (${report.website})`,
      description: report.executiveSummary.substring(0, 140) + '...',
      content: `Executive Summary: ${report.executiveSummary}\nBusiness Health: ${report.healthScores.overall}/100\nSEO: ${report.healthScores.seo}/100\nSecurity: ${report.healthScores.security}/100\nGoals: ${goals}\nTop Priorities: ${report.recommendedPriorities.join('; ')}\nEstimated Impact: ${impact}\nRecommended Employees: ${employees}\nImmediate Actions: ${(report.immediateActions || report.actionPlan).join('; ')}\nLong-term: ${(report.longTermStrategy || []).join('; ')}`,
      type: 'Project Memory',
      category: 'Reports',
      priority: 'High',
      visibility: 'Global',
      website: report.website,
      tags: ['CEO Report', 'Strategic Plan', 'Executive Summary', 'Roadmap', 'Tasks'],
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
        createdTime: new Date().toISOString(),
        website: report.website
      });
    });
  }
}
