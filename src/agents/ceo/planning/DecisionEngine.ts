import type { PlannedTask, StrategicPlan, StrategicPriority } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

export interface StrategicDecision {
  recommendedEmployees: string[];
  estimatedImpact: string;
  immediateActions: string[];
  longTermStrategy: string[];
  decisionNotes: string[];
}

/**
 * Chooses recommended AI employees and high-level decisions.
 * Never executes — advisory only.
 */
export class DecisionEngine {
  private logger = PlanningLogger.getInstance();

  public decide(args: {
    domain: string;
    priorities: StrategicPriority[];
    plannedTasks: PlannedTask[];
    risks: StrategicPlan['risks'];
    opportunities: StrategicPlan['opportunities'];
    ai?: Partial<StrategicDecision>;
  }): StrategicDecision {
    const fromTasks = args.plannedTasks.map((t) => t.suggestedAgent).filter(Boolean);
    const defaults = [
      'SEO Specialist Agent',
      'Growth Marketing Agent',
      'Website Auditor Agent',
    ];
    const recommendedEmployees = Array.from(
      new Set([...(args.ai?.recommendedEmployees || []), ...fromTasks, ...defaults])
    ).slice(0, 6);

    const immediateActions =
      args.ai?.immediateActions?.length
        ? args.ai.immediateActions
        : [
            ...args.priorities.slice(0, 3).map((p) => p.title),
            ...args.plannedTasks.slice(0, 2).map((t) => `Queue task: ${t.title}`),
          ].slice(0, 6);

    const longTermStrategy =
      args.ai?.longTermStrategy?.length
        ? args.ai.longTermStrategy
        : [
            'Build a repeatable SEO + content operating system',
            'Keep Core Web Vitals and security above target thresholds',
            'Use Task Engine + AI employees for execution; CEO stays in planning mode',
            'Review strategic plan monthly against completed/failed tasks',
          ];

    const estimatedImpact =
      args.ai?.estimatedImpact ||
      this.estimateImpact(args.priorities, args.opportunities);

    const decisionNotes = [
      'CEO Agent plans only — Task Engine and AI Employees execute.',
      `Top risk focus: ${args.risks[0]?.title || 'none flagged'}`,
      `Top opportunity: ${args.opportunities[0]?.title || 'none flagged'}`,
    ];

    this.logger.info(
      `Decision package ready (${recommendedEmployees.length} employees)`,
      args.domain
    );

    return {
      recommendedEmployees,
      estimatedImpact,
      immediateActions,
      longTermStrategy,
      decisionNotes,
    };
  }

  private estimateImpact(
    priorities: StrategicPriority[],
    opportunities: StrategicPlan['opportunities']
  ): string {
    const crit = priorities.filter((p) => p.priority === 'Critical' || p.priority === 'High').length;
    const growth = opportunities[0]?.potentialGrowth;
    if (crit >= 3) {
      return `High near-term impact if Critical/High priorities ship this week${growth ? `; upside ${growth}` : ''}.`;
    }
    return growth
      ? `Moderate-to-high impact over 30–90 days; headline upside ${growth}.`
      : 'Moderate impact over 30–90 days with disciplined task execution.';
  }
}
