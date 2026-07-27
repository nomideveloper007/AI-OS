import type { CreateRuntimeAgentInput, RuntimeAgent } from '../types/Agent';
import { AgentFactory } from './AgentFactory';
import { AgentRegistry } from './AgentRegistry';
import { AgentLifecycle } from './AgentLifecycle';
import { AgentEvents } from './AgentEvents';
import { AgentLogger } from './AgentLogger';
import { RuntimeRepository } from '../repositories/RuntimeRepository';
import type { AgentMessage } from '../types/AgentMessage';

/**
 * Lifecycle operations for runtime agents (start/stop/pause/resume/restart).
 */
export class AgentManager {
  private static instance: AgentManager;
  private registry = AgentRegistry.getInstance();
  private runtimeRepo = RuntimeRepository.getInstance();
  private events = AgentEvents.getInstance();
  private logger = AgentLogger.getInstance();
  private seeded = false;

  private constructor() {}

  public static getInstance(): AgentManager {
    if (!AgentManager.instance) AgentManager.instance = new AgentManager();
    return AgentManager.instance;
  }

  public ensureSeeded(): void {
    if (this.seeded || this.registry.getAll().length > 0) {
      this.seeded = true;
      return;
    }

    const blueprints: CreateRuntimeAgentInput[] = [
      {
        name: 'CEO Runtime Worker',
        role: 'Executive Director',
        description: 'Runtime shell for executive coordination tasks.',
        capabilities: ['Analyze Data', 'Read Reports', 'Generate Prompt', 'Call AI Engine', 'Report Progress'],
        skills: ['orchestration', 'review', 'delegation'],
      },
      {
        name: 'SEO Runtime Worker',
        role: 'SEO Specialist',
        description: 'Runtime shell for SEO-assigned work (no SEO logic in runtime).',
        capabilities: ['Website Scan', 'Read Reports', 'Analyze Data', 'Load Memory', 'Call AI Engine'],
        skills: ['context-loading', 'reporting'],
      },
      {
        name: 'Website Runtime Worker',
        role: 'Website Auditor',
        description: 'Runtime shell for website audit assignments.',
        capabilities: ['Website Scan', 'Read Database', 'Read Reports', 'Load Memory', 'Call AI Engine'],
        skills: ['health-check', 'reporting'],
      },
      {
        name: 'Growth Runtime Worker',
        role: 'Growth Marketing',
        description: 'Runtime shell for growth-assigned work.',
        capabilities: ['Analyze Data', 'Write Content', 'Send Email', 'Call AI Engine', 'Report Progress'],
        skills: ['funnel-analysis', 'reporting'],
      },
    ];

    for (const bp of blueprints) {
      const agent = AgentFactory.create(bp);
      this.registry.register(agent);
      this.events.emit('agent_registered', `Registered ${agent.name}`, {
        agentId: agent.id,
        agentName: agent.name,
      });
    }
    this.seeded = true;
    this.logger.info(`Seeded ${blueprints.length} runtime workers`, 'AgentManager');
  }

  public createAgent(input: CreateRuntimeAgentInput): RuntimeAgent {
    const agent = AgentFactory.create(input);
    this.registry.register(agent);
    this.events.emit('agent_registered', `Registered ${agent.name}`, {
      agentId: agent.id,
      agentName: agent.name,
    });
    return agent;
  }

  public listAgents(): RuntimeAgent[] {
    this.ensureSeeded();
    return this.registry.getAll();
  }

  public getAgent(id: string): RuntimeAgent | undefined {
    return this.registry.get(id);
  }

  public async startAgent(id: string): Promise<RuntimeAgent> {
    const agent = this.require(id);

    if (agent.status === 'Idle' || agent.status === 'Busy' || agent.status === 'Waiting') {
      return agent;
    }

    if (agent.status === 'Paused') {
      AgentLifecycle.assertTransition('Paused', 'Idle');
      agent.status = 'Idle';
    } else {
      if (agent.status !== 'Starting') {
        AgentLifecycle.assertTransition(
          agent.status === 'Offline' ||
            agent.status === 'Error' ||
            agent.status === 'Recovering' ||
            agent.status === 'Completed'
            ? agent.status
            : 'Offline',
          'Starting'
        );
        agent.status = 'Starting';
        this.registry.update(agent);
        await this.delay(180);
      }
      AgentLifecycle.assertTransition('Starting', 'Idle');
      agent.status = 'Idle';
    }

    agent.missedHeartbeats = 0;
    agent.health = 'healthy';
    agent.lastActivity = new Date().toISOString();
    agent.lastHeartbeat = new Date().toISOString();
    this.registry.update(agent);
    this.emitLifecycle(agent, 'agent_started', `${agent.name} started`);
    this.message(agent, 'lifecycle', 'Started', 'Agent entered Idle');
    return agent;
  }

