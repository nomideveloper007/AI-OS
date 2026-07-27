import type { PlanHorizon, PlanPriority, RoadmapItem, StrategicGoal, StrategicPriority } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

/**
 * Generates quarterly / monthly / weekly / daily roadmaps.
 */
export class RoadmapGenerator {
  private logger = PlanningLogger.getInstance();

  public generate(args: {
    domain: string;
    goals: StrategicGoal[];
    priorities: StrategicPriority[];
    plannedTaskTitles: string[];
    aiRoadmap?: {
      daily?: RoadmapItem[];
      weekly?: RoadmapItem[];
      monthly?: RoadmapItem[];
      quarterly?: RoadmapItem[];
    };
  }): {
    daily: RoadmapItem[];
    weekly: RoadmapItem[];
    monthly: RoadmapItem[];
    quarterly: RoadmapItem[];
  } {
    if (args.aiRoadmap && (args.aiRoadmap.weekly?.length || args.aiRoadmap.monthly?.length)) {
      this.logger.info('Using AI roadmap structure', args.domain);
      return {
        daily: this.ensure(args.aiRoadmap.daily, 'daily', args),
        weekly: this.ensure(args.aiRoadmap.weekly, 'weekly', args),
        monthly: this.ensure(args.aiRoadmap.monthly, 'monthly', args),
        quarterly: this.ensure(args.aiRoadmap.quarterly, 'quarterly', args),
      };
    }

    const top = args.priorities.slice(0, 5).map((p) => p.title);
    const tasks = args.plannedTaskTitles.slice(0, 6);
    const goalTitles = args.goals.map((g) => g.title);

    const roadmap = {
      daily: [
        this.item('daily', 'Today — Execution Focus', 'Today', 'Critical', [
          tasks[0] || 'Triage Critical priorities',
          'Review failed tasks and unblock owners',
          'Confirm Website Intelligence freshness',
        ]),
      ],
      weekly: [
        this.item('weekly', 'This Week — Action Plan', 'This week', 'High', [
          ...tasks.slice(0, 3),
          top[0] || 'Ship top priority improvement',
        ]),
      ],
      monthly: [
        this.item('monthly', 'This Month — Outcomes', 'This month', 'High', [
          ...goalTitles.filter((_, i) => args.goals[i]?.horizon === 'monthly').slice(0, 2),
          ...tasks.slice(2, 5),
          'Publish content cadence (blog/FAQ)',
        ]),
      ],
      quarterly: [
        this.item('quarterly', 'This Quarter — Strategy', 'This quarter', 'Medium', [
          ...goalTitles.slice(0, 3),
          'Compound SEO + performance gains',
          'Reduce critical risk backlog to near-zero',
        ]),
      ],
    };

    this.logger.info('Generated deterministic multi-horizon roadmap', args.domain);
    return roadmap;
  }

  private ensure(
    list: RoadmapItem[] | undefined,
    horizon: PlanHorizon,
    args: { priorities: StrategicPriority[]; plannedTaskTitles: string[] }
  ): RoadmapItem[] {
    if (list && list.length > 0) {
      return list.map((r, i) => ({
        id: r.id || `rm-${horizon}-${i + 1}`,
        title: r.title,
        horizon,
        periodLabel: r.periodLabel || horizon,
        items: r.items?.length ? r.items : args.plannedTaskTitles.slice(0, 3),
        priority: (r.priority as PlanPriority) || 'Medium',
      }));
    }
    return [
      this.item(
        horizon,
        `${horizon} plan`,
        horizon,
        'Medium',
        args.plannedTaskTitles.slice(0, 3).length
          ? args.plannedTaskTitles.slice(0, 3)
          : args.priorities.slice(0, 3).map((p) => p.title)
      ),
    ];
  }

  private item(
    horizon: PlanHorizon,
    title: string,
    periodLabel: string,
    priority: PlanPriority,
    items: string[]
  ): RoadmapItem {
    return {
      id: `rm-${horizon}-${Date.now()}`,
      title,
      horizon,
      periodLabel,
      priority,
      items: items.filter(Boolean),
    };
  }
}
