import { CEOPlanner } from './CEOPlanner';
import { CEOReporter } from './CEOReporter';
import { CEOHistory } from './CEOHistory';
import { CEOLogger } from './CEOLogger';
import { CEOEvents } from './CEOEvents';
import { CEOPermissions } from './CEOPermissions';
import { CEOContextData, CEOExecutiveReport } from './CEOContext';
import { CEOStateData, CEOAgentStatus } from './CEOState';
import { WebsiteIntelligenceEngine } from '../../intelligence/core/WebsiteIntelligenceEngine';
import { WebsiteContextRepository } from '../../intelligence/repositories/WebsiteContextRepository';
import { MemoryEngine } from '../../memory/core/MemoryEngine';
import { TaskEngine } from '../../task-engine/core/TaskEngine';
import { WorkflowManager } from '../../workflow/core/WorkflowManager';
import { PlanningLogger } from './planning/PlanningLogger';
import type { StrategicPlan } from './planning/planTypes';

/**
 * CEO Executive Agent — strategic planner / company brain.
 * Plans only. Never executes work (Task Engine + AI Employees execute).
 */
export class CEOAgent {
  private static instance: CEOAgent;

  public readonly logger = new CEOLogger();
  public readonly history = new CEOHistory();
  private planner = new CEOPlanner();
  private reporter = new CEOReporter();
  private planningLogger = PlanningLogger.getInstance();

  private intelligence = WebsiteIntelligenceEngine.getInstance();
  private contextRepo = WebsiteContextRepository.getInstance();
  private memory = MemoryEngine.getInstance();
  private tasks = TaskEngine.getInstance();
  private workflows = WorkflowManager.getInstance();

  private state: CEOStateData = {
    status: 'Idle',
    currentProgressPercent: 0,
    currentStepMessage: 'CEO Strategic Planner Ready.',
    totalAnalysesRun: 0,
  };

  private lastStrategicPlan: StrategicPlan | undefined;

  private constructor() {
    this.logger.log(
      'info',
      'CEO Executive Agent initialized — strategic planning only (no execution).'
    );
  }

  public static getInstance(): CEOAgent {
    if (!CEOAgent.instance) {
      CEOAgent.instance = new CEOAgent();
    }
    return CEOAgent.instance;
  }

  public getState(): CEOStateData {
    return { ...this.state };
  }

  public getLatestStrategicPlan(domain?: string): StrategicPlan | undefined {
    return this.lastStrategicPlan || this.planner.getLatestStrategicPlan(domain);
  }

  private updateState(status: CEOAgentStatus, progress: number, message: string): void {
    this.state = {
      ...this.state,
      status,
      currentProgressPercent: progress,
      currentStepMessage: message,
    };
  }

  public async runExecutiveAnalysis(domain: string = 'tasktomoney.com'): Promise<CEOExecutiveReport> {
    CEOPermissions.assertAllowed('Read Scanner');
    CEOPermissions.assertAllowed('Read Memory');
    CEOPermissions.assertAllowed('Read Reports');
    CEOPermissions.assertAllowed('Read Workflows');
    CEOPermissions.assertAllowed('Create Reports');
    CEOPermissions.assertAllowed('Create Tasks');
    CEOPermissions.assertAllowed('Request Approval');

    try {
      this.updateState('Reading Context', 10, 'Gathering Website Intelligence, Memory, Tasks, Workflows...');
      CEOEvents.emit('analysis_started', { domain });
      this.logger.log('info', `Strategic planning initiated for ${domain}`);
      this.planningLogger.info('Gathering planning inputs', domain);

      const context = this.gatherContext(domain);
      CEOEvents.emit('scanner_loaded', { domain, loaded: Boolean(context.websiteIntelligence) });
      CEOEvents.emit('memory_loaded', { count: context.memoryItems?.length || 0 });

      this.updateState('Analyzing AI', 40, 'CEO Strategic Planner synthesizing business plan...');
      const report = await this.planner.plan(context);
      this.lastStrategicPlan = report.strategicPlan;
      CEOEvents.emit('report_generated', { reportId: report.id });

      this.updateState('Creating Tasks', 75, 'Registering planned tasks in Task Engine (no execution)...');
      CEOEvents.emit('tasks_generated', { count: report.tasks.length });

      this.updateState('Waiting Approval', 90, 'Publishing plan to Memory & approval queue...');
      await this.reporter.publishReport(report);
      CEOEvents.emit('waiting_approval', { reportId: report.id });

      this.history.recordReport(report);
      this.state.totalAnalysesRun += 1;
      this.state.lastAnalysisTimestamp = new Date().toLocaleTimeString();
      this.state.activeReportId = report.id;
      this.updateState(
        'Completed',
        100,
        `Strategic plan ready for ${domain} (health ${report.healthScores.overall}/100).`
      );
      this.logger.log(
        'success',
        `Plan ${report.id}: ${report.tasks.length} planned tasks (execution deferred to Task Engine).`
      );
      this.planningLogger.success(`CEO plan published ${report.id}`, domain);

      return report;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.updateState('Error', 0, `Strategic planning failed: ${message}`);
      CEOEvents.emit('analysis_error', { error: message });
      this.logger.log('error', `Strategic planning error: ${message}`);
      this.planningLogger.error(message, domain);
      throw err instanceof Error ? err : new Error(message);
    }
  }

  private gatherContext(domain: string): CEOContextData {
    const websiteContext =
      this.contextRepo.getLatestForDomain(domain) || this.contextRepo.listAll()[0];

    const websiteIntelligence = websiteContext
      ? this.intelligence.buildCeoContext(websiteContext)
      : undefined;

    const memoryHits = [
      ...this.memory.searchMemories({ query: domain, category: 'Reports' }).slice(0, 6),
      ...this.memory.searchMemories({ query: domain }).slice(0, 6),
    ];

    const memoryItems = memoryHits.slice(0, 10).map((m) => ({
      title: m.title,
      snippet: (m.content || m.description || '').slice(0, 220),
      category: m.category,
    }));

    const allTasks = this.tasks.listTasks();
    const completedTasks = allTasks
      .filter((t) => t.status === 'completed')
      .slice(0, 20)
      .map((t) => ({ id: t.id, title: t.title, category: t.category }));
    const failedTasks = allTasks
      .filter((t) => t.status === 'failed')
      .slice(0, 20)
      .map((t) => ({ id: t.id, title: t.title, category: t.category }));
    const openTasks = allTasks
      .filter((t) => t.status !== 'completed' && t.status !== 'failed' && t.status !== 'cancelled')
      .slice(0, 20)
      .map((t) => ({ id: t.id, title: t.title, status: t.status }));

    const workflowHistory = this.workflows
      .getWorkflows()
      .slice(0, 12)
      .map((w) => ({ id: w.id, name: w.name, status: String(w.status) }));

    return {
      websiteDomain: websiteContext?.domain || domain,
      websiteId: websiteContext?.websiteId,
      websiteIntelligence,
      scannerData: websiteIntelligence,
      memoryItems,
      previousReports: this.history.getReports(),
      workflowHistory,
      businessGoals: [
        'Increase organic traffic',
        'Improve Core Web Vitals & UX',
        'Reduce technical and SEO risk',
        'Ship consistent content (FAQ + blog)',
      ],
      completedTasks,
      failedTasks,
      openTasks,
    };
  }
}
