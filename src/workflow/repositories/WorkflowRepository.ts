import { WorkflowObject } from '../types/Workflow';

export class WorkflowRepository {
  private static instance: WorkflowRepository;
  private workflows: Map<string, WorkflowObject> = new Map();

  private constructor() {
    this.seedDefaultWorkflows();
  }

  public static getInstance(): WorkflowRepository {
    if (!WorkflowRepository.instance) {
      WorkflowRepository.instance = new WorkflowRepository();
    }
    return WorkflowRepository.instance;
  }

  private seedDefaultWorkflows(): void {
    const defaults: WorkflowObject[] = [
      {
        id: 'wf-101',
        name: 'Website Health Check',
        description: 'Pings endpoints, verifies SSL certificates, scans broken links, and checks security header policies.',
        category: 'Security',
        priority: 'High',
        status: 'Waiting Approval',
        trigger: 'Website Scan Completed',
        website: 'tasktomoney.com',
        assignedAgent: 'Website Auditor Agent',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        executionCount: 12,
        successCount: 11,
        failureCount: 1,
        averageDuration: 2450,
        conditions: ['Website Exists', 'AI Connected'],
        actions: ['Read Scan', 'Call AI Engine', 'Wait Approval', 'Save Memory'],
        steps: [
          {
            id: 'st-1',
            name: 'Fetch Scan Results',
            description: 'Retrieves technical scan profile from website scanner database.',
            status: 'Completed',
            assignedAgent: 'Website Auditor Agent',
            action: 'Read Scan',
            condition: 'Website Exists',
            retryCount: 2,
            timeout: 5000,
            estimatedDuration: 500
          },
          {
            id: 'st-2',
            name: 'Audit Security Headers',
            description: 'Analyzes HSTS, CSP, and X-Frame-Options headers.',
            status: 'Completed',
            assignedAgent: 'Website Auditor Agent',
            action: 'Call AI Engine',
            condition: 'AI Connected',
            retryCount: 1,
            timeout: 10000,
            estimatedDuration: 1200
          },
          {
            id: 'st-3',
            name: 'Request Administrator Approval',
            description: 'Requests admin sign-off for automated header fix.',
            status: 'Waiting Approval',
            assignedAgent: 'Website Auditor Agent',
            action: 'Wait Approval',
            condition: 'Approval Granted',
            retryCount: 0,
            timeout: 30000,
            estimatedDuration: 0
          }
        ]
      },
      {
        id: 'wf-102',
        name: 'Daily SEO Review',
        description: 'Monitors meta tag coverage, heading hierarchy, keyword rankings, and canonical tags across connected sites.',
        category: 'SEO',
        priority: 'High',
        status: 'Ready',
        trigger: 'Daily Schedule',
        website: 'ai-os.io',
        assignedAgent: 'SEO Specialist Agent',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        executionCount: 28,
        successCount: 28,
        failureCount: 0,
        averageDuration: 1850,
        conditions: ['Memory Exists', 'Agent Available'],
        actions: ['Read Memory', 'Run Agent', 'Save Memory'],
        steps: [
          {
            id: 'st-4',
            name: 'Read Target Keywords Memory',
            description: 'Loads target keywords from system memory.',
            status: 'Ready',
            assignedAgent: 'SEO Specialist Agent',
            action: 'Read Memory',
            retryCount: 1,
            timeout: 5000,
            estimatedDuration: 400
          },
          {
            id: 'st-5',
            name: 'Analyze Meta Tags',
            description: 'Evaluates meta title and description lengths.',
            status: 'Ready',
            assignedAgent: 'SEO Specialist Agent',
            action: 'Run Agent',
            retryCount: 2,
            timeout: 10000,
            estimatedDuration: 1450
          }
        ]
      },
      {
        id: 'wf-103',
        name: 'Generate Daily Report',
        description: 'Compiles traffic analytics, task completions, and security logs into an executive daily briefing.',
        category: 'Reports',
        priority: 'Medium',
        status: 'Completed',
        trigger: 'Daily Schedule',
        website: 'ai-os.io',
        assignedAgent: 'Executive Director',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        executionCount: 15,
        successCount: 14,
        failureCount: 1,
        averageDuration: 3100,
        conditions: ['AI Connected'],
        actions: ['Generate Report', 'Notify Admin'],
        steps: [
          {
            id: 'st-6',
            name: 'Synthesize Executive Report',
            description: 'Aggregates platform logs and generates daily briefing.',
            status: 'Completed',
            assignedAgent: 'Executive Director',
            action: 'Generate Report',
            retryCount: 1,
            timeout: 15000,
            estimatedDuration: 3100
          }
        ]
      },
      {
        id: 'wf-104',
        name: 'Content Planning',
        description: 'Plans weekly blog post editorial calendar, keywords targeting, and draft outlines.',
        category: 'Content',
        priority: 'Medium',
        status: 'Ready',
        trigger: 'Manual',
        website: 'tasktomoney.com',
        assignedAgent: 'Growth Marketing',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 6,
        successCount: 6,
        failureCount: 0,
        averageDuration: 2100,
        conditions: ['Agent Available'],
        actions: ['Create Task', 'Save Memory'],
        steps: [
          {
            id: 'st-7',
            name: 'Draft Editorial Outlines',
            description: 'Creates outline drafts for upcoming SEO articles.',
            status: 'Ready',
            assignedAgent: 'Growth Marketing',
            action: 'Create Task',
            retryCount: 1,
            timeout: 10000,
            estimatedDuration: 2100
          }
        ]
      },
      {
        id: 'wf-105',
        name: 'User Growth Analysis',
        description: 'Analyzes user conversion funnels, landing page retention, and clickthrough rates.',
        category: 'Analytics',
        priority: 'Low',
        status: 'Draft',
        trigger: 'Hourly Schedule',
        website: 'tasktomoney.com',
        assignedAgent: 'Growth Marketing',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageDuration: 0,
        conditions: ['Website Exists'],
        actions: ['Read Scan', 'Generate Report'],
        steps: [
          {
            id: 'st-8',
            name: 'Compute Funnel Dropoff',
            description: 'Calculates user exit points on checkout page.',
            status: 'Draft',
            assignedAgent: 'Growth Marketing',
            action: 'Read Scan',
            retryCount: 1,
            timeout: 5000,
            estimatedDuration: 1500
          }
        ]
      }
    ];

    defaults.forEach((w) => this.workflows.set(w.id, w));
  }

  public save(wf: WorkflowObject): void {
    this.workflows.set(wf.id, wf);
  }

  public get(id: string): WorkflowObject | undefined {
    return this.workflows.get(id);
  }

  public getAll(): WorkflowObject[] {
    return Array.from(this.workflows.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public delete(id: string): boolean {
    return this.workflows.delete(id);
  }
}
