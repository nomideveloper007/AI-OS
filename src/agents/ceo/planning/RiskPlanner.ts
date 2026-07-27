import type { PlanningInputBundle, PlanPriority, StrategicPlan } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

type Risk = StrategicPlan['risks'][number];

/**
 * Identifies biggest business/technical risks. Planning only.
 */
export class RiskPlanner {
  private logger = PlanningLogger.getInstance();

  public plan(input: PlanningInputBundle, aiRisks?: Risk[]): Risk[] {
    if (aiRisks && aiRisks.length > 0) {
      this.logger.info(`Using ${aiRisks.length} AI risks`, input.domain);
      return aiRisks.slice(0, 8).map((r, i) => ({
        id: r.id || `risk-${i + 1}`,
        title: r.title,
        severity: this.normalizeSeverity(r.severity),
        description: r.description,
        mitigation: r.mitigation || 'Create prioritized Task Engine work item.',
      }));
    }

    const list: Risk[] = [];
    const wi = input.websiteIntelligence || {};
    const scores = (wi.scores || {}) as Record<string, number>;
    const critical = Array.isArray(wi.criticalRisks) ? (wi.criticalRisks as Array<Record<string, unknown>>) : [];

    for (const [i, c] of critical.slice(0, 4).entries()) {
      list.push({
        id: `risk-wi-${i + 1}`,
        title: String(c.title || c.name || 'Intelligence risk'),
        severity: this.normalizeSeverity(c.severity || c.level || 'High'),
        description: String(c.description || c.detail || 'Flagged by Website Intelligence.'),
        mitigation: String(c.mitigation || 'Mitigate via structured employee task.'),
      });
    }

    if ((scores.security ?? 100) < 70) {
      list.push({
        id: 'risk-security',
        title: 'Security posture below target',
        severity: 'Critical',
        description: 'Security score indicates elevated exposure risk for brand trust and uptime.',
        mitigation: 'Prioritize security hardening tasks for Security employee.',
      });
    }

    if (input.failedTasks.length >= 2) {
      list.push({
        id: 'risk-execution',
        title: 'Repeated task execution failures',
        severity: 'High',
        description: `${input.failedTasks.length} failed tasks may block roadmap delivery.`,
        mitigation: 'Re-plan failed work with clearer scope and agent assignment.',
      });
    }

    if (list.length === 0) {
      list.push({
        id: 'risk-seo-drift',
        title: 'Organic visibility drift',
        severity: 'Medium',
        description: 'Without continuous SEO hygiene, rankings and CTR can quietly erode.',
        mitigation: 'Weekly SEO audit task + content cadence.',
      });
    }

    this.logger.info(`Derived ${list.length} risks from context`, input.domain);
    return list.slice(0, 6);
  }

  private normalizeSeverity(v: unknown): PlanPriority {
    const s = String(v || 'Medium').toLowerCase();
    if (s.includes('crit')) return 'Critical';
    if (s.includes('high')) return 'High';
    if (s.includes('low')) return 'Low';
    return 'Medium';
  }
}
