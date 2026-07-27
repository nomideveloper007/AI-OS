import type { PlanPriority, StrategicGoal, StrategicPriority, StrategicPlan } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

/**
 * Ranks improvements by business impact. Planning only.
 */
export class PriorityEngine {
  private logger = PlanningLogger.getInstance();

  private weight(p: PlanPriority): number {
    if (p === 'Critical') return 100;
    if (p === 'High') return 80;
    if (p === 'Medium') return 50;
    return 25;
  }

  public buildPriorities(args: {
    domain: string;
    goals: StrategicGoal[];
    risks: StrategicPlan['risks'];
    opportunities: StrategicPlan['opportunities'];
    aiPriorities?: StrategicPriority[];
  }): StrategicPriority[] {
    if (args.aiPriorities && args.aiPriorities.length > 0) {
      const sorted = [...args.aiPriorities]
        .map((p, i) => ({
          ...p,
          id: p.id || `pri-${i + 1}`,
          rank: p.rank || i + 1,
          priority: p.priority || 'Medium',
          relatedGoalIds: p.relatedGoalIds || [],
        }))
        .sort((a, b) => a.rank - b.rank || this.weight(b.priority) - this.weight(a.priority));
      this.logger.info(`Using ${sorted.length} AI priorities`, args.domain);
      return sorted.slice(0, 10).map((p, i) => ({ ...p, rank: i + 1 }));
    }

    const out: StrategicPriority[] = [];
    let rank = 1;

    for (const r of args.risks.slice(0, 4)) {
      out.push({
        id: `pri-risk-${r.id}`,
        rank: rank++,
        title: `Mitigate: ${r.title}`,
        rationale: r.description,
        priority: r.severity,
        estimatedImpact: 'Protects revenue, trust, and continuity',
        relatedGoalIds: args.goals.filter((g) => g.priority === r.severity).map((g) => g.id).slice(0, 2),
      });
    }

    for (const o of args.opportunities.slice(0, 4)) {
      out.push({
        id: `pri-opp-${o.id}`,
        rank: rank++,
        title: `Capture: ${o.title}`,
        rationale: o.description,
        priority: rank <= 3 ? 'High' : 'Medium',
        estimatedImpact: o.potentialGrowth,
        relatedGoalIds: args.goals.slice(0, 2).map((g) => g.id),
      });
    }

    out.sort((a, b) => this.weight(b.priority) - this.weight(a.priority));
    const ranked = out.slice(0, 8).map((p, i) => ({ ...p, rank: i + 1 }));
    this.logger.info(`Built ${ranked.length} strategic priorities`, args.domain);
    return ranked;
  }
}
