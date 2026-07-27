import type { CreateRuntimeAgentInput, RuntimeAgent } from '../types/Agent';
import type { RuntimeTaskInput, AgentExecution } from '../types/AgentExecution';
import { AgentManager } from './AgentManager';
import { AgentScheduler } from './AgentScheduler';
import { AgentHeartbeatService } from './AgentHeartbeat';
import { AgentSupervisor } from './AgentSupervisor';
import { AgentEvents } from './AgentEvents';
import { AgentLogger } from './AgentLogger';
import { AgentMetrics, type AgentRuntimeMetricsSnapshot } from './AgentMetrics';
import { AgentHealth } from './AgentHealth';
import { RuntimeRepository } from '../repositories/RuntimeRepository';

/**
 * Agent Runtime facade — OS layer where every AI employee lives and executes work.
 * Task Engine → Agent Runtime → AI Engine → Memory → Reports
 */
export class AgentRuntime {
  private static instance: AgentRuntime;
  private manager = AgentManager.getInstance();
  private scheduler = new AgentScheduler();
  private heartbeat = AgentHeartbeatService.getInstance();
  private supervisor = AgentSupervisor.getInstance();
  private events = AgentEvents.getInstance();
  private logger = AgentLogger.getInstance();
  private runtimeRepo = RuntimeRepository.getInstance();
  private bootstrapped = false;

  private constructor() {
    this.logger.info('Agent Runtime ready', 'AgentRuntime');
  }

  public static getInstance(): AgentRuntime {
    if (!AgentRuntime.instance) AgentRuntime.instance = new AgentRuntime();
    return AgentRuntime.instance;
  }

  /** Boot runtime services: seed workers, heartbeats, supervisor. */
  public bootstrap(): void {
    if (this.bootstrapped) return;
    this.manager.ensureSeeded();
    this.supervisor.setRecoverHandler((id) => this.manager.recoverAgent(id).then(() => undefined));
    this.heartbeat.start(4000);
    this.supervisor.start(6000);
    this.bootstrapped = true;
    this.events.emit('runtime_ready', 'Agent Runtime services online');
    this.logger.info('Agent Runtime bootstrapped', 'AgentRuntime');
  }

  public createAgent(input: CreateRuntimeAgentInput): RuntimeAgent {
    this.bootstrap();
    return this.manager.createAgent(input);
  }

  public listAgents(): RuntimeAgent[] {
    this.bootstrap();
    return this.manager.listAgents();
  }

  public getAgent(id: string): RuntimeAgent | undefined {
    this.bootstrap();
    return this.manager.getAgent(id);
  }

  public async startAgent(id: string) {
    this.bootstrap();
    return this.manager.startAgent(id);
  }

  public async stopAgent(id: string) {
    this.bootstrap();
    return this.manager.stopAgent(id);
  }

  public async restartAgent(id: string) {
    this.bootstrap();
    return this.manager.restartAgent(id);
  }

  public async pauseAgent(id: string) {
    this.bootstrap();
    return this.manager.pauseAgent(id);
  }

  public async resumeAgent(id: string) {
    this.bootstrap();
    return this.manager.resumeAgent(id);
  }

  public async startAll(): Promise<RuntimeAgent[]> {
    this.bootstrap();
    const results: RuntimeAgent[] = [];
    for (const a of this.manager.listAgents()) {
      results.push(await this.manager.startAgent(a.id));
    }
    return results;
  }

  /**
   * Receive a task from Task Engine (or demo UI) without modifying Task Engine code.
   * Validates → loads context → AI Engine → stores log → emits Task Engine notification event.
   */
  public async receiveTask(input: RuntimeTaskInput, agentId?: string): Promise<AgentExecution> {
    this.bootstrap();
    const agents = this.manager.listAgents();
    const online = agents.filter((a) => a.status !== 'Offline' && a.status !== 'Paused');
    if (online.length === 0) {
      await this.startAll();
    }
    return this.scheduler.runNow(input, agentId);
  }

  public enqueueTask(input: RuntimeTaskInput, agentId?: string): string {
    this.bootstrap();
    return this.scheduler.enqueue(input, agentId);
  }

  public async processQueue(): Promise<number> {
    this.bootstrap();
    return this.scheduler.dispatchAll();
  }

  public getMetrics(): AgentRuntimeMetricsSnapshot {
    this.bootstrap();
    return AgentMetrics.compute(this.manager.listAgents(), this.runtimeRepo.listExecutions());
  }

  public getHealth(agentId?: string) {
    this.bootstrap();
    const agents = agentId
      ? [this.manager.getAgent(agentId)].filter(Boolean)
      : this.manager.listAgents();
    return agents.map((a) => ({ agent: a!, health: AgentHealth.evaluate(a!) }));
  }

  public getExecutions(agentId?: string) {
    this.bootstrap();
    return this.runtimeRepo.listExecutions(agentId);
  }

  public getMessages(agentId?: string) {
    this.bootstrap();
    return this.runtimeRepo.listMessages(agentId);
  }

  public getEvents(agentId?: string) {
    return this.events.getEvents(agentId);
  }

  public getLogs(agentId?: string) {
    return this.logger.getLogs(agentId);
  }

  public getHeartbeats(agentId?: string) {
    return this.runtimeRepo.listHeartbeats(agentId);
  }

  public getPendingCount(): number {
    return this.scheduler.listPending().length;
  }

  public subscribe(listener: Parameters<AgentEvents['subscribe']>[0]) {
    return this.events.subscribe(listener);
  }

  /** Demo pipeline: start fleet + run sample tasks through the runtime shell. */
  public async seedDemo(): Promise<{ agents: number; executions: number }> {
    this.bootstrap();
    await this.startAll();
    const agents = this.manager.listAgents();
    const samples: RuntimeTaskInput[] = [
      {
        taskId: `demo-task-${Date.now()}-1`,
        title: 'Runtime health probe',
        description: 'Validate agent runtime can load context and call AI Engine.',
        category: 'operations',
        priority: 'high',
        agentId: agents[0]?.id,
      },
      {
        taskId: `demo-task-${Date.now()}-2`,
        title: 'Memory + website context smoke test',
        description: 'Exercise memory and website context loaders inside the runtime.',
        category: 'operations',
        priority: 'medium',
        websiteDomain: 'example.com',
        agentId: agents[1]?.id || agents[0]?.id,
      },
      {
        taskId: `demo-task-${Date.now()}-3`,
        title: 'Progress event walkthrough',
        description: 'Emit 0→100% progress events for monitoring UI.',
        category: 'operations',
        priority: 'low',
        agentId: agents[2]?.id || agents[0]?.id,
      },
    ];

    let executions = 0;
    for (const sample of samples) {
      try {
        await this.receiveTask(sample, sample.agentId);
        executions += 1;
      } catch (err) {
        this.logger.warn(
          `Demo task failed: ${err instanceof Error ? err.message : String(err)}`,
          'AgentRuntime'
        );
      }
    }

    return { agents: agents.length, executions };
  }
}
