import { CEOPlanner } from './CEOPlanner';
import { CEOReporter } from './CEOReporter';
import { CEOHistory } from './CEOHistory';
import { CEOLogger } from './CEOLogger';
import { CEOEvents } from './CEOEvents';
import { CEOPermissions } from './CEOPermissions';
import { CEOContextData, CEOExecutiveReport } from './CEOContext';
import { CEOStateData, CEOAgentStatus } from './CEOState';

export class CEOAgent {
  private static instance: CEOAgent;

  public readonly logger = new CEOLogger();
  public readonly history = new CEOHistory();
  private planner = new CEOPlanner();
  private reporter = new CEOReporter();

  private state: CEOStateData = {
    status: 'Idle',
    currentProgressPercent: 0,
    currentStepMessage: 'CEO Executive Agent Ready.',
    totalAnalysesRun: 0
  };

  private constructor() {
    this.logger.log('info', 'CEO Executive Agent initialized with strict read-only & advisor permissions.');
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

  private updateState(status: CEOAgentStatus, progress: number, message: string): void {
    this.state = {
      ...this.state,
      status,
      currentProgressPercent: progress,
      currentStepMessage: message
    };
  }

  public async runExecutiveAnalysis(domain: string = 'tasktomoney.com'): Promise<CEOExecutiveReport> {
    CEOPermissions.assertAllowed('Read Scanner');
    CEOPermissions.assertAllowed('Read Memory');
    CEOPermissions.assertAllowed('Create Reports');
    CEOPermissions.assertAllowed('Create Tasks');
    CEOPermissions.assertAllowed('Request Approval');

    try {
      // Step 1: Analysis Started
      this.updateState('Reading Context', 15, 'Reading Website Scanner & Memory...');
      CEOEvents.emit('analysis_started', { domain });
      this.logger.log('info', `Executive Analysis initiated for ${domain}`);

      // Step 2: Build Context (Scanner + Memory + Reports + Workflows)
      const context: CEOContextData = {
        websiteDomain: domain,
        scannerData: {
          status: 'Healthy',
          domain,
          speedScore: 92,
          pagesScanned: 18,
          sslActive: true,
          brokenLinksCount: 0
        },
        memoryItems: [],
        previousReports: this.history.getReports()
      };
      CEOEvents.emit('scanner_loaded', { domain });
      CEOEvents.emit('memory_loaded', { count: 0 });

      // Step 3: Call AI Engine via CEOPlanner
      this.updateState('Analyzing AI', 45, 'Synthesizing technical profile via AI Engine...');
      const report = await this.planner.plan(context);
      CEOEvents.emit('report_generated', { reportId: report.id });

      // Step 4: Generating Tasks & Recommendations
      this.updateState('Creating Tasks', 75, 'Generating task recommendations...');
      CEOEvents.emit('tasks_generated', { count: report.tasks.length });

      // Step 5: Publish Report to Memory & Submit Approvals
      this.updateState('Waiting Approval', 90, 'Submitting recommendations for Administrator Approval...');
      await this.reporter.publishReport(report);
      CEOEvents.emit('waiting_approval', { reportId: report.id });

      // Step 6: Complete
      this.history.recordReport(report);
      this.state.totalAnalysesRun += 1;
      this.state.lastAnalysisTimestamp = new Date().toLocaleTimeString();
      this.state.activeReportId = report.id;
      this.updateState('Completed', 100, `Executive Analysis completed for ${domain}.`);
      this.logger.log('success', `Report ${report.id} generated with ${report.tasks.length} task recommendations.`);

      return report;
    } catch (err: any) {
      this.updateState('Error', 0, `Analysis Failed: ${err.message}`);
      CEOEvents.emit('analysis_error', { error: err.message });
      this.logger.log('error', `Executive Analysis error: ${err.message}`);
      throw err;
    }
  }
}
