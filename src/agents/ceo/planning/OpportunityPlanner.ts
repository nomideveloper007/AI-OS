import type { PlanningInputBundle, StrategicPlan } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

type Opportunity = StrategicPlan['opportunities'][number];

/**
 * Identifies biggest growth opportunities from intelligence + history.
 * Planning only — does not execute.
 */
export class OpportunityPlanner {
  private logger = PlanningLogger.getInstance();

  public plan(
    input: PlanningInputBundle,
    aiOpportunities?: Opportunity[]
  ): Opportunity[] {
    if (aiOpportunities && aiOpportunities.length > 0) {
      this.logger.info(`Using ${aiOpportunities.length} AI opportunities`, input.domain);
      return aiOpportunities.slice(0, 8).map((o, i) => ({
        id: o.id || `opp-${i + 1}`,
        title: o.title,
        potentialGrowth: o.potentialGrowth || 'Material growth potential',
        description: o.description,
        actionPlan: o.actionPlan || 'Assign to recommended AI employee via Task Engine.',
      }));
    }

    const list: Opportunity[] = [];
    const wi = input.websiteIntelligence || {};
    const scores = (wi.scores || {}) as Record<string, number>;
    const summary = (wi.summary || {}) as Record<string, unknown>;
    const actions = Array.isArray(summary.priorityActions)
      ? (summary.priorityActions as string[])
      : [];

    if ((scores.seo ?? 100) < 75) {
      list.push({
        id: 'opp-seo-content',
        title: 'SEO Content Expansion & Blog Creation',
        potentialGrowth: '+20–35% organic impressions',
        description: 'Underperforming SEO score indicates room for high-intent content and on-page fixes.',
        actionPlan: 'Create SEO tasks for titles, ALT text, FAQ, and 3 blog posts.',
      });
    }

    if ((scores.performance ?? 100) < 80) {
      list.push({
        id: 'opp-cwv',
        title: 'Improve Core Web Vitals',
        potentialGrowth: '+conversion lift via faster UX',
        description: 'Performance headroom remains — LCP/CLS improvements unlock ranking and UX gains.',
        actionPlan: 'Task Performance / Website employee to optimize critical assets.',
      });
    }

    if (!wi.hasSitemap && actions.some((a) => /sitemap/i.test(a))) {
      list.push({
        id: 'opp-sitemap',
        title: 'Optimize Sitemap Coverage',
        potentialGrowth: 'Better crawl efficiency',
        description: 'Sitemap gaps reduce discoverability of key pages.',
        actionPlan: 'Publish/refresh XML sitemap and submit via Search Console workflow.',
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'opp-faq',
        title: 'Create FAQ page',
        potentialGrowth: 'Long-tail traffic + support deflection',
        description: 'FAQ content captures intent queries and builds trust.',
        actionPlan: 'Task Content/SEO employee to draft FAQ with schema markup.',
      });
    }

    this.logger.info(`Derived ${list.length} opportunities from context`, input.domain);
    return list.slice(0, 6);
  }
}
