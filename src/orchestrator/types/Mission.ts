import type { MissionStageId } from './MissionStage';
import type { MissionStatus } from './MissionStatus';
import type { MissionStageRecord, MissionProgress } from './MissionProgress';
import type { MissionResult } from './MissionResult';

/** Snapshot of a website passed into the orchestrator (from App websites list). */
export interface MissionWebsiteRef {
  id: string;
  name: string;
  url: string;
  domain: string;
  framework?: string;
  category?: string;
  status?: string;
  favorite?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Mission {
  id: string;
  title: string;
  goal: string;
  website: MissionWebsiteRef;
  status: MissionStatus;
  currentStage: MissionStageId;
  stages: MissionStageRecord[];
  progress: MissionProgress;
  result?: MissionResult;
  maxRetriesPerStage: number;
  pauseRequested: boolean;
  cancelRequested: boolean;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  lastError?: string;
  /** Cross-stage artifacts collected while orchestrating */
  artifacts: {
    scanId?: string;
    intelligenceContextId?: string;
    ceoReportId?: string;
    collaborationSessionId?: string;
    taskIds: string[];
    memoryItemIds: string[];
    runtimeExecutionIds: string[];
  };
}

export type CreateMissionInput = {
  title?: string;
  goal: string;
  website: MissionWebsiteRef;
  maxRetriesPerStage?: number;
};
