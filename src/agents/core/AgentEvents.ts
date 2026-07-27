export type AgentEventType = 'agent_created' | 'agent_started' | 'agent_paused' | 'agent_stopped' | 'task_completed' | 'task_failed';

export interface AgentEvent {
  id: string;
  type: AgentEventType;
  agentId: string;
  payload?: any;
  timestamp: string;
}

export class AgentEvents {
  private static listeners: Set<(evt: AgentEvent) => void> = new Set();

  public static emit(type: AgentEventType, agentId: string, payload?: any): void {
    const evt: AgentEvent = {
      id: `evt-${Date.now()}`,
      type,
      agentId,
      payload,
      timestamp: new Date().toISOString()
    };
    AgentEvents.listeners.forEach((fn) => fn(evt));
  }

  public static subscribe(fn: (evt: AgentEvent) => void): () => void {
    AgentEvents.listeners.add(fn);
    return () => AgentEvents.listeners.delete(fn);
  }
}
