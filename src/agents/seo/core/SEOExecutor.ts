import type { SEOAudit, SEOAuditInput } from '../types/SEOAudit';
import { SEOHistoryRepository } from '../repositories/SEOHistoryRepository';
import { SEORepository } from '../repositories/SEORepository';
import { SEOAnalyzer } from './SEOAnalyzer';
import { SEOReportGenerator } from './SEOReportGenerator';
import { SEOValidator } from './SEOValidator';
import { SEOLogger } from './SEOLogger';

/**
 * Executes an SEO audit task end-to-end.
 * Task Engine / Agent Runtime can call SEOAgent.receiveTask → SEOExecutor.
 */
export class SEOExecutor {
  private history = SEOHistoryRepository.getInstance();
  private seoRepo = SEORepository.getInstance();
  private analyzer = new SEOAnalyzer();
  private reportGenerator = new SEOReportGenerator();
  private logger = SEOLogger.getInstance();

  public async execute(input: SEOAuditInput): Promise<SEOAudit> {
    const validation = SEOValidator.validateInput(input);
    if (!validation.valid) {
      throw new Error(validation.errors.join('; '));
    }

    const audit = this.createAudit(input);
    this.history.save(audit);
    this.pushLog(audit, 'info', 'SEO audit started');

    const t0 = Date.now();

    try {
      this.setStatus(audit, 'gathering_context', 15, 'Loading Website Intelligence & Memory...');
      const websiteContext = this.analyzer.resolveWebsiteContext(input);
      if (!websiteContext) {
        throw new Error(
          'No Website Intelligence context found. Run Website Intelligence on a website first.'
        );
      }

      audit.domain = websiteContext.domain;
      audit.websiteId = websiteContext.websiteId;
      audit.input = {
        ...input,
        domain: websiteContext.domain,
        websiteId: websiteContext.websiteId,
      };

      const context = this.analyzer.gatherContext(input, websiteContext, audit.id);
      audit.context = context;
      this.history.save(audit);

      if (!context.websiteContextLoaded) {
        throw new Error('Website context failed to load');
      }

      this.setStatus(audit, 'analyzing', 45, 'Calling AI Engine with structured JSON prompt...');
      const previousReports = this.seoRepo.listReports(websiteContext.domain).slice(0, 3);
      const analysis = await this.analyzer.analyzeWithAI(
        input,
        websiteContext,
        context,
        previousReports,
        audit.id
      );
      this.pushLog(audit, 'info', `AI analysis complete (${analysis.durationMs}ms)`, {
        tokens: analysis.tokenUsage.totalTokens,
        modelId: analysis.modelId,
      });

      this.setStatus(audit, 'generating_report', 75, 'Building structured SEO report...');
      const previousOverall = previousReports[0]?.overallSeoScore;
      let report = this.reportGenerator.buildReport({
        auditId: audit.id,
        websiteContext,
        analysis,
        previousOverall,
        durationMs: Date.now() - t0,
      });

      this.setStatus(audit, 'saving', 90, 'Saving report to Memory & history...');
      report = this.reportGenerator.persistReport(report, audit.id);

      audit.reportId = report.id;
      audit.report = report;
      audit.status = 'completed';
      audit.progress = 100;
      audit.message = `SEO audit completed — score ${report.overallSeoScore}/100`;
      audit.finishedAt = new Date().toISOString();
      audit.durationMs = Date.now() - t0;
      this.pushLog(audit, 'info', audit.message);
      this.history.save(audit);
      this.logger.success(audit.message, audit.id);

      return audit;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      audit.status = 'failed';
      audit.progress = 0;
      audit.message = message;
      audit.errorMessage = message;
      audit.finishedAt = new Date().toISOString();
      audit.durationMs = Date.now() - t0;
      this.pushLog(audit, 'error', message);
      this.history.save(audit);
      this.logger.error(message, audit.id);
      throw err;
    }
  }

  private createAudit(input: SEOAuditInput): SEOAudit {
    const domain = input.domain || 'unknown';
    return {
      id: `seo-audit-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      status: 'pending',
      progress: 0,
      message: 'Queued',
      input,
      domain,
      websiteId: input.websiteId,
      startedAt: new Date().toISOString(),
      logs: [],
    };
  }

  private setStatus(
    audit: SEOAudit,
    status: SEOAudit['status'],
    progress: number,
    message: string
  ): void {
    audit.status = status;
    audit.progress = progress;
    audit.message = message;
    this.pushLog(audit, 'info', message);
    this.history.save(audit);
  }

  private pushLog(
    audit: SEOAudit,
    level: SEOAudit['logs'][number]['level'],
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    audit.logs.push({
      id: `sal-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      level,
      message: metadata ? `${message} ${JSON.stringify(metadata)}` : message,
      timestamp: new Date().toISOString(),
    });
  }
}
