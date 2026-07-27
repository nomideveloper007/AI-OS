import type { Mission } from '../types/Mission';
import type { MissionStageId } from '../types/MissionStage';
import { MISSION_STAGE_ORDER } from '../types/MissionStage';
import type { MissionResult } from '../types/MissionResult';
import { MissionRepository } from '../repositories/MissionRepository';
import { MissionHistoryRepository } from '../repositories/MissionHistoryRepository';
import { MissionPipeline } from './MissionPipeline';
import { MissionState } from './MissionState';
import { MissionRecovery } from './MissionRecovery';
import { MissionLogger } from './MissionLogger';
import { MissionEvents } from './MissionEvents';

/**
 * Runs mission stages sequentially with pause / resume / cancel / retry support.
 */
export class MissionRunner {
  private repo = MissionRepository.getInstance();
  private history = MissionHistoryRepository.getInstance();
  private pipeline = new MissionPipeline();
  private recovery = new MissionRecovery();
  private logger = MissionLogger.getInstance();
  private events = MissionEvents.getInstance();

  /** In-flight runners by mission id */
  private running = new Set<string>();

  public isRunning(missionId: string): boolean {
    return this.running.has(missionId);
  }

  public async run(missionId: string): Promise<Mission> {
    if (this.running.has(missionId)) {
      const existing = this.repo.get(missionId);
      if (existing) return existing;
      throw new Error(`Mission already running: ${missionId}`);
    }

    this.running.add(missionId);
    try {
      let mission = this.repo.get(missionId);
      if (!mission) throw new Error(`Mission not found: ${missionId}`);

      if (mission.status === 'cancelled') return mission;

      mission = this.persist({
        ...mission,
        status: 'running',
        pauseRequested: false,
        startedAt: mission.startedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      this.events.emit('mission_started', mission.id, 'Mission started', { status: 'running' });

      const startIdx = Math.max(0, MISSION_STAGE_ORDER.indexOf(mission.currentStage));

      for (let i = startIdx; i < MISSION_STAGE_ORDER.length; i++) {
        mission = this.repo.get(missionId)!;
        if (mission.cancelRequested) {
          return this.finalize(mission, 'cancelled', 'Mission cancelled by operator');
        }
        if (mission.pauseRequested) {
          return this.persist({
            ...mission,
            status: 'paused',
            updatedAt: new Date().toISOString(),
            progress: MissionState.computeProgress(mission),
          });
        }

        const stage = MISSION_STAGE_ORDER[i];
        if (stage === 'completed') {
          return this.complete(mission);
        }

        // Skip stages already completed (resume support)
        const record = mission.stages.find((s) => s.stage === stage);
        if (record?.status === 'completed') continue;

        const outcome = await this.executeStageWithRetries(missionId, stage);
        mission = this.repo.get(missionId)!;

        if (!outcome) {
          // paused or cancelled inside retries
          return this.repo.get(missionId)!;
        }

        if (!outcome.ok) {
          return this.repo.get(missionId)!;
        }

        // Advance pointer
        const next = MissionState.nextStage(stage);
        mission = this.persist({
          ...mission,
          currentStage: next || 'completed',
          updatedAt: new Date().toISOString(),
          progress: MissionState.computeProgress({
            ...mission,
            currentStage: next || 'completed',
          }),
        });
      }

      mission = this.repo.get(missionId)!;
      return this.complete(mission);
    } finally {
      this.running.delete(missionId);
    }
  }

  private async executeStageWithRetries(
    missionId: string,
    stage: MissionStageId
  ): Promise<{ ok: boolean } | null> {
    let mission = this.repo.get(missionId)!;
    let attempt = mission.stages.find((s) => s.stage === stage)?.attempt || 0;

    while (true) {
      mission = this.repo.get(missionId)!;
      if (mission.cancelRequested) {
        this.finalize(mission, 'cancelled', 'Cancelled during stage');
        return null;
      }
      if (mission.pauseRequested) {
        this.persist({
          ...mission,
          status: 'paused',
          updatedAt: new Date().toISOString(),
          progress: MissionState.computeProgress(mission),
        });
        this.events.emit('mission_paused', missionId, 'Mission paused', {
          status: 'paused',
          stage,
        });
        return null;
      }

      attempt += 1;
      const startedAt = new Date().toISOString();
      mission = this.updateStage(mission, stage, {
        status: 'running',
        attempt,
        startedAt,
        errorMessage: undefined,
      });
      mission = this.persist({
        ...mission,
        currentStage: stage,
        status: 'running',
        progress: MissionState.computeProgress({ ...mission, currentStage: stage }),
      });
      this.events.emit('stage_started', missionId, `Stage started: ${stage}`, { stage });

      let result;
      try {
        result = await this.pipeline.runStage(mission, stage);
      } catch (err) {
        result = {
          ok: false,
          summary: 'Stage threw',
          errorMessage: err instanceof Error ? err.message : String(err),
        };
      }

      mission = this.repo.get(missionId)!;
      const finishedAt = new Date().toISOString();
      const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

      if (result.ok) {
        if (result.patch) {
          mission = {
            ...mission,
            artifacts: { ...mission.artifacts, ...result.patch },
          };
        }
        if (result.progressPatch) {
          mission = {
            ...mission,
            progress: { ...mission.progress, ...result.progressPatch },
          };
        }
        if (result.resultPatch) {
          mission = {
            ...mission,
            result: {
              ...(mission.result || {
                executiveSummary: '',
                taskIds: [],
                memoryItemIds: [],
                keyFindings: [],
                recommendations: [],
                confidenceScore: 0,
                generatedAt: finishedAt,
              }),
              ...result.resultPatch,
            } as MissionResult,
          };
        }

        mission = this.updateStage(mission, stage, {
          status: 'completed',
          attempt,
          finishedAt,
          durationMs,
          summary: result.summary,
          artifactIds: result.artifactIds,
        });
        mission = this.persist({
          ...mission,
          progress: MissionState.computeProgress(mission),
          updatedAt: finishedAt,
        });
        this.events.emit('stage_completed', missionId, result.summary, { stage });
        this.logger.success(result.summary, missionId, stage);
        return { ok: true };
      }

      // Failure path
      mission = this.updateStage(mission, stage, {
        status: 'failed',
        attempt,
        finishedAt,
        durationMs,
        summary: result.summary,
        errorMessage: result.errorMessage,
        artifactIds: result.artifactIds,
      });
      if (result.patch) {
        mission = {
          ...mission,
          artifacts: { ...mission.artifacts, ...result.patch },
        };
      }
      mission = this.persist({
        ...mission,
        lastError: result.errorMessage,
        progress: MissionState.computeProgress(mission),
        updatedAt: finishedAt,
      });
      this.events.emit('stage_failed', missionId, result.errorMessage || result.summary, {
        stage,
      });

      const action = this.recovery.onStageFailure(
        mission,
        stage,
        result.errorMessage || result.summary,
        attempt
      );

      if (action === 'retry') {
        await this.delay(800 * attempt);
        continue;
      }

      if (action === 'pause') {
        mission = this.persist({
          ...mission,
          status: 'paused',
          pauseRequested: false,
          updatedAt: new Date().toISOString(),
          progress: MissionState.computeProgress(mission),
        });
        this.events.emit(
          'mission_paused',
          missionId,
          `Paused after ${stage} failure (state preserved)`,
          { status: 'paused', stage }
        );
        return null;
      }

      return this.finalize(
        mission,
        'failed',
        result.errorMessage || `Stage ${stage} failed`
      ), null;
    }
  }

  private complete(mission: Mission): Mission {
    const finished = this.updateStage(mission, 'completed', {
      status: 'completed',
      attempt: 1,
      finishedAt: new Date().toISOString(),
      summary: 'All stages finished',
    });
    const done = this.persist({
      ...finished,
      status: 'completed',
      currentStage: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: {
        ...MissionState.computeProgress({ ...finished, status: 'completed', currentStage: 'completed' }),
        overallPercent: 100,
      },
    });
    this.history.record(done);
    this.events.emit('mission_completed', done.id, 'Mission completed', { status: 'completed' });
    this.logger.success(`Mission ${done.id} completed`, done.id, 'completed');
    return done;
  }

  private finalize(
    mission: Mission,
    status: 'failed' | 'cancelled',
    message: string
  ): Mission {
    const done = this.persist({
      ...mission,
      status,
      lastError: message,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      cancelRequested: false,
      pauseRequested: false,
      progress: MissionState.computeProgress({ ...mission, status }),
    });
    this.history.record(done);
    this.events.emit(
      status === 'failed' ? 'mission_failed' : 'mission_cancelled',
      done.id,
      message,
      { status }
    );
    return done;
  }

  private updateStage(
    mission: Mission,
    stage: MissionStageId,
    patch: Partial<Mission['stages'][number]>
  ): Mission {
    return {
      ...mission,
      stages: mission.stages.map((s) => (s.stage === stage ? { ...s, ...patch } : s)),
    };
  }

  private persist(mission: Mission): Mission {
    return this.repo.save(mission);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
