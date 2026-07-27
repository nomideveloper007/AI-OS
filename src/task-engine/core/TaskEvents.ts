export type TaskEventType =
  | 'task_created'
  | 'task_assigned'
  | 'task_queued'
  | 'task_started'
  | 'task_finished'
  | 'task_failed'
  | 'task_cancelled'
  | 'task_paused'
  | 'task_resumed'
  | 'approval_requested'
  | 'approval_granted'
  | 'approval_rejected'
  | 'task_retried';

export interface TaskEvent {
  id: string;
  type: TaskEventType;
  taskId: string;
  timestamp: string;
  message: string;
  agentId?: string;
  agentName?: string;
  metadata?: Record<string, unknown>;
}

type Listener = (event: TaskEvent) => void;

export class TaskEvents {
  private static instance: TaskEvents;
  private events: TaskEvent[] = [];
  private listeners = new Set<Listener>();
  private maxEvents = 500;

  private constructor() {}

  public static getInstance(): TaskEvents {
    if (!TaskEvents.instance) TaskEvents.instance = new TaskEvents();
    return TaskEvents.instance;
  }

  public emit(
    type: TaskEventType,
    taskId: string,
    message: string,
    extras?: { agentId?: string; agentName?: string; metadata?: Record<string, unknown> }
  ): TaskEvent {
    const event: TaskEvent = {
      id: `tevt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      taskId,
      timestamp: new Date().toISOString(),
      message,
      agentId: extras?.agentId,
      agentName: extras?.agentName,
      metadata: extras?.metadata,
    };
    this.events.unshift(event);
    if (this.events.length > this.maxEvents) this.events.pop();
    this.listeners.forEach((l) => l(event));
    return event;
  }

  public getEvents(taskId?: string): TaskEvent[] {
    if (!taskId) return [...this.events];
    return this.events.filter((e) => e.taskId === taskId);
  }

  public clear(): void {
    this.events = [];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
