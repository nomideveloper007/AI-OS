import { CEOContextData, CEOExecutiveReport } from './CEOContext';
import { StrategicPlanner } from './planning/StrategicPlanner';
import type { PlanningInputBundle, StrategicPlan } from './planning/planTypes';
import { DEFAULT_CEO_CONFIG } from './CEOConfig';

/**
 * CEOPlanner — thin adapter over StrategicPlanner (the CEO brain).
 * Never executes work; only plans and may create Task Engine tickets.
 */
export class CEOPlanner {
  private strategic = StrategicPlanner.getInstance();

  public async plan(context: CEOContextData): Promise<CEOExecutiveReport> {
    const input: PlanningInputBundle = {
      domain: context.websiteDomain,
      websiteId: context.websiteId,
      businessGoals: context.businessGoals || [
        'Increase organic traffic',
        'Improve conversion readiness',
        'Reduce technical risk',
      ],
      websiteIntelligence: context.websiteIntelligence || context.scannerData,
      memorySnippets: (context.memoryItems || []).map((m) => ({
        title: m.title,
        snippet: m.snippet,
        category: m.category,
      })),
      historicalReports: (context.previousReports || []).map((r) => ({
        id: r.id,
        summary: r.executiveSummary,
        score: r.healthScores?.overall,
        createdAt: r.timestamp,
      })),
      completedTasks: context.completedTasks || [],
      failedTasks: context.failedTasks || [],
      openTasks: context.openTasks || [],
      workflowHistory: context.workflowHistory || [],
    };

    const plan = await this.strategic.plan(input, { registerTasks: true });
    return this.toExecutiveReport(plan, context);
  }

  public getLatestStrategicPlan(domain?: string): StrategicPlan | undefined {
    return this.strategic.getLatestPlan(domain);
  }

  private toExecutiveReport(plan: StrategicPlan, context: CEOContextData): CEOExecutiveReport {
    const hb = plan.healthBreakdown;
    return {
      id: plan.id,
      timestamp: plan.createdAt,
      website: plan.domain || context.websiteDomain,
      model: plan.modelId || DEFAULT_CEO_CONFIG.modelId,
      provider: plan.providerId || DEFAULT_CEO_CONFIG.providerId,
      promptVersion: plan.promptVersion,
      executiveSummary: plan.executiveSummary,
      healthScores: {
        overall: plan.businessHealthScore,
        website: hb.website,
        seo: hb.seo,
        performance: hb.performance,
        security: hb.security,
        content: hb.content,
        userExperience: Math.round((hb.performance + hb.content) / 2),
        accessibility: Math.round((hb.content + hb.website) / 2),
      },
      businessGoalAlignment:
        plan.strategicGoals.map((g) => g.title).join('; ') ||
        'Aligned to growth, risk reduction, and operational excellence.',
      strengths: this.deriveStrengths(plan),
      weaknesses: this.deriveWeaknesses(plan),
      risks: plan.risks.map((r) => ({
        id: r.id,
        title: r.title,
        severity: r.severity,
        description: r.description,
        mitigationStrategy: r.mitigation,
      })),
      opportunities: plan.opportunities.map((o) => ({
        id: o.id,
        title: o.title,
        potentialGrowth: o.potentialGrowth,
        description: o.description,
        actionPlan: o.actionPlan,
      })),
      recommendedPriorities: plan.topPriorities.map((p) => `${p.rank}. ${p.title}`),
      actionPlan: plan.immediateActions,
      confidenceScore: plan.sourceNotes.websiteIntelligenceLoaded ? 92 : 78,
      tasks: plan.plannedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority,
        category: t.category,
        estimatedImpact: t.estimatedImpact,
        estimatedDifficulty: t.horizon === 'daily' ? 'Easy' : t.horizon === 'weekly' ? 'Moderate' : 'Hard',
        suggestedAgent: t.suggestedAgent,
        reason: t.reason,
        status: 'Pending Approval' as const,
        approvalRequired: true,
        taskEngineId: t.taskEngineId,
        horizon: t.horizon,
      })),
      strategicPlan: plan,
      recommendedEmployees: plan.recommendedEmployees,
      estimatedImpact: plan.estimatedImpact,
      longTermStrategy: plan.longTermStrategy,
      immediateActions: plan.immediateActions,
    };
  }

  private deriveStrengths(plan: StrategicPlan): string[] {
    const s: string[] = [];
    if (plan.healthBreakdown.security >= 80) s.push('Security health supports trust and continuity.');
    if (plan.healthBreakdown.performance >= 80) s.push('Performance readiness supports conversion UX.');
    if (plan.progress.completedTasks > 0) {
      s.push(`${plan.progress.completedTasks} completed tasks show delivery capacity.`);
    }
    if (s.length === 0) s.push('Foundation is workable for a structured improvement roadmap.');
    return s;
  }

  private deriveWeaknesses(plan: StrategicPlan): string[] {
    const w: string[] = [];
    if (plan.healthBreakdown.seo < 70) w.push('SEO health is below target for organic growth.');
    if (plan.healthBreakdown.content < 70) w.push('Content coverage needs expansion.');
    if (plan.progress.failedTasks > 0) {
      w.push(`${plan.progress.failedTasks} failed tasks create execution drag.`);
    }
    if (w.length === 0 && plan.risks[0]) w.push(plan.risks[0].title);
    if (w.length === 0) w.push('Primary gap is prioritization discipline across horizons.');
    return w;
  }
}
