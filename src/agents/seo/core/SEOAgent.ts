import type { SEOAudit, SEOAuditInput } from '../types/SEOAudit';
import type { SEOReport } from '../types/SEOReport';
import { SEOExecutor } from './SEOExecutor';
import { SEOLogger } from './SEOLogger';
import { SEOMetrics, type SEOMetricsSnapshot } from './SEOMetrics';
import { SEORepository } from '../repositories/SEORepository';
import { SEOHistoryRepository } from '../repositories/SEOHistoryRepository';

export type SEOAgentStatus = 'Idle' | 'Running' | 'Completed' | 'Error';

export interface SEOAgentState {
  status: SEOAgentStatus;
  currentProgressPercent: number;
  currentStepMessage: string;
  activeAuditId?: string;
  lastAuditId?: string;
  totalAuditsRun: number;
}

/**
 * SEO Agent — first production AI employee.
 * Flow: Task Engine → Agent Runtime → SEO Agent → AI Engine → Memory → Reports
 * Does not call OmniRoute directly. Does not modify other subsystems.
 */
export class SEOAgent {
  private static instance: SEOAgent;
  private executor = new SEOExecutor();
  private logger = SEOLogger.getInstance();
  private repo = SEORepository.getInstance();
  private history = SEOHistoryRepository.getInstance();

  private state: SEOAgentState = {
    status: 'Idle',
    currentProgressPercent: 0,
    currentStepMessage: 'SEO Agent ready',
    totalAuditsRun: 0,
  };

  private constructor() {
    this.logger.info('SEO Agent initialized');
  }

  public static getInstance(): SEOAgent {
    if (!SEOAgent.instance) SEOAgent.instance = new SEOAgent();
    return SEOAgent.instance;
  }

  public getState(): SEOAgentState {
    return { ...this.state };
  }

  public getLogger(): SEOLogger {
    return this.logger;
  }

  /**
   * Entry point for Task Engine / Agent Runtime task handoff (no coupling required yet).
   */
  public async receiveTask(input: SEOAuditInput): Promise<SEOAudit> {
    return this.runAudit(input);
  }

  public async runAudit(input: SEOAuditInput): Promise<SEOAudit> {
    this.state = {
      ...this.state,
      status: 'Running',
      currentProgressPercent: 5,
      currentStepMessage: 'Starting SEO audit...',
    };

    try {
      const audit = await this.executor.execute(input);
      this.state = {
        status: 'Completed',
        currentProgressPercent: 100,
        currentStepMessage: audit.message,
        activeAuditId: undefined,
        lastAuditId: audit.id,
        totalAuditsRun: this.state.totalAuditsRun + 1,
      };
      return audit;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.state = {
        ...this.state,
        status: 'Error',
        currentProgressPercent: 0,
        currentStepMessage: message,
        activeAuditId: undefined,
      };
      throw err;
    }
  }

  public listReports(domain?: string): SEOReport[] {
    return this.repo.listReports(domain);
  }

  public getLatestReport(domain?: string): SEOReport | undefined {
    return this.repo.getLatestReport(domain);
  }

  public getReport(id: string): SEOReport | undefined {
    return this.repo.getReport(id);
  }

  public listAudits(): SEOAudit[] {
    return this.history.listAll();
  }

  public getAudit(id: string): SEOAudit | undefined {
    return this.history.get(id);
  }

  public getMetrics(): SEOMetricsSnapshot {
    return SEOMetrics.snapshot(this.repo.listReports());
  }

  public listGeneratedTasks() {
    return this.repo.listGeneratedTasks();
  }
}
