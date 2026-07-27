import { BaseAgent } from './BaseAgent';
import { AgentFactory, AgentBlueprint } from './AgentFactory';
import { AgentRegistry } from './AgentRegistry';
import { Agent } from './Agent';

export class AgentManager {
  private static instance: AgentManager;
  private registry = AgentRegistry.getInstance();

  private constructor() {
    this.seedInitialAgents();
  }

  public static getInstance(): AgentManager {
    if (!AgentManager.instance) {
      AgentManager.instance = new AgentManager();
    }
    return AgentManager.instance;
  }

  private seedInitialAgents(): void {
    if (this.registry.getAll().length > 0) return;

    const initialBlueprints: AgentBlueprint[] = [
      {
        name: 'CEO Agent',
        description: 'Orchestrates workforce allocation, delegates high-level strategic directives, and reviews agent output.',
        role: 'Executive Director',
        priority: 'Critical',
        capabilities: ['Analyze Data', 'Read Reports', 'Generate Prompt', 'Write Content']
      },
      {
        name: 'SEO Agent',
        description: 'Monitors meta tag coverage, heading structures, canonical URLs, and keyword optimization targets.',
        role: 'SEO Specialist',
        priority: 'High',
        capabilities: ['Website Scan', 'Read Reports', 'Analyze Data']
      },
      {
        name: 'Website Agent',
        description: 'Monitors domain health, SSL certificates, broken links, and site performance.',
        role: 'Website Auditor',
        priority: 'High',
        capabilities: ['Website Scan', 'Read Database', 'Read Reports']
      },
      {
        name: 'Growth Agent',
        description: 'Analyzes user conversion funnels, landing page copy, and engagement metrics.',
        role: 'Growth Marketing',
        priority: 'Medium',
        capabilities: ['Analyze Data', 'Write Content', 'Send Email']
      }
    ];

    initialBlueprints.forEach((bp) => {
      const ag = AgentFactory.createAgent(bp);
      this.registry.register(ag);
    });
  }

  public createAgent(blueprint: AgentBlueprint): BaseAgent {
    const agent = AgentFactory.createAgent(blueprint);
    this.registry.register(agent);
    return agent;
  }

  public deleteAgent(id: string): boolean {
    return this.registry.unregister(id);
  }

  public async startAgent(id: string): Promise<void> {
    const agent = this.findAgent(id);
    if (agent) await agent.start();
  }

  public async pauseAgent(id: string): Promise<void> {
    const agent = this.findAgent(id);
    if (agent) await agent.pause();
  }

  public async resumeAgent(id: string): Promise<void> {
    const agent = this.findAgent(id);
    if (agent) await agent.resume();
  }

  public async stopAgent(id: string): Promise<void> {
    const agent = this.findAgent(id);
    if (agent) await agent.stop();
  }

  public async restartAgent(id: string): Promise<void> {
    const agent = this.findAgent(id);
    if (agent) {
      await agent.stop();
      await agent.start();
    }
  }

  public listAgents(): BaseAgent[] {
    return this.registry.getAll();
  }

  public findAgent(id: string): BaseAgent | undefined {
    return this.registry.get(id);
  }
}
