export type CEOEventType = 
  | 'analysis_started'
  | 'scanner_loaded'
  | 'memory_loaded'
  | 'ai_completed'
  | 'report_generated'
  | 'tasks_generated'
  | 'waiting_approval'
  | 'analysis_error';

export interface CEOEvent {
  id: string;
  type: CEOEventType;
  payload?: any;
  timestamp: string;
}

export class CEOEvents {
  private static listeners: Set<(evt: CEOEvent) => void> = new Set();

  public static emit(type: CEOEventType, payload?: any): void {
    const evt: CEOEvent = {
      id: `ceoevt-${Date.now()}`,
      type,
      payload,
      timestamp: new Date().toISOString()
    };
    CEOEvents.listeners.forEach((fn) => fn(evt));
  }

  public static subscribe(fn: (evt: CEOEvent) => void): () => void {
    CEOEvents.listeners.add(fn);
    return () => CEOEvents.listeners.delete(fn);
  }
}
