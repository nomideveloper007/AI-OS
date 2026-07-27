import type { AgentRuntimeStatus } from '../types/AgentStatus';

const TRANSITIONS: Record<AgentRuntimeStatus, AgentRuntimeStatus[]> = {
  Offline: ['Starting'],
  Starting: ['Idle', 'Error', 'Offline'],
  Idle: ['Busy', 'Waiting', 'Paused', 'Offline', 'Starting'],
  Busy: ['Idle', 'Waiting', 'Paused', 'Completed', 'Error', 'Recovering'],
  Waiting: ['Idle', 'Busy', 'Paused', 'Offline', 'Error'],
  Paused: ['Idle', 'Busy', 'Offline', 'Recovering'],
  Completed: ['Idle', 'Offline'],
  Error: ['Recovering', 'Offline', 'Idle'],
  Recovering: ['Idle', 'Error', 'Offline', 'Starting'],
};

export class AgentLifecycle {
  public static canTransition(from: AgentRuntimeStatus, to: AgentRuntimeStatus): boolean {
    if (from === to) return true;
    return (TRANSITIONS[from] || []).includes(to);
  }

  public static assertTransition(from: AgentRuntimeStatus, to: AgentRuntimeStatus): void {
    if (!AgentLifecycle.canTransition(from, to)) {
      throw new Error(`Invalid agent lifecycle transition: ${from} → ${to}`);
    }
  }

  public static isRunnable(status: AgentRuntimeStatus): boolean {
    return status === 'Idle' || status === 'Waiting' || status === 'Busy';
  }

  public static isOnline(status: AgentRuntimeStatus): boolean {
    return status !== 'Offline';
  }

  public static isActiveWork(status: AgentRuntimeStatus): boolean {
    return status === 'Busy' || status === 'Starting' || status === 'Recovering';
  }

  public static label(status: AgentRuntimeStatus): string {
    return status;
  }
}
