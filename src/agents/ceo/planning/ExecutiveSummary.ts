import type { BusinessHealthResult } from './BusinessAnalyzer';
import type { StrategicDecision } from './DecisionEngine';
import type { PlanningInputBundle, StrategicGoal, StrategicPriority } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

/**
 * Composes the executive summary narrative for dashboards and memory.
 */
export class ExecutiveSummaryBuilder {
  private logger = PlanningLogger.getInstance();

  public build(args: {
    input: PlanningInputBundle;
    health: BusinessHealthResult;
    goals: StrategicGoal[];
    priorities: StrategicPriority[];
    decision: StrategicDecision;
    aiSummary?: string;
  }): string {
    if (args.aiSummary && args.aiSummary.trim().length > 40) {
      this.logger.info('Using AI executive summary', args.input.domain);
      return args.aiSummary.trim();
    }

    const top = args.priorities
      .slice(0, 3)
      .map((p, i) => `${i + 1}. ${p.title}`)
      .join(' ');
    const goals = args.goals
      .slice(0, 2)
      .map((g) => g.title)
      .join('; ');

    const summary = [
      `Executive strategic plan for ${args.input.domain}: business health scores ${args.health.businessHealthScore}/100.`,
      args.health.strengths[0] ? `Strength: ${args.health.strengths[0]}` : '',
      args.health.weaknesses[0] ? `Gap: ${args.health.weaknesses[0]}` : '',
      goals ? `Strategic goals emphasize ${goals}.` : '',
      top ? `Immediate priorities: ${top}` : '',
      `Estimated impact: ${args.decision.estimatedImpact}`,
      'CEO remains in planning mode; Task Engine and AI Employees own execution.',
    ]
      .filter(Boolean)
      .join(' ');

    this.logger.info('Composed deterministic executive summary', args.input.domain);
    return summary;
  }
}

/** Alias matching required module name ExecutiveSummary.ts */
export { ExecutiveSummaryBuilder as ExecutiveSummary };
