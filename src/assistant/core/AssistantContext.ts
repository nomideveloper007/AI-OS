import { AssistantOSContext } from '../types';
import { TaskEngine } from '../../task-engine/core/TaskEngine';
import { WorkflowManager } from '../../workflow/core/WorkflowManager';
import { AgentManager } from '../../agents/core/AgentManager';
import { GitHubManager } from '../../github/core/GitHubManager';

export class AssistantContext {
  private static instance: AssistantContext;
  private reactContext: {
    websites: any[];
    selectedWebsiteId: string | null;
  } = { websites: [], selectedWebsiteId: null };

  private constructor() {}

  public static getInstance(): AssistantContext {
    if (!AssistantContext.instance) {
      AssistantContext.instance = new AssistantContext();
    }
    return AssistantContext.instance;
  }

  public updateReactState(websites: any[], selectedWebsiteId: string | null) {
    this.reactContext = { websites, selectedWebsiteId };
  }

  public async harvestContext(): Promise<AssistantOSContext> {
    const taskEngine = TaskEngine.getInstance();
    const workflowManager = WorkflowManager.getInstance();
    const agentManager = AgentManager.getInstance();
    
    // Get live tasks list
    const tasksList = taskEngine.listTasks();
    const activeTasks = tasksList.filter(t => t.status === 'running' || t.status === 'queued' || t.status === 'waiting_approval').length;
    const queuedTasks = tasksList.filter(t => t.status === 'queued').length;
    const runningTasks = tasksList.filter(t => t.status === 'running').length;
    const completedTasks = tasksList.filter(t => t.status === 'completed').length;
    const failedTasks = tasksList.filter(t => t.status === 'failed').length;
    const waitingApproval = tasksList.filter(t => t.status === 'waiting_approval').length;

    // Get active website
    const selectedWeb = this.reactContext.websites.find(w => w.id === this.reactContext.selectedWebsiteId) || this.reactContext.websites[0] || null;
    const activeWebsite = selectedWeb ? {
      id: selectedWeb.id,
      name: selectedWeb.name || selectedWeb.domain,
      domain: selectedWeb.domain,
      healthScore: selectedWeb.healthScore || 85
    } : null;

    // Get running agents
    const runningAgents = agentManager.listAgents()
      .filter(a => a.status === 'Running' || a.status === 'Waiting')
      .map(a => a.name);

    // Get running workflows
    const runningWorkflows = workflowManager.getWorkflows()
      .filter(w => w.status === 'Running')
      .map(w => w.name);

    // Get repos count
    let reposCount = 23; // fallback to user's count
    try {
      const repos = await GitHubManager.getInstance().getRepositories();
      if (repos && repos.length > 0) {
        reposCount = repos.length;
      }
    } catch {
      // ignore
    }

    return {
      activeWebsite,
      websitesCount: this.reactContext.websites.length,
      reposCount,
      runningAgents,
      runningWorkflows,
      tasks: {
        active: activeTasks,
        queued: queuedTasks,
        running: runningTasks,
        completed: completedTasks,
        failed: failedTasks,
        waitingApproval
      },
      latestReport: null,
      aiProvider: 'OmniRoute Gateway',
      isConnected: true
    };
  }
}
