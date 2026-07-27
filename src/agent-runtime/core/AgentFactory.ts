import type { CreateRuntimeAgentInput, RuntimeAgent } from '../types/Agent';
import type { AgentRuntimeCapability } from '../types/AgentCapability';

const DEFAULT_CAPABILITIES: AgentRuntimeCapability[] = [
  'Analyze Data',
  'Read Reports',
  'Load Memory',
  'Call AI Engine',
  'Report Progress',
];

export class AgentFactory {
  public static create(input: CreateRuntimeAgentInput): RuntimeAgent {
    const now = new Date().toISOString();
    return {
      id: input.id || `rt-agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      role: input.role,
      description: input.description?.trim() || `${input.name} runtime worker`,
      capabilities: input.capabilities?.length ? input.capabilities : DEFAULT_CAPABILITIES,
      skills: input.skills?.length ? input.skills : ['task-execution', 'context-loading', 'reporting'],
      queueLength: 0,
      health: 'unknown',
      cpuUsage: 0,
      memoryUsage: 0,
      status: 'Offline',
      lastActivity: now,
      tasksCompleted: 0,
      tasksFailed: 0,
      averageExecutionTimeMs: 0,
      totalExecutionTimeMs: 0,
      crashCount: 0,
      missedHeartbeats: 0,
      maxConcurrent: input.maxConcurrent ?? 1,
      timeoutMs: input.timeoutMs ?? 45000,
      autoRecover: input.autoRecover ?? true,
      linkedRegistryAgentId: input.linkedRegistryAgentId,
      createdAt: now,
      updatedAt: now,
    };
  }
}
