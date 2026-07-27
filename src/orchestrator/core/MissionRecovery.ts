import type { Mission } from '../types/Mission';
import type { MissionStageId } from '../types/MissionStage';
import { MissionLogger } from './MissionLogger';
import { MissionEvents } from './MissionEvents';

/**
 * Decides retry vs pause when a stage fails — preserves mission state.
 */
export class MissionRecovery {
  private logger = MissionLogger.getInstance();
  private events = MissionEvents.getInstance();

  public shouldRetry(mission: Mission, stage: MissionStageId, attempt: number): boolean {
    if (mission.cancelRequested || mission.pauseRequested) return false;
    return attempt < mission.maxRetriesPerStage;
  }

  public onStageFailure(
    mission: Mission,
    stage: MissionStageId,
    error: string,
    attempt: number
  ): 'retry' | 'pause' | 'fail' {
    this.logger.error(error, mission.id, stage, { attempt });

    if (mission.cancelRequested) return 'fail';
    if (this.shouldRetry(mission, stage, attempt)) {
      this.events.emit('stage_retry', mission.id, `Retrying stage ${stage} (attempt ${attempt + 1})`, {
        stage,
        metadata: { attempt: attempt + 1 },
      });
      this.logger.warn(`Retry scheduled for ${stage}`, mission.id, stage, {
        nextAttempt: attempt + 1,
      });
      return 'retry';
    }

    // Preserve state by pausing instead of hard-failing when retries exhausted
    this.logger.warn(
      `Retries exhausted for ${stage} — pausing mission to preserve state`,
      mission.id,
      stage
    );
    return 'pause';
  }
}
