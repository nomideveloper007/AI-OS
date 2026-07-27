import { TaskEngine } from '../../../task-engine/core/TaskEngine';
import type { CreateTaskInput, Task } from '../../../task-engine/types/Task';
import type { TaskCategory } from '../../../task-engine/types/TaskCategory';
import type { TaskPriority } from '../../../task-engine/types/TaskPriority';
import type {
  PlannedTask,
  PlanHorizon,
  PlanPriority,
  PlanningInputBundle,
  StrategicPlan,
  StrategicPriority,
} from './planTypes';
import { PlanningLogger } from './PlanningLogger';

/**
 * Creates structured planned tasks and optionally registers them in Task Engine.
 * CEO never executes — createTask only (no processQueue / submitAndRun).
 */
export class TaskPlanner {
  private logger = PlanningLogger.getInstance();
  private taskEngine = TaskEngine.getInstance();

  public plan(args: {
    input: PlanningInputBundle;
    priorities: StrategicPriority[];
    risks: StrategicPlan['risks'];
    opportunities: StrategicPlan['opportunities'];
    aiTasks?: PlannedTask[];
    registerInTaskEngine?: boolean;
  }): PlannedTask[] {
    const planned =
      args.aiTasks && args.aiTasks.length > 0
        ? args.aiTasks.map((t, i) => this.normalize(t, i))
        : this.deriveFromContext(args);

    const capped = planned.slice(0, 12);
    if (args.registerInTaskEngine) {
      for (const t of capped) {
        try {
          const created = this.register(t, args.input);
          t.taskEngineId = created.id;
        } catch (err) {
          this.logger.warn(
            `Task Engine create skipped for "${t.title}": ${err instanceof Error ? err.message : String(err)}`,
            args.input.domain
          );
        }
      }
    }

    this.logger.success(
      `Planned ${capped.length} tasks (registered=${args.registerInTaskEngine === true})`,
      args.input.domain
    );
    return capped;
  }

  private deriveFromContext(args: {
    input: PlanningInputBundle;
    priorities: StrategicPriority[];
    risks: StrategicPlan['risks'];
    opportunities: StrategicPlan['opportunities'];
  }): PlannedTask[] {
    const templates: Array<Omit<PlannedTask, 'id'>> = [
      {
        title: 'Improve homepage title',
        description: 'Optimize homepage title tag with primary keywords and clear value proposition.',
        priority: 'High',
        category: 'SEO',
        estimatedImpact: 'High — CTR and ranking relevance',
        suggestedAgent: 'SEO Specialist Agent',
        horizon: 'weekly',
        reason: 'On-page title is a high-leverage SEO control.',
      },
      {
        title: 'Fix missing ALT text',
        description: 'Add descriptive ALT attributes to images missing accessibility/SEO text.',
        priority: 'Medium',
        category: 'SEO',
        estimatedImpact: 'Medium — accessibility + image search',
        suggestedAgent: 'SEO Specialist Agent',
        horizon: 'weekly',
        reason: 'Missing ALT text is a common crawl/accessibility gap.',
      },
      {
        title: 'Create FAQ page',
        description: 'Publish FAQ content with structured data to capture long-tail queries.',
        priority: 'High',
        category: 'Content',
        estimatedImpact: 'High — organic + support deflection',
        suggestedAgent: 'Growth Marketing Agent',
        horizon: 'monthly',
        reason: 'FAQ pages convert informational intent into trust.',
      },
      {
        title: 'Optimize sitemap',
        description: 'Ensure XML sitemap covers indexable URLs and is discoverable.',
        priority: 'Medium',
        category: 'SEO',
        estimatedImpact: 'Medium — crawl efficiency',
        suggestedAgent: 'SEO Specialist Agent',
        horizon: 'monthly',
        reason: 'Sitemap hygiene improves discovery of new pages.',
      },
      {
        title: 'Publish 3 blog posts',
        description: 'Ship three high-intent articles aligned to business goals and keywords.',
        priority: 'High',
        category: 'Content',
        estimatedImpact: 'High — compounding organic growth',
        suggestedAgent: 'Growth Marketing Agent',
        horizon: 'monthly',
        reason: 'Content cadence fuels top-of-funnel demand.',
      },
      {
        title: 'Improve Core Web Vitals',
        description: 'Reduce LCP/CLS and optimize critical rendering path for key landing pages.',
        priority: 'Critical',
        category: 'Performance',
        estimatedImpact: 'High — rankings + conversion UX',
        suggestedAgent: 'Website Auditor Agent',
        horizon: 'weekly',
        reason: 'CWV impacts both SEO and user conversion.',
      },
    ];

    // Prefer risk/opportunity-driven titles when available
    const fromRisks = args.risks.slice(0, 2).map((r, i) => ({
      title: `Address risk: ${r.title}`.slice(0, 80),
      description: r.mitigation || r.description,
      priority: r.severity,
      category: 'Architecture' as const,
      estimatedImpact: 'Risk reduction',
      suggestedAgent: 'Website Auditor Agent',
      horizon: 'weekly' as PlanHorizon,
      reason: r.description,
    }));

    const fromOpps = args.opportunities.slice(0, 2).map((o) => ({
      title: `Pursue: ${o.title}`.slice(0, 80),
      description: o.actionPlan || o.description,
      priority: 'High' as PlanPriority,
      category: 'Growth' as const,
      estimatedImpact: o.potentialGrowth,
      suggestedAgent: 'Growth Marketing Agent',
      horizon: 'monthly' as PlanHorizon,
      reason: o.description,
    }));

    const merged = [...fromRisks, ...fromOpps, ...templates];
    const seen = new Set<string>();
    const unique: PlannedTask[] = [];
    for (const [i, t] of merged.entries()) {
      const key = t.title.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(this.normalize(t as PlannedTask, i));
    }
    return unique;
  }

