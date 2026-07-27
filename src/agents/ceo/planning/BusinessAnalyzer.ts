import type { PlanningInputBundle, PlanPriority } from './planTypes';
import { PlanningLogger } from './PlanningLogger';

export interface BusinessHealthResult {
  businessHealthScore: number;
  healthBreakdown: {
    overall: number;
    website: number;
    seo: number;
    performance: number;
    security: number;
    content: number;
    growth: number;
    operations: number;
  };
  strengths: string[];
  weaknesses: string[];
  notes: string[];
}

function clampScore(n: unknown, fallback = 50): number {
  const v = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function readScores(wi?: Record<string, unknown>): Partial<BusinessHealthResult['healthBreakdown']> {
  if (!wi) return {};
  const scores = (wi.scores || wi) as Record<string, unknown>;
  return {
    overall: clampScore(scores.overall ?? wi.healthScore, 55),
    website: clampScore(scores.website ?? scores.overall, 55),
    seo: clampScore(scores.seo, 50),
    performance: clampScore(scores.performance, 55),
    security: clampScore(scores.security, 60),
    content: clampScore(scores.content, 50),
    growth: clampScore(scores.growth ?? scores.marketing, 45),
  };
}

/**
 * Analyzes overall business health from Website Intelligence, tasks, and history.
 * Pure planning logic — never executes work.
 */
export class BusinessAnalyzer {
  private logger = PlanningLogger.getInstance();

  public analyze(input: PlanningInputBundle): BusinessHealthResult {
    const fromWi = readScores(input.websiteIntelligence);
    const completed = input.completedTasks.length;
    const failed = input.failedTasks.length;
    const open = input.openTasks.length;
    const totalOps = completed + failed + open;
    const opsScore =
      totalOps === 0
        ? 60
        : clampScore(Math.round((completed / Math.max(1, completed + failed)) * 100));

    const healthBreakdown = {
      overall: fromWi.overall ?? 55,
      website: fromWi.website ?? 55,
      seo: fromWi.seo ?? 50,
      performance: fromWi.performance ?? 55,
      security: fromWi.security ?? 60,
      content: fromWi.content ?? 50,
      growth: fromWi.growth ?? 45,
      operations: opsScore,
    };

    const businessHealthScore = clampScore(
      Math.round(
        healthBreakdown.overall * 0.25 +
          healthBreakdown.seo * 0.15 +
          healthBreakdown.performance * 0.15 +
          healthBreakdown.security * 0.15 +
          healthBreakdown.content * 0.1 +
          healthBreakdown.growth * 0.1 +
          healthBreakdown.operations * 0.1
      )
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const notes: string[] = [];

    if (healthBreakdown.security >= 80) strengths.push('Strong security posture signals.');
    if (healthBreakdown.performance >= 80) strengths.push('Performance metrics support conversion readiness.');
    if (healthBreakdown.seo < 70) weaknesses.push('SEO health below target — organic growth constrained.');
    if (healthBreakdown.content < 70) weaknesses.push('Content depth/coverage needs expansion.');
    if (failed > 0) weaknesses.push(`${failed} failed task(s) indicate execution friction.`);
    if (completed > 0) strengths.push(`${completed} completed task(s) show delivery momentum.`);
    if (!input.websiteIntelligence) {
      notes.push('Website Intelligence unavailable — health partially estimated from task/memory history.');
    }
    if (input.businessGoals.length) {
      notes.push(`Tracking ${input.businessGoals.length} business goal(s).`);
    }

    this.logger.info(
      `Business health analyzed: ${businessHealthScore}/100`,
      input.domain,
      { completed, failed, open }
    );

    return { businessHealthScore, healthBreakdown, strengths, weaknesses, notes };
  }

  public mergeAiScores(
    base: BusinessHealthResult,
    ai?: Partial<BusinessHealthResult['healthBreakdown']> & { businessHealthScore?: number }
  ): BusinessHealthResult {
    if (!ai) return base;
    const healthBreakdown = {
      overall: clampScore(ai.overall, base.healthBreakdown.overall),
      website: clampScore(ai.website, base.healthBreakdown.website),
      seo: clampScore(ai.seo, base.healthBreakdown.seo),
      performance: clampScore(ai.performance, base.healthBreakdown.performance),
      security: clampScore(ai.security, base.healthBreakdown.security),
      content: clampScore(ai.content, base.healthBreakdown.content),
      growth: clampScore(ai.growth, base.healthBreakdown.growth),
      operations: clampScore(ai.operations, base.healthBreakdown.operations),
    };
    return {
      ...base,
      healthBreakdown,
      businessHealthScore: clampScore(ai.businessHealthScore, healthBreakdown.overall),
    };
  }

  public scoreToPriority(score: number): PlanPriority {
    if (score < 50) return 'Critical';
    if (score < 65) return 'High';
    if (score < 80) return 'Medium';
    return 'Low';
  }
}
