import { BaseAgent } from '../core/BaseAgent';
import { IAgentTask } from '../interfaces/IAgentTask';
import { TaskEngine } from '../../task-engine/core/TaskEngine';

export class PMAgent extends BaseAgent {
  private static instance: PMAgent;
  private taskEngine = TaskEngine.getInstance();

  constructor() {
    super({
      id: 'agent-pm-orchestrator',
      name: 'Project Manager Agent',
      description: 'Breaks high-level CEO goals into actionable tasks, manages backlog priorities, and monitors agent dependencies.',
      role: 'Project Manager',
      priority: 'High',
      capabilities: ['Analyze Data', 'Read Reports', 'Generate Prompt']
    });
  }

  public static getInstance(): PMAgent {
    if (!PMAgent.instance) {
      PMAgent.instance = new PMAgent();
    }
    return PMAgent.instance;
  }

  protected async performTaskExecution(task: IAgentTask): Promise<any> {
    this.log('info', `PM Orchestrator processing workflow task: ${task.title}`);
    
    const taskDesc = task.payload?.description || '';
    // Simulate breaking down high level roadmap item
    const subTasks = [
      {
        title: `[Scaffold] Setup code structure for ${task.title}`,
        description: `Implement base files and schema layouts for: ${taskDesc}`,
        category: 'Architecture',
        suggestedAgent: 'SEO Agent'
      },
      {
        title: `[Validation] Run test validations for ${task.title}`,
        description: `Verify that compilation and lint checks pass cleanly in sandbox.`,
        category: 'UX',
        suggestedAgent: 'Website Agent'
      }
    ];

    // Seeding these into TaskEngine
    for (const sub of subTasks) {
      this.taskEngine.createTask({
        title: sub.title,
        description: sub.description,
        category: sub.category as any,
        priority: 'high',
        websiteDomain: 'tasktomoney.com'
      });
      this.log('info', `PM Agent created sub-task: ${sub.title}`);
    }

    return {
      output: `PM Agent successfully decomposed and orchestrated workflow for task: ${task.title}. Seeded ${subTasks.length} sub-tasks to Task Engine.`,
      subTasksCreated: subTasks.length,
      timestamp: new Date().toISOString()
    };
  }
}