  private normalize(t: PlannedTask | Omit<PlannedTask, 'id'>, index: number): PlannedTask {
    return {
      id: ('id' in t && t.id) || `plan-task-${Date.now()}-${index}`,
      title: t.title,
      description: t.description,
      priority: this.normalizePriority(t.priority),
      category: t.category || 'SEO',
      estimatedImpact: t.estimatedImpact || 'Medium',
      suggestedAgent: t.suggestedAgent || 'SEO Specialist Agent',
      horizon: (t.horizon as PlanHorizon) || 'weekly',
      reason: t.reason || 'Strategic planning recommendation',
      taskEngineId: 'taskEngineId' in t ? t.taskEngineId : undefined,
    };
  }

  private register(task: PlannedTask, input: PlanningInputBundle): Task {
    const payload: CreateTaskInput = {
      title: task.title,
      description: `${task.description}\n\nReason: ${task.reason}\nImpact: ${task.estimatedImpact}\nHorizon: ${task.horizon}\nSuggested: ${task.suggestedAgent}`,
      priority: this.toTaskPriority(task.priority),
      category: this.toTaskCategory(task.category),
      websiteDomain: input.domain,
      websiteId: input.websiteId,
      requestedBy: 'CEO Executive Agent',
      approvalRequired: true,
      estimatedDurationMs: task.horizon === 'daily' ? 30 * 60 * 1000 : 2 * 60 * 60 * 1000,
      payload: {
        source: 'ceo_strategic_planner',
        planTaskId: task.id,
        suggestedAgent: task.suggestedAgent,
        planOnly: true,
      },
    };
    return this.taskEngine.createTask(payload);
  }

  private normalizePriority(v: unknown): PlanPriority {
    const s = String(v || 'Medium').toLowerCase();
    if (s.includes('crit')) return 'Critical';
    if (s.includes('high')) return 'High';
    if (s.includes('low')) return 'Low';
    return 'Medium';
  }

  private toTaskPriority(p: PlanPriority): TaskPriority {
    if (p === 'Critical') return 'critical';
    if (p === 'High') return 'high';
    if (p === 'Low') return 'low';
    return 'medium';
  }

  private toTaskCategory(c: PlannedTask['category']): TaskCategory {
    switch (c) {
      case 'SEO':
        return 'SEO';
      case 'Security':
        return 'Security';
      case 'Performance':
        return 'Performance';
      case 'Content':
        return 'Content';
      case 'UX':
        return 'Website';
      case 'Architecture':
        return 'Development';
      case 'Growth':
        return 'Growth';
      default:
        return 'Business';
    }
  }
}
