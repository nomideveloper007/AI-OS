import { WorkflowExecutionRecord } from '../types/WorkflowExecution';

export class ExecutionRepository {
  private static instance: ExecutionRepository;
  private executions: Map<string, WorkflowExecutionRecord> = new Map();

  private constructor() {
    this.seedDefaultExecutions();
  }

  public static getInstance(): ExecutionRepository {
    if (!ExecutionRepository.instance) {
      ExecutionRepository.instance = new ExecutionRepository();
    }
    return ExecutionRepository.instance;
  }

  private seedDefaultExecutions(): void {
    const defaults: WorkflowExecutionRecord[] = [
      {
        id: 'exec-101',
        workflowId: 'wf-101',
        workflowName: 'Website Health Check',
        status: 'Waiting Approval',
        startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        durationMs: 2450,
        retryCount: 0,
        logs: [
          'Workflow triggered by Website Scan Completed event.',
          'Step 1: Fetch Scan Results completed in 510ms.',
          'Step 2: Audit Security Headers completed in 1220ms.',
          'Step 3: Waiting Administrator Approval.'
        ]
      },
      {
        id: 'exec-102',
        workflowId: 'wf-103',
        workflowName: 'Generate Daily Report',
        status: 'Completed',
        startedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 1 + 3100).toISOString(),
        durationMs: 3100,
        retryCount: 0,
        logs: [
          'Workflow triggered by Daily Schedule cron.',
          'Synthesized daily briefing report successfully.',
          'Admin notification sent.'
        ]
      }
    ];

    defaults.forEach((e) => this.executions.set(e.id, e));
  }

  public save(exec: WorkflowExecutionRecord): void {
    this.executions.set(exec.id, exec);
  }

  public get(id: string): WorkflowExecutionRecord | undefined {
    return this.executions.get(id);
  }

  public getAll(): WorkflowExecutionRecord[] {
    return Array.from(this.executions.values());
  }
}
