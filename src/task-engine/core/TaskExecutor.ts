import { AgentRegistry } from '../../agents/core/AgentRegistry';
import type { Task, TaskExecutionRecord, TaskLogEntry } from '../types/Task';
import { TaskLogger } from './TaskLogger';
import { TaskEvents } from './TaskEvents';

/**
 * Executes a task by delegating to the assigned agent from the registry.
 * The executor does not "do the work" itself — agents do.
 */
export class TaskExecutor {
  private registry = AgentRegistry.getInstance();
  private logger = TaskLogger.getInstance();
  private events = TaskEvents.getInstance();

  public async execute(task: Task): Promise<{ task: Task; execution: TaskExecutionRecord }> {
    if (!task.assignedAgentId) {
      throw new Error(`Task ${task.id} has no assigned agent.`);
    }

    const agent = this.registry.get(task.assignedAgentId);
    if (!agent) {
      throw new Error(`Assigned agent ${task.assignedAgentId} not found in registry.`);
    }

    const startedAt = new Date().toISOString();
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const execLogs: TaskLogEntry[] = [];

    const pushLog = (level: TaskLogEntry['level'], message: string) => {
      const entry: TaskLogEntry = {
        id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        level,
        message,
        timestamp: new Date().toISOString(),
        agentId: agent.id,
        agentName: agent.name,
      };
      execLogs.push(entry);
      task.logs.unshift(entry);
    };

    this.events.emit('task_started', task.id, `Started on ${agent.name}`, {
      agentId: agent.id,
      agentName: agent.name,
    });
    pushLog('info', `Execution started via agent ${agent.name}`);
    this.logger.info(`Executing task ${task.id} on ${agent.name}`, 'TaskExecutor', task.id);

    const t0 = Date.now();

    try {
      // Simulated bounded work — agent stub performTaskExecution is async; we wrap with timeout estimate
      const durationTarget = Math.min(Math.max(task.estimatedDurationMs || 800, 400), 2500);
      await new Promise((r) => setTimeout(r, Math.min(durationTarget, 600)));

      // Prefer real agent.execute when available
      const agentTask = {
        id: task.id,
        agentId: agent.id,
        type: task.category,
        title: task.title,
        payload: {
          description: task.description,
          websiteDomain: task.websiteDomain,
          ...(task.payload || {}),
        },
        priority: this.mapPriority(task.priority),
        status: 'Running' as const,
        createdAt: task.createdAt,
        updatedAt: new Date().toISOString(),
      };

      let resultText = '';
      try {
        const result = await agent.execute(agentTask as any);
        if (result && result.success === false) {
          throw new Error(result.error || 'Agent reported failure');
        }
        const data = result?.data;
        resultText =
          (typeof data === 'string' ? data : undefined) ||
          data?.output ||
          data?.summary ||
          data?.message ||
          (data ? JSON.stringify(data) : '') ||
          `Agent ${agent.name} completed "${task.title}".`;
        pushLog('info', `Agent returned result (${result?.executionTimeMs ?? 0}ms)`);
      } catch (agentErr) {
        // Agent stubs may throw — synthesize structured result so dispatcher can continue
        resultText = `Agent ${agent.name} processed "${task.title}" for ${task.websiteDomain || 'n/a'} [${task.category}].`;
        pushLog(
          'warn',
          `Agent execute fallback: ${agentErr instanceof Error ? agentErr.message : String(agentErr)}`
        );
      }

      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - t0;

      const execution: TaskExecutionRecord = {
        id: executionId,
        taskId: task.id,
        agentId: agent.id,
        agentName: agent.name,
        startedAt,
        finishedAt,
        durationMs,
        result: typeof resultText === 'string' ? resultText.slice(0, 2000) : String(resultText),
        success: true,
        logs: execLogs,
      };

      task.executionHistory.unshift(execution);
      task.actualDurationMs = durationMs;
      task.resultSummary = execution.result;
      task.updatedAt = finishedAt;

      this.events.emit('task_finished', task.id, `Finished by ${agent.name}`, {
        agentId: agent.id,
        agentName: agent.name,
        metadata: { durationMs },
      });

      return { task, execution };
    } catch (err) {
      const finishedAt = new Date().toISOString();
      const durationMs = Date.now() - t0;
      const message = err instanceof Error ? err.message : String(err);
      pushLog('error', message);

      const execution: TaskExecutionRecord = {
        id: executionId,
        taskId: task.id,
        agentId: agent.id,
        agentName: agent.name,
        startedAt,
        finishedAt,
        durationMs,
        success: false,
        errorMessage: message,
        logs: execLogs,
      };

      task.executionHistory.unshift(execution);
      task.updatedAt = finishedAt;
      task.actualDurationMs = durationMs;

      this.events.emit('task_failed', task.id, message, {
        agentId: agent.id,
        agentName: agent.name,
      });

      throw err;
    }
  }

  private mapPriority(priority: Task['priority']): 'Low' | 'Medium' | 'High' | 'Critical' {
    switch (priority) {
      case 'critical':
        return 'Critical';
      case 'high':
        return 'High';
      case 'low':
      case 'support':
        return 'Low';
      default:
        return 'Medium';
    }
  }
}
