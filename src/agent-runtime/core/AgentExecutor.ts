import { AIEngine } from '../../ai/core/AIEngine';
import { MemoryEngine } from '../../memory/core/MemoryEngine';
import { WebsiteIntelligenceEngine } from '../../intelligence/core/WebsiteIntelligenceEngine';
import { AgentRegistry } from './AgentRegistry';
import { AgentLifecycle } from './AgentLifecycle';
import { AgentEvents } from './AgentEvents';
import { AgentLogger } from './AgentLogger';
import { RuntimeRepository } from '../repositories/RuntimeRepository';
import type { RuntimeAgent } from '../types/Agent';
import type {
  AgentExecution,
  AgentExecutionLogEntry,
  AgentProgressPercent,
  RuntimeTaskInput,
} from '../types/AgentExecution';
import type { AgentMessage } from '../types/AgentMessage';

const PROGRESS_STEPS: AgentProgressPercent[] = [0, 10, 25, 50, 75, 100];

/**
 * Runtime execution pipeline:
 * Task Engine payload → validate → Memory → Website Context → AI Engine → result → notify.
 * Does not implement SEO/content domain logic — only the OS execution shell.
 */
export class AgentExecutor {
  private registry = AgentRegistry.getInstance();
  private runtimeRepo = RuntimeRepository.getInstance();
  private events = AgentEvents.getInstance();
  private logger = AgentLogger.getInstance();

  public async execute(agentId: string, input: RuntimeTaskInput): Promise<AgentExecution> {
    const agent = this.registry.get(agentId);
    if (!agent) throw new Error(`Runtime agent ${agentId} not found`);
    if (agent.status === 'Paused' || agent.status === 'Offline') {
      throw new Error(`Agent ${agent.name} cannot execute while ${agent.status}`);
    }

    const execution = this.createExecution(agent, input);
    this.runtimeRepo.saveExecution(execution);
    this.publishMessage(agent, {
      kind: 'task_received',
      subject: 'Task received',
      body: input.title,
      taskId: input.taskId,
      executionId: execution.id,
    });

    AgentLifecycle.assertTransition(agent.status === 'Idle' || agent.status === 'Waiting' ? agent.status : 'Idle', 'Busy');
    agent.status = 'Busy';
    agent.currentTaskId = input.taskId;
    agent.currentTaskTitle = input.title;
    agent.lastActivity = new Date().toISOString();
    this.registry.update(agent);

    this.events.emit('execution_started', `Execution started: ${input.title}`, {
      agentId: agent.id,
      agentName: agent.name,
      executionId: execution.id,
      taskId: input.taskId,
      progress: 0,
    });

    const timeoutMs = input.timeoutMs ?? agent.timeoutMs;
    const t0 = Date.now();

    try {
      await this.runWithTimeout(async () => {
        await this.setProgress(execution, agent, 0, 'queued', 'Task accepted by runtime');
        this.validateTask(input);
        await this.setProgress(execution, agent, 10, 'validating', 'Task validated');

        await this.setProgress(execution, agent, 25, 'loading_context', 'Loading Memory context');
        const memorySnippet = this.loadMemoryContext(input);
        execution.memoryContextLoaded = true;
        this.pushExecLog(execution, 'info', `Memory context loaded (${memorySnippet.length} chars)`, 25);

        await this.setProgress(execution, agent, 50, 'loading_context', 'Loading Website context');
        const websiteSnippet = this.loadWebsiteContext(input);
        execution.websiteContextLoaded = Boolean(websiteSnippet);
        this.pushExecLog(
          execution,
          'info',
          websiteSnippet ? 'Website context loaded' : 'No website context available',
          50
        );

        await this.setProgress(execution, agent, 75, 'calling_ai', 'Calling AI Engine');
        const aiResult = await this.callAIEngine(agent, input, memorySnippet, websiteSnippet);
        execution.promptSent = aiResult.prompt;
        execution.responseReceived = aiResult.response;
        execution.tokenUsage = aiResult.tokenUsage;
        this.pushExecLog(execution, 'info', 'AI Engine response received', 75, {
          tokens: aiResult.tokenUsage?.totalTokens,
          durationMs: aiResult.durationMs,
        });

        await this.setProgress(execution, agent, 100, 'finalizing', 'Finalizing structured result');
        execution.structuredResult = {
          summary: aiResult.response.slice(0, 1500),
          agentId: agent.id,
          agentName: agent.name,
          taskId: input.taskId,
          title: input.title,
          memoryUsed: execution.memoryContextLoaded,
          websiteContextUsed: execution.websiteContextLoaded,
          category: input.category || 'general',
          completedAt: new Date().toISOString(),
        };
        execution.status = 'completed';
        execution.finishedAt = new Date().toISOString();
        execution.durationMs = Date.now() - t0;
        this.runtimeRepo.saveExecution(execution);
      }, timeoutMs);

      this.recordSuccess(agent, execution);
      this.notifyTaskEngine(agent, execution, true);
      return execution;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const timedOut = /timeout/i.test(message);
      execution.status = timedOut ? 'timed_out' : 'failed';
      execution.errorMessage = message;
      execution.finishedAt = new Date().toISOString();
      execution.durationMs = Date.now() - t0;
      this.pushExecLog(execution, 'error', message, execution.progress);
      this.runtimeRepo.saveExecution(execution);
      this.recordFailure(agent, execution, message);
      this.notifyTaskEngine(agent, execution, false);
      throw err;
    }
  }

