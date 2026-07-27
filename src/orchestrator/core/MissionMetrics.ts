import type { Mission } from '../types/Mission';
import { MissionRepository } from '../repositories/MissionRepository';

export interface MissionMetricsSnapshot {
  total: number;
  running: number;
  paused: number;
  completed: number;
  failed: number;
  cancelled: number;
  avgDurationMs: number;
  successRate: number;
}

export class MissionMetrics {
  private repo = MissionRepository.getInstance();

  public snapshot(): MissionMetricsSnapshot {
    const list = this.repo.list();
    const completed = list.filter((m) => m.status === 'completed');
    const failed = list.filter((m) => m.status === 'failed');
    const durations = completed
      .map((m) => {
        if (!m.startedAt || !m.completedAt) return null;
        return new Date(m.completedAt).getTime() - new Date(m.startedAt).getTime();
      })
      .filter((n): n is number => n != null && n > 0);

    const finished = completed.length + failed.length;
    return {
      total: list.length,
      running: list.filter((m) => m.status === 'running').length,
      paused: list.filter((m) => m.status === 'paused').length,
      completed: completed.length,
      failed: failed.length,
      cancelled: list.filter((m) => m.status === 'cancelled').length,
      avgDurationMs:
        durations.length === 0
          ? 0
          : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length),
      successRate: finished === 0 ? 0 : Math.round((completed.length / finished) * 100),
    };
  }

  public forMission(mission: Mission) {
    return {
      id: mission.id,
      status: mission.status,
      progress: mission.progress,
      stageFailures: mission.stages.filter((s) => s.status === 'failed').length,
      retries: mission.stages.reduce((s, st) => s + Math.max(0, st.attempt - 1), 0),
    };
  }
}