  public async stopAgent(id: string): Promise<RuntimeAgent> {
    const agent = this.require(id);
    agent.status = 'Offline';
    agent.currentTaskId = undefined;
    agent.currentTaskTitle = undefined;
    agent.queueLength = 0;
    agent.cpuUsage = 0;
    agent.memoryUsage = 0;
    agent.health = 'unknown';
    agent.lastActivity = new Date().toISOString();
    this.registry.update(agent);
    this.emitLifecycle(agent, 'agent_stopped', `${agent.name} stopped`);
    this.message(agent, 'lifecycle', 'Stopped', 'Agent offline');
    return agent;
  }

  public async restartAgent(id: string): Promise<RuntimeAgent> {
    await this.stopAgent(id);
    const agent = await this.startAgent(id);
    this.events.emit('agent_restarted', `${agent.name} restarted`, {
      agentId: agent.id,
      agentName: agent.name,
    });
    return agent;
  }

  public async pauseAgent(id: string): Promise<RuntimeAgent> {
    const agent = this.require(id);
    const from =
      agent.status === 'Busy' || agent.status === 'Idle' || agent.status === 'Waiting'
        ? agent.status
        : 'Idle';
    AgentLifecycle.assertTransition(from, 'Paused');
    agent.status = 'Paused';
    agent.lastActivity = new Date().toISOString();
    this.registry.update(agent);
    this.emitLifecycle(agent, 'agent_paused', `${agent.name} paused`);
    this.message(agent, 'lifecycle', 'Paused', 'Agent paused');
    return agent;
  }

  public async resumeAgent(id: string): Promise<RuntimeAgent> {
    const agent = this.require(id);
    AgentLifecycle.assertTransition('Paused', 'Idle');
    agent.status = 'Idle';
    agent.lastActivity = new Date().toISOString();
    this.registry.update(agent);
    this.emitLifecycle(agent, 'agent_resumed', `${agent.name} resumed`);
    this.message(agent, 'lifecycle', 'Resumed', 'Agent idle');
    return agent;
  }

  /** Used by supervisor auto-recovery. */
  public async recoverAgent(id: string): Promise<RuntimeAgent> {
    const agent = this.require(id);
    agent.status = 'Recovering';
    this.registry.update(agent);
    await this.delay(250);
    agent.status = 'Idle';
    agent.missedHeartbeats = 0;
    agent.health = 'healthy';
    agent.currentTaskId = undefined;
    agent.currentTaskTitle = undefined;
    agent.lastActivity = new Date().toISOString();
    agent.lastHeartbeat = new Date().toISOString();
    this.registry.update(agent);
    this.emitLifecycle(agent, 'agent_recovering', `${agent.name} recovered to Idle`);
    return agent;
  }

  private require(id: string): RuntimeAgent {
    const agent = this.registry.get(id);
    if (!agent) throw new Error(`Runtime agent ${id} not found`);
    return agent;
  }

  private emitLifecycle(
    agent: RuntimeAgent,
    type: 'agent_started' | 'agent_stopped' | 'agent_paused' | 'agent_resumed' | 'agent_recovering',
    message: string
  ): void {
    this.events.emit(type, message, { agentId: agent.id, agentName: agent.name });
    this.logger.info(message, 'AgentManager', { agentId: agent.id });
  }

  private message(
    agent: RuntimeAgent,
    kind: AgentMessage['kind'],
    subject: string,
    body: string
  ): void {
    this.runtimeRepo.addMessage({
      id: `amsg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      agentId: agent.id,
      kind,
      subject,
      body,
      timestamp: new Date().toISOString(),
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
  }
}
