import { IAgent, IAgentLog, IAgentTimelineEvent, IAgentMetricsData } from '../interfaces/IAgent';
import { IAgentTask } from '../interfaces/IAgentTask';
import { IAgentResult } from '../interfaces/IAgentResult';
import { IAgentContext } from '../interfaces/IAgentContext';
import { AgentStatus } from '../types/AgentStatus';
import { AgentPriority } from '../types/AgentPriority';
import { AgentRole } from '../types/AgentRole';
import { AgentCapability } from '../types/AgentCapabilities';

export abstract class BaseAgent implements IAgent {
  public id: string;
  public name: string;
  public description: string;
  public role: AgentRole;
  public status: AgentStatus = 'Idle';
  public priority: AgentPriority;
  public capabilities: AgentCapability[];
  public createdAt: string;
  public updatedAt: string;

  protected context: IAgentContext;
  protected logsList: IAgentLog[] = [];
  protected timelineEvents: IAgentTimelineEvent[] = [];
  protected metrics: IAgentMetricsData = {
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    totalDurationMs: 0,
    averageDurationMs: 0
  };

  constructor(config: {
    id?: string;
    name: string;
    description: string;
    role: AgentRole;
    priority?: AgentPriority;
    capabilities?: AgentCapability[];
  }) {
    const now = new Date().toISOString();
    this.id = config.id || `agent-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    this.name = config.name;
    this.description = config.description;
    this.role = config.role;
    this.priority = config.priority || 'Medium';
    this.capabilities = config.capabilities || ['Analyze Data', 'Read Reports'];
    this.createdAt = now;
    this.updatedAt = now;

    this.context = {
      workspaceId: 'default-workspace',
      environment: 'production',
      sharedMemory: {},
      sessionTokens: 0
    };

    this.recordTimelineEvent('Created', `Agent ${this.name} initialized in framework.`);
    this.log('info', `Agent ${this.name} (${this.id}) instantiated.`);
  }

  public async initialize(context?: Partial<IAgentContext>): Promise<void> {
    if (context) {
      this.context = { ...this.context, ...context };
    }
    this.status = 'Idle';
    this.updatedAt = new Date().toISOString();
    this.log('info', `Agent ${this.name} initialized context.`);
  }

  public async start(): Promise<void> {
    this.status = 'Running';
    this.updatedAt = new Date().toISOString();
    this.recordTimelineEvent('Started', `Agent ${this.name} started execution state.`);
    this.log('info', `Agent ${this.name} started.`);
  }

  public async pause(): Promise<void> {
    this.status = 'Paused';
    this.updatedAt = new Date().toISOString();
    this.recordTimelineEvent('Paused', `Agent ${this.name} paused.`);
    this.log('warn', `Agent ${this.name} paused.`);
  }

  public async resume(): Promise<void> {
    this.status = 'Running';
    this.updatedAt = new Date().toISOString();
    this.recordTimelineEvent('Resumed', `Agent ${this.name} resumed execution.`);
    this.log('info', `Agent ${this.name} resumed.`);
  }

  public async stop(): Promise<void> {
    this.status = 'Stopped';
    this.updatedAt = new Date().toISOString();
    this.recordTimelineEvent('Stopped', `Agent ${this.name} stopped by administrator.`);
    this.log('warn', `Agent ${this.name} stopped.`);
  }

  public async execute(task: IAgentTask): Promise<IAgentResult> {
    const startTime = Date.now();
    this.status = 'Running';
    this.log('info', `Executing task: ${task.title} (${task.id})`);

    try {
      // Framework Base Execution Architecture
      const result = await this.performTaskExecution(task);
      const duration = Date.now() - startTime;

      this.metrics.executionCount += 1;
      this.metrics.successCount += 1;
      this.metrics.totalDurationMs += duration;
      this.metrics.averageDurationMs = Math.round(this.metrics.totalDurationMs / this.metrics.executionCount);
      this.metrics.lastExecutionTime = new Date().toISOString();

      this.status = 'Completed';
      this.recordTimelineEvent('Completed', `Task ${task.title} executed successfully.`);
      this.log('info', `Task ${task.title} completed in ${duration}ms.`);

      return {
        taskId: task.id,
        agentId: this.id,
        success: true,
        data: result,
        executionTimeMs: duration,
        timestamp: new Date().toISOString()
      };
    } catch (err: any) {
      const duration = Date.now() - startTime;
      this.metrics.executionCount += 1;
      this.metrics.failureCount += 1;
      this.status = 'Failed';

      this.recordTimelineEvent('Failed', `Task ${task.title} failed: ${err.message}`);
      this.log('error', `Task ${task.title} failed: ${err.message}`);

      return {
        taskId: task.id,
        agentId: this.id,
        success: false,
        error: err.message,
        executionTimeMs: duration,
        timestamp: new Date().toISOString()
      };
    }
  }

  protected abstract performTaskExecution(task: IAgentTask): Promise<any>;

  public async cancel(taskId: string): Promise<void> {
    this.log('warn', `Task ${taskId} cancelled.`);
  }

  public validate(): boolean {
    return Boolean(this.id && this.name && this.role);
  }

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, any>): void {
    const entry: IAgentLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      level,
      message,
      timestamp: new Date().toLocaleTimeString(),
      metadata
    };
    this.logsList.unshift(entry);
    if (this.logsList.length > 100) this.logsList.pop();
  }

  public report(): Record<string, any> {
    return {
      agentId: this.id,
      name: this.name,
      role: this.role,
      status: this.status,
      metrics: this.metrics,
      logsCount: this.logsList.length,
      timelineEventsCount: this.timelineEvents.length
    };
  }

  public async cleanup(): Promise<void> {
    this.status = 'Idle';
    this.log('info', `Agent ${this.name} cleaned up resources.`);
  }

  public getLogs(): IAgentLog[] {
    return [...this.logsList];
  }

  public getTimeline(): IAgentTimelineEvent[] {
    return [...this.timelineEvents];
  }

  public getMetrics(): IAgentMetricsData {
    return { ...this.metrics };
  }

  protected recordTimelineEvent(event: 'Created' | 'Started' | 'Paused' | 'Resumed' | 'Stopped' | 'Completed' | 'Failed', details: string): void {
    this.timelineEvents.unshift({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      event,
      details,
      timestamp: new Date().toLocaleTimeString()
    });
  }
}
