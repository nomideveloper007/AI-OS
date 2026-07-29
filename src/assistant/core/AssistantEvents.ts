type EventCallback = (...args: any[]) => void;

export class AssistantEvents {
  private static instance: AssistantEvents;
  private listeners: Map<string, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): AssistantEvents {
    if (!AssistantEvents.instance) {
      AssistantEvents.instance = new AssistantEvents();
    }
    return AssistantEvents.instance;
  }

  public on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off(event: string, callback: EventCallback): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (err) {
          console.error(`Error in assistant event listener for "${event}":`, err);
        }
      });
    }
  }
}
