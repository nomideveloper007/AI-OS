import type { WebsiteScanResult, WebsiteItem } from '../../types';
import type { WebsiteContext } from '../types/WebsiteContext';
import { WebsiteMetrics } from './WebsiteMetrics';
import { WebsiteScore } from './WebsiteScore';
import { WebsiteInsights } from './WebsiteInsights';
import { WebsiteRiskAnalyzer } from './WebsiteRiskAnalyzer';
import { WebsiteOpportunityAnalyzer } from './WebsiteOpportunityAnalyzer';
import { WebsiteSummary } from './WebsiteSummary';
import { WebsiteSnapshot } from './WebsiteSnapshot';
import { WebsiteLogger } from './WebsiteLogger';

/**
 * Orchestrates pure structural analysis of a scanner result.
 * Never crawls. Never calls AI.
 */
export class WebsiteAnalyzer {
  private logger = WebsiteLogger.getInstance();

  public analyze(scan: WebsiteScanResult, website?: WebsiteItem): WebsiteContext {
    this.logger.info(`Analyzing scan ${scan.id} for ${scan.domain}`, 'WebsiteAnalyzer');

    const profile = WebsiteMetrics.buildProfile(scan, website);
    const scores = WebsiteScore.compute(scan);
    const metrics = WebsiteMetrics.extract(scan, website);
    const insights = WebsiteInsights.generate(scan);
    const risks = WebsiteRiskAnalyzer.analyze(scan);
    const opportunities = WebsiteOpportunityAnalyzer.analyze(scan);
    const summary = WebsiteSummary.build(scan, scores, insights, risks, opportunities);

    const analyzedAt = new Date().toISOString();
    const contextId = `ctx-${scan.website_id}-${scan.id}`;
    const snapshotId = WebsiteSnapshot.createId(scan.website_id, scan.id);

    const context: WebsiteContext = {
      id: contextId,
      websiteId: scan.website_id,
      scanId: scan.id,
      domain: scan.domain,
      name: profile.websiteName,
      analyzedAt,
      profile,
      scores,
      summary,
      metrics,
      insights,
      risks,
      opportunities,
      snapshot: {
        id: snapshotId,
        websiteId: scan.website_id,
        scanId: scan.id,
        domain: scan.domain,
        createdAt: analyzedAt,
        scores,
        insightCount: insights.length,
        riskCount: risks.length,
        opportunityCount: opportunities.length,
        overallHealth: scores.overall,
      },
    };

    this.logger.info(
      `Analysis complete for ${scan.domain}: health=${scores.overall}, insights=${insights.length}, risks=${risks.length}`,
      'WebsiteAnalyzer',
      { contextId, scanId: scan.id }
    );

    return context;
  }
}
