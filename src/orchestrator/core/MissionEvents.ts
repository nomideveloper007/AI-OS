import type { MissionStageId } from '../types/MissionStage';
import type { MissionStatus } from '../types/MissionStatus';

export type MissionEventType =
  | 'mission_created'
  | 'mission_started'
  | 'mission_paused'
  | 'mission_resumed'
  | 'mission_cancelled'
  | 'mission_completed'
  | 'mission_failed'
  | 'mission_restarted'
  | 'stage_started'
  | 'stage_completed'
  | 'stage_failed'
  | 'stage_retry';

export interface MissionEvent {
  id: string;
  type: MissionEventType;
  missionId: string;
  stage?: MissionStageId;
  status?: MissionStatus;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

type Listener = (event: MissionEvent) => void;

export class MissionEvents {
  private static instance: MissionEvents;
  private listeners: Listener[] = [];
  private events: MissionEvent[] = [];
  private max = 300;

  public static getInstance(): MissionEvents {
    if (!MissionEvents.instance) MissionEvents.instance = new MissionEvents();
    return MissionEvents.instance;
  }

  public emit(
    type: MissionEventType,
    missionId: string,
    message: string,
    opts?: { stage?: MissionStageId; status?: MissionStatus; metadata?: Record<string, unknown> }
  ): MissionEvent {
    const event: MissionEvent = {
      id: `mevt-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      type,
      missionId,
      message,
      timestamp: new Date().toISOString(),
      stage: opts?.stage,
      status: opts?.status,
      metadata: opts?.metadata,
    };
    this.events.unshift(event);
    if (this.events.length > this.max) this.events.pop();
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        // ignore listener errors
      }
    }
    return event;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getEvents(missionId?: string): MissionEvent[] {
    if (!missionId) return [...this.events];
    return this.events.filter((e) => e.missionId === missionId);
  }
}
