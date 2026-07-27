import type { WebsiteContext, WebsiteSnapshotData } from '../types/WebsiteContext';

export class WebsiteSnapshot {
  public static fromContext(context: WebsiteContext): WebsiteSnapshotData {
    return {
      id: context.snapshot.id || `snap-${Date.now()}`,
      websiteId: context.websiteId,
      scanId: context.scanId,
      domain: context.domain,
      createdAt: context.analyzedAt,
      scores: { ...context.scores },
      insightCount: context.insights.length,
      riskCount: context.risks.length,
      opportunityCount: context.opportunities.length,
      overallHealth: context.scores.overall,
    };
  }

  public static createId(websiteId: string, scanId: string): string {
    return `snap-${websiteId}-${scanId}`;
  }
}
