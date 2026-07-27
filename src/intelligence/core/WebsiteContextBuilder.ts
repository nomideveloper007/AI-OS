import type { WebsiteContext } from '../types/WebsiteContext';

/**
 * Builds agent/report-ready context payloads from a WebsiteContext.
 * Still no AI — only packaging structured scanner-derived knowledge.
 */
export class WebsiteContextBuilder {
  public static forAgents(context: WebsiteContext): Record<string, unknown> {
    return {
      websiteId: context.websiteId,
      domain: context.domain,
      name: context.name,
      analyzedAt: context.analyzedAt,
      profile: context.profile,
      scores: context.scores,
      summary: context.summary,
      topInsights: context.insights.slice(0, 10),
      topRisks: context.risks.slice(0, 10),
      topOpportunities: context.opportunities.slice(0, 10),
      metrics: context.metrics,
    };
  }

  public static forCeo(context: WebsiteContext): Record<string, unknown> {
    return {
      websiteDomain: context.domain,
      healthScore: context.scores.overall,
      grade: context.scores.grade,
      summary: context.summary,
      scores: context.scores,
      criticalRisks: context.risks.filter((r) => r.severity === 'critical' || r.severity === 'high'),
      priorityActions: context.summary.priorityActions,
      scannerDerived: true,
      aiGenerated: false,
    };
  }

  public static forSeoAgent(context: WebsiteContext): Record<string, unknown> {
    return {
      domain: context.domain,
      seoScore: context.scores.seo,
      seoInsights: context.insights.filter((i) => i.category === 'seo'),
      seoRisks: context.risks.filter((r) => r.category === 'seo'),
      seoOpportunities: context.opportunities.filter((o) => o.category === 'seo_growth'),
      meta: {
        title: context.profile.metaTitle,
        description: context.profile.metaDescription,
        robots: context.profile.hasRobots,
        sitemap: context.profile.hasSitemap,
        openGraph: context.profile.hasOpenGraph,
      },
      brokenLinks: context.profile.brokenLinks,
    };
  }

  public static forContentAgent(context: WebsiteContext): Record<string, unknown> {
    return {
      domain: context.domain,
      contentScore: context.scores.content,
      contentInsights: context.insights.filter((i) => i.category === 'content'),
      contentOpportunities: context.opportunities.filter((o) => o.category === 'content_growth'),
      pageCount: context.profile.pageCount,
      description: context.profile.description,
    };
  }

  public static forGrowthAgent(context: WebsiteContext): Record<string, unknown> {
    return {
      domain: context.domain,
      opportunities: context.opportunities,
      marketing: context.opportunities.filter(
        (o) => o.category === 'marketing' || o.category === 'monetization'
      ),
      scores: context.scores,
    };
  }

  public static forMemory(context: WebsiteContext): Record<string, unknown> {
    return {
      type: 'website_intelligence',
      websiteId: context.websiteId,
      domain: context.domain,
      summary: context.summary.overview,
      health: context.scores.overall,
      snapshotId: context.snapshot.id,
      analyzedAt: context.analyzedAt,
    };
  }

  public static forReports(context: WebsiteContext): WebsiteContext {
    return context;
  }
}