  private createExecution(agent: RuntimeAgent, input: RuntimeTaskInput): AgentExecution {
    return {
      id: `rex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      agentId: agent.id,
      agentName: agent.name,
      taskId: input.taskId,
      taskTitle: input.title,
      status: 'queued',
      progress: 0,
      websiteId: input.websiteId,
      websiteDomain: input.websiteDomain,
      memoryContextLoaded: false,
      websiteContextLoaded: false,
      startedAt: new Date().toISOString(),
      logs: [],
      notifiedTaskEngine: false,
    };
  }

  private validateTask(input: RuntimeTaskInput): void {
    if (!input.taskId?.trim()) throw new Error('Task id is required');
    if (!input.title?.trim()) throw new Error('Task title is required');
  }

  private loadMemoryContext(input: RuntimeTaskInput): string {
    try {
      const engine = MemoryEngine.getInstance();
      const query = [input.title, input.websiteDomain, input.category].filter(Boolean).join(' ');
      const memories = engine.searchMemories({ query: query || undefined }).slice(0, 5);
      if (memories.length === 0) return '';
      return memories
        .map((m) => `- ${m.title || m.id}: ${(m.content || m.description || '').slice(0, 180)}`)
        .join('\n');
    } catch {
      return '';
    }
  }

  private loadWebsiteContext(input: RuntimeTaskInput): string {
    if (!input.websiteId && !input.websiteDomain) return '';
    try {
      const engine = WebsiteIntelligenceEngine.getInstance();
      const ctx = input.websiteId ? engine.getLatestContext(input.websiteId) : undefined;
      if (!ctx) return input.websiteDomain ? `Domain: ${input.websiteDomain}` : '';
      return [
        `Domain: ${ctx.domain}`,
        `Scores: overall=${ctx.scores?.overall ?? 'n/a'} seo=${ctx.scores?.seo ?? 'n/a'}`,
        `Summary: ${ctx.summary?.headline || ctx.summary?.overview || ctx.domain}`,
      ]
        .filter(Boolean)
        .join('\n')
        .slice(0, 1200);
    } catch {
      return input.websiteDomain ? `Domain: ${input.websiteDomain}` : '';
    }
  }

  private async callAIEngine(
    agent: RuntimeAgent,
    input: RuntimeTaskInput,
    memorySnippet: string,
    websiteSnippet: string
  ): Promise<{
    prompt: string;
    response: string;
    durationMs: number;
    tokenUsage: { promptTokens: number; completionTokens: number; totalTokens: number };
  }> {
    const prompt = [
      `You are ${agent.name} (${agent.role}), an AI employee runtime worker.`,
      `Complete this operational task and return a concise structured summary.`,
      `Task: ${input.title}`,
      input.description ? `Description: ${input.description}` : '',
      input.category ? `Category: ${input.category}` : '',
      websiteSnippet ? `Website Context:\n${websiteSnippet}` : '',
      memorySnippet ? `Memory Context:\n${memorySnippet}` : '',
      `Do not invent SEO or content deliverables beyond a runtime execution summary.`,
    ]
      .filter(Boolean)
      .join('\n\n');

    this.logger.info('Prompt sent to AI Engine', 'AgentExecutor', {
      agentId: agent.id,
      metadata: { promptChars: prompt.length },
    });

    try {
      const ai = AIEngine.getInstance();
      const started = Date.now();
      const response = await ai.chat({
        messages: [
          {
            id: `msg-sys-${Date.now()}`,
            role: 'system',
            content: 'You are an AI OS runtime worker. Return a clear execution summary.',
            timestamp: new Date().toISOString(),
          },
          {
            id: `msg-usr-${Date.now()}`,
            role: 'user',
            content: prompt,
            timestamp: new Date().toISOString(),
          },
        ],
        metadata: { taskType: 'agent_runtime', agentId: agent.id, taskId: input.taskId },
      });
      const content =
        response.choices?.[0]?.message?.content?.trim() ||
        `Runtime completed "${input.title}" via ${agent.name}.`;
      return {
        prompt,
        response: content,
        durationMs: response.durationMs ?? Date.now() - started,
        tokenUsage: {
          promptTokens: response.usage?.promptTokens ?? 0,
          completionTokens: response.usage?.completionTokens ?? 0,
          totalTokens: response.usage?.totalTokens ?? 0,
        },
      };
    } catch (err) {
      // Runtime must stay usable offline / when AI is unavailable
      const fallback = [
        `Runtime execution summary for "${input.title}".`,
        `Agent: ${agent.name} (${agent.role})`,
        websiteSnippet ? 'Website context: loaded' : 'Website context: none',
        memorySnippet ? 'Memory context: loaded' : 'Memory context: none',
        `Note: AI Engine unavailable — ${err instanceof Error ? err.message : String(err)}`,
      ].join('\n');
      this.logger.warn('AI Engine call failed — using structured fallback', 'AgentExecutor', {
        agentId: agent.id,
        metadata: { error: err instanceof Error ? err.message : String(err) },
      });
      return {
        prompt,
        response: fallback,
        durationMs: 0,
        tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      };
    }
  }

  private async setProgress(
    execution: AgentExecution,
    agent: RuntimeAgent,
    progress: AgentProgressPercent,
    status: AgentExecution['status'],
    message: string
  ): Promise<void> {
    if (!PROGRESS_STEPS.includes(progress)) return;
    execution.progress = progress;
    execution.status = status;
    this.pushExecLog(execution, 'info', message, progress);
    this.runtimeRepo.saveExecution(execution);
    this.events.emit('execution_progress', message, {
      agentId: agent.id,
      agentName: agent.name,
      executionId: execution.id,
      taskId: execution.taskId,
      progress,
    });
    this.publishMessage(agent, {
      kind: 'progress',
      subject: `${progress}%`,
      body: message,
      progress,
      taskId: execution.taskId,
      executionId: execution.id,
    });
    await new Promise((r) => setTimeout(r, 40));
  }

  private pushExecLog(
    execution: AgentExecution,
    level: AgentExecutionLogEntry['level'],
    message: string,
    progress?: AgentProgressPercent,
    metadata?: Record<string, unknown>
  ): void {
    execution.logs.push({
      id: `rel-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      progress,
      metadata,
    });
  }

  private recordSuccess(agent: RuntimeAgent, execution: AgentExecution): void {
    const duration = execution.durationMs || 0;
    agent.tasksCompleted += 1;
    agent.totalExecutionTimeMs += duration;
    agent.averageExecutionTimeMs = Math.round(
      agent.totalExecutionTimeMs / Math.max(1, agent.tasksCompleted + agent.tasksFailed)
    );
    agent.currentTaskId = undefined;
    agent.currentTaskTitle = undefined;
    agent.queueLength = Math.max(0, agent.queueLength - 1);
    agent.status = 'Idle';
    agent.lastActivity = new Date().toISOString();
    agent.health = 'healthy';
    this.registry.update(agent);

    this.events.emit('execution_completed', `Completed: ${execution.taskTitle}`, {
      agentId: agent.id,
      agentName: agent.name,
      executionId: execution.id,
      taskId: execution.taskId,
      progress: 100,
      metadata: { durationMs: duration },
    });
    this.publishMessage(agent, {
      kind: 'result',
      subject: 'Execution completed',
      body: execution.structuredResult?.summary
        ? String(execution.structuredResult.summary).slice(0, 400)
        : 'ok',
      progress: 100,
      taskId: execution.taskId,
      executionId: execution.id,
    });
    this.logger.info(`Execution ${execution.id} completed`, 'AgentExecutor', {
      agentId: agent.id,
      executionId: execution.id,
    });
  }

  private recordFailure(agent: RuntimeAgent, execution: AgentExecution, message: string): void {
    const duration = execution.durationMs || 0;
    agent.tasksFailed += 1;
    agent.totalExecutionTimeMs += duration;
    agent.averageExecutionTimeMs = Math.round(
      agent.totalExecutionTimeMs / Math.max(1, agent.tasksCompleted + agent.tasksFailed)
    );
    agent.currentTaskId = undefined;
    agent.currentTaskTitle = undefined;
    agent.queueLength = Math.max(0, agent.queueLength - 1);
    agent.status = 'Error';
    agent.health = 'unhealthy';
    agent.lastActivity = new Date().toISOString();
    this.registry.update(agent);

    this.events.emit('execution_failed', message, {
      agentId: agent.id,
      agentName: agent.name,
      executionId: execution.id,
      taskId: execution.taskId,
    });
    this.publishMessage(agent, {
      kind: 'error',
      subject: 'Execution failed',
      body: message,
      taskId: execution.taskId,
      executionId: execution.id,
    });
    this.logger.error(message, 'AgentExecutor', { agentId: agent.id, executionId: execution.id });
  }

  private notifyTaskEngine(agent: RuntimeAgent, execution: AgentExecution, success: boolean): void {
    execution.notifiedTaskEngine = true;
    this.runtimeRepo.saveExecution(execution);
    this.events.emit(
      'task_engine_notified',
      `Task Engine notified (${success ? 'success' : 'failure'}) for ${execution.taskId}`,
      {
        agentId: agent.id,
        agentName: agent.name,
        executionId: execution.id,
        taskId: execution.taskId,
        metadata: {
          success,
          result: execution.structuredResult,
          error: execution.errorMessage,
        },
      }
    );
    this.publishMessage(agent, {
      kind: 'notify_task_engine',
      subject: success ? 'Notify Task Engine: success' : 'Notify Task Engine: failure',
      body: execution.taskId,
      taskId: execution.taskId,
      executionId: execution.id,
      metadata: { success },
    });
  }

  private publishMessage(
    agent: RuntimeAgent,
    partial: Omit<AgentMessage, 'id' | 'agentId' | 'timestamp'>
  ): void {
    this.runtimeRepo.addMessage({
      id: `amsg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      agentId: agent.id,
      timestamp: new Date().toISOString(),
      ...partial,
    });
  }

  private async runWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error(`Execution timeout after ${timeoutMs}ms`)), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
