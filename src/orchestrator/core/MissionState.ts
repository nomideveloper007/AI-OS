import type { Mission } from "../types/Mission";
import type { MissionStageId } from "../types/MissionStage";
import {
  MISSION_STAGE_LABELS,
  MISSION_STAGE_ORDER,
} from "../types/MissionStage";
import type {
  MissionProgress,
  MissionStageRecord,
} from "../types/MissionProgress";

/**
 * Pure helpers for mission status / progress — no side effects.
 */
export class MissionState {
  public static initialStages(): MissionStageRecord[] {
    return MISSION_STAGE_ORDER.map((stage) => ({
      stage,
      label: MISSION_STAGE_LABELS[stage],
      status: stage === "completed" ? "pending" : "pending",
      attempt: 0,
    }));
  }

  public static computeProgress(mission: Mission): MissionProgress {
    const actionable = MISSION_STAGE_ORDER.filter((s) => s !== "completed");
    const completedStages = mission.stages.filter(
      (s) => s.stage !== "completed" && s.status === "completed",
    ).length;
    const failures = mission.stages.filter((s) => s.status === "failed").length;
    const overallPercent =
      mission.status === "completed"
        ? 100
        : Math.min(
            99,
            Math.round(
              (completedStages / Math.max(1, actionable.length)) * 100,
            ),
          );

    const started = mission.startedAt
      ? new Date(mission.startedAt).getTime()
      : Date.now();
    const elapsedMs = Math.max(0, Date.now() - started);
    const remainingStages = Math.max(0, actionable.length - completedStages);
    const avgPerStage =
      completedStages > 0 ? elapsedMs / completedStages : 45_000;
    const estimatedRemainingMs =
      mission.status === "completed" || mission.status === "cancelled"
        ? 0
        : Math.round(remainingStages * avgPerStage);

    return {
      currentStage: mission.currentStage,
      currentStageLabel: MISSION_STAGE_LABELS[mission.currentStage],
      overallPercent,
      completedStages,
      totalStages: actionable.length,
      elapsedMs,
      estimatedRemainingMs,
      runningAgents: mission.progress?.runningAgents || [],
      completedTasks: mission.progress?.completedTasks || 0,
      failedTasks: mission.progress?.failedTasks || 0,
      failures,
    };
  }

  public static nextStage(current: MissionStageId): MissionStageId | null {
    const idx = MISSION_STAGE_ORDER.indexOf(current);
    if (idx < 0 || idx >= MISSION_STAGE_ORDER.length - 1) return null;
    return MISSION_STAGE_ORDER[idx + 1];
  }

  public static canPause(mission: Mission): boolean {
    return mission.status === "running";
  }

  public static canResume(mission: Mission): boolean {
    return mission.status === "paused";
  }

  public static canCancel(mission: Mission): boolean {
    return (
      mission.status === "running" ||
      mission.status === "paused" ||
      mission.status === "pending"
    );
  }

  public static canRestart(mission: Mission): boolean {
    return (
      mission.status === "failed" ||
      mission.status === "cancelled" ||
      mission.status === "completed" ||
      mission.status === "paused"
    );
  }
}
