import type { MissionStageId } from './MissionStage';

export type MissionStageRunStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface MissionStageRecord {
  stage: MissionStageId;
  label: string;
  status: MissionStageRunStatus;
  attempt: number;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  summary?: string;
  artifactIds?: string[];
}

export interface MissionProgress {
  currentStage: MissionStageId;
  currentStageLabel: string;
  overallPercent: number;
  completedStages: number;
  totalStages: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
  runningAgents: string[];
  completedTasks: number;
  failedTasks: number;
  failures: number;
}
