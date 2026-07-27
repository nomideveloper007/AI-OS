import { MemoryManager } from '../../../memory/core/MemoryManager';
import type { SEOReport, SEOGeneratedTask } from '../types/SEOReport';
import type { SEOScoreBreakdown } from '../types/SEOScore';
import type { WebsiteContext } from '../../../intelligence/types/WebsiteContext';
import { SEORepository } from '../repositories/SEORepository';
import { SEORecommendationEngine } from './SEORecommendationEngine';
import { SEOMetrics } from './SEOMetrics';
import { SEOValidator } from './SEOValidator';
import { SEOLogger } from './SEOLogger';
import type { SEOAIAnalysisResult } from './SEOAnalyzer';
import { SEO_PROMPT_VERSION } from '../prompts/seoAuditPrompt';

export class SEOReportGenerator {
  private memory = MemoryManager.getInstance();
  private repo = SEORepository.getInstance();
  private engine = new SEORecommendationEngine();
  private logger = SEOLogger.getInstance();

  public buildReport(params: {
    auditId: string;
    websiteContext: WebsiteContext;
    analysis: SEOAIAnalysisResult;
    previousOverall?: number;
    durationMs: number;
  }): SEOReport {
    const raw = params.analysis.raw;
    const scoresRaw = (raw.scores || {}) as Partial<SEOScoreBreakdown>;
    const overall = SEOValidator.clampScore(
      raw.overallSeoScore ?? scoresRaw.overall,
      params.websiteContext.scores.seo
    );
    const breakdown = SEOValidator.normalizeBreakdown(
      { ...scoresRaw, overall },
      overall
    );
    // Prefer explicit overall; else average breakdown
    const computedOverall =
      typeof raw.overallSeoScore === 'number'
        ? overall
        : SEOMetrics.computeOverallFromBreakdown(breakdown);
    breakdown.overall = computedOverall;

    const critical = this.engine.parseIssues(
      (raw.criticalIssues as unknown[]) || [],
      'critical'
    );
    const warnings = this.engine.parseIssues((raw.warnings as unknown[]) || [], 'warning');
    const opportunities = this.engine.parseIssues(
      (raw.opportunities as unknown[]) || [],
      'opportunity'
    );
    const quickWins = this.engine.parseRecommendations(
      (raw.quickWins as unknown[]) || [],
      'quick_win'
    );
    const longTerm = this.engine.parseRecommendations(
      (raw.longTermImprovements as unknown[]) || [],
      'long_term'
    );
    const tasks = this.engine.parseGeneratedTasks(
      (raw.generatedTasks as unknown[]) || []
    );

    const enriched = this.engine.enrich(
      critical,
      warnings,
      opportunities,
      quickWins,
      longTerm,
      tasks
    );

    const priority =
      (['critical', 'high', 'medium', 'low'].includes(String(raw.priority))
        ? (raw.priority as SEOReport['priority'])
        : SEOMetrics.prioritizeFromIssues(enriched.criticalIssues, enriched.warnings));

    const previous = params.previousOverall;
    const report: SEOReport = {
      id: `seo-rep-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      auditId: params.auditId,
      websiteId: params.websiteContext.websiteId,
      domain: params.websiteContext.domain,
      websiteName: params.websiteContext.name,
      createdAt: new Date().toISOString(),
      overallSeoScore: computedOverall,
      score: {
        breakdown,
        grade: SEOMetrics.gradeFromScore(computedOverall),
        previousOverall: previous,
        delta: previous != null ? computedOverall - previous : undefined,
      },
      criticalIssues: enriched.criticalIssues,
      warnings: enriched.warnings,
      opportunities: enriched.opportunities,
      quickWins: enriched.quickWins,
      longTermImprovements: enriched.longTermImprovements,
      recommendations: enriched.recommendations,
      estimatedSeoImpact: String(
        raw.estimatedSeoImpact ||
          (enriched.criticalIssues.length
            ? 'High — resolve crawl/index blockers first'
            : 'Moderate — iterate on-page SEO')
      ),
      priority,
      executiveSummary: String(
        raw.executiveSummary ||
          `SEO audit for ${params.websiteContext.domain}: score ${computedOverall}/100.`
      ),
      generatedTasks: enriched.generatedTasks,
      modelId: params.analysis.modelId,
      providerId: params.analysis.providerId,
      promptVersion: params.analysis.promptVersion || SEO_PROMPT_VERSION,
      tokenUsage: params.analysis.tokenUsage,
      durationMs: params.durationMs,
      rawAiJson: raw,
      rawAiContent: params.analysis.rawAiContent,
      analysisSource: 'ai_engine',
    };

    SEOValidator.assertReport(report);
    return report;
  }

  public persistReport(report: SEOReport, auditId?: string): SEOReport {
    this.repo.saveReport(report);
    this.repo.saveGeneratedTasks(report.generatedTasks);
    const memoryItem = this.storeInMemory(report);
    report.memoryItemId = memoryItem.id;
    this.repo.saveReport(report);
    this.logger.success(
      `Report ${report.id} saved (memory=${memoryItem.id}, tasks=${report.generatedTasks.length})`,
      auditId
    );
    return report;
  }

  private storeInMemory(report: SEOReport) {
    const criticalTitles = report.criticalIssues.map((i) => i.title).join('; ');
    const content = [
      `Executive Summary: ${report.executiveSummary}`,
      `Overall SEO Score: ${report.overallSeoScore}/100 (${report.score.grade})`,
      `Priority: ${report.priority}`,
      `Estimated Impact: ${report.estimatedSeoImpact}`,
      `Critical Issues (${report.criticalIssues.length}): ${criticalTitles || 'none'}`,
      `Warnings: ${report.warnings.length}`,
      `Opportunities: ${report.opportunities.length}`,
      `Quick Wins: ${report.quickWins.map((q) => q.title).join('; ')}`,
      `Generated Tasks: ${report.generatedTasks.map((t) => t.title).join('; ')}`,
      `Prompt: ${report.promptVersion}`,
    ].join('\n');

    return this.memory.createMemoryItem({
      title: `SEO Audit Report — ${report.domain} (${report.overallSeoScore}/100)`,
      description: report.executiveSummary.slice(0, 160),
      content,
      type: 'Agent Memory',
      category: 'SEO',
      priority: report.priority === 'critical' || report.priority === 'high' ? 'High' : 'Medium',
      website: report.domain,
      tags: ['SEO', 'SEO Agent', 'Audit Report', report.score.grade],
      source: 'SEO Agent',
      visibility: 'Global',
    });
  }

  public listGeneratedTasks(): SEOGeneratedTask[] {
    return this.repo.listGeneratedTasks();
  }
}
