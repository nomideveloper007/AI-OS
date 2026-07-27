import type { Mission } from '../types/Mission';
import { MissionRepository } from '../repositories/MissionRepository';
import { MissionLogger } from './MissionLogger';

type RunHandler = (missionId: string) => Promise<Mission>;

/**
 * Simple FIFO scheduler for queued missions.
 */
export class MissionScheduler {
  private repo = MissionRepository.getInstance();
  private logger = MissionLogger.getInstance();
  private queue: string[] = [];
  private processing = false;
  private runHandler: RunHandler | null = null;

  public setRunner(handler: RunHandler): void {
    this.runHandler = handler;
  }

  public enqueue(missionId: string): void {
    if (!this.queue.includes(missionId)) {
      this.queue.push(missionId);
      this.logger.info(`Mission queued: ${missionId}`, missionId);
    }
    void this.pump();
  }

  public listQueue(): string[] {
    return [...this.queue];
  }

  private async pump(): Promise<void> {
    if (this.processing || !this.runHandler) return;
    this.processing = true;
    try {
      while (this.queue.length > 0) {
        const id = this.queue.shift()!;
        const mission = this.repo.get(id);
        if (!mission) continue;
        if (mission.status === 'cancelled' || mission.status === 'completed') continue;
        try {
          await this.runHandler(id);
        } catch (err) {
          this.logger.error(
            `Scheduler run failed: ${err instanceof Error ? err.message : String(err)}`,
            id
          );
        }
      }
    } finally {
      this.processing = false;
    }
  }
}
