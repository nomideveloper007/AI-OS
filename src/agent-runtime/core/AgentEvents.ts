export type AgentRuntimeEventType =
  | 'agent_registered'
  | 'agent_started'
  | 'agent_stopped'
  | 'agent_restarted'
  | 'agent_paused'
  | 'agent_resumed'
  | 'agent_heartbeat'
  | 'agent_health'
  | 'agent_crash'
  | 'agent_recovering'
  | 'execution_queued'
  | 'execution_started'
  | 'execution_progress'
  | 'execution_completed'
  | 'execution_failed'
  | 'task_engine_notified'
  | 'runtime_ready';

export interface AgentRuntimeEvent {
  id: string;
  type: AgentRuntimeEventType;
  agentId?: string;
  agentName?: string;
  executionId?: string;
  taskId?: string;
  message: string;
  progress?: number;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

type Listener = (event: AgentRuntimeEvent) => void;

export class AgentEvents {
  private static instance: AgentEvents;
  private events: AgentRuntimeEvent[] = [];
  private listeners = new Set<Listener>();
  private maxEvents = 500;

  private constructor() {}

  public static getInstance(): AgentEvents {
    if (!AgentEvents.instance) AgentEvents.instance = new AgentEvents();
    return AgentEvents.instance;
  }

  public emit(
    type: AgentRuntimeEventType,
    message: string,
    extras?: {
      agentId?: string;
      agentName?: string;
      executionId?: string;
      taskId?: string;
      progress?: number;
      metadata?: Record<string, unknown>;
    }
  ): AgentRuntimeEvent {
    const event: AgentRuntimeEvent = {
      id: `arev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      agentId: extras?.agentId,
      agentName: extras?.agentName,
      executionId: extras?.executionId,
      taskId: extras?.taskId,
      progress: extras?.progress,
      metadata: extras?.metadata,
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) this.events.pop();
    this.listeners.forEach((l) => l(event));
    return event;
  }

  public getEvents(agentId?: string): AgentRuntimeEvent[] {
    if (!agentId) return [...this.events];
    return this.events.filter((e) => e.agentId === agentId);
  }

  public clear(): void {
    this.events = [];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
