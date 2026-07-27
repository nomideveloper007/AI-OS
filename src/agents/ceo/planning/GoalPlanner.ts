import type { PlanningInputBundle, PlanHorizon, PlanPriority, StrategicGoal } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

/**
 * Turns business goals + health into strategic goals across horizons.
 */
export class GoalPlanner {
  private logger = PlanningLogger.getInstance();

  public plan(
    input: PlanningInputBundle,
    healthScore: number,
    aiGoals?: StrategicGoal[]
  ): StrategicGoal[] {
    if (aiGoals && aiGoals.length > 0) {
      this.logger.info(`Using ${aiGoals.length} AI strategic goals`, input.domain);
      return aiGoals.slice(0, 8).map((g, i) => ({
        id: g.id || `goal-${i + 1}`,
        title: g.title,
        description: g.description,
        horizon: this.normalizeHorizon(g.horizon),
        priority: this.normalizePriority(g.priority),
        successMetric: g.successMetric || 'Measurable KPI improvement',
        ownerEmployee: g.ownerEmployee || 'SEO Specialist Agent',
      }));
    }

    const goals: StrategicGoal[] = [];
    const baseGoals =
      input.businessGoals.length > 0
        ? input.businessGoals
        : [
            'Increase organic traffic',
            'Improve conversion readiness',
            'Reduce technical risk',
            'Ship consistent content cadence',
          ];

    const horizons: PlanHorizon[] = ['weekly', 'monthly', 'quarterly', 'daily'];
    baseGoals.slice(0, 4).forEach((title, i) => {
      goals.push({
        id: `goal-${i + 1}`,
        title,
        description: `Advance "${title}" for ${input.domain} based on current health ${healthScore}/100.`,
        horizon: horizons[i % horizons.length],
        priority: healthScore < 60 ? 'Critical' : i === 0 ? 'High' : 'Medium',
        successMetric: i === 0 ? 'Traffic/engagement uplift' : 'KPI movement vs baseline',
        ownerEmployee: i % 2 === 0 ? 'SEO Specialist Agent' : 'Growth Marketing Agent',
      });
    });

    this.logger.info(`Planned ${goals.length} strategic goals`, input.domain);
    return goals;
  }

  private normalizeHorizon(v: unknown): PlanHorizon {
    const s = String(v || 'monthly').toLowerCase();
    if (s.includes('day')) return 'daily';
    if (s.includes('week')) return 'weekly';
    if (s.includes('quart')) return 'quarterly';
    return 'monthly';
  }

  private normalizePriority(v: unknown): PlanPriority {
    const s = String(v || 'Medium').toLowerCase();
    if (s.includes('crit')) return 'Critical';
    if (s.includes('high')) return 'High';
    if (s.includes('low')) return 'Low';
    return 'Medium';
  }
}
