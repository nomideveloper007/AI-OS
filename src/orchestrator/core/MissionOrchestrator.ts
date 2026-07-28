import type {
  CreateMissionInput,
  Mission,
  MissionWebsiteRef,
} from "../types/Mission";
import { MISSION_STAGE_LABELS } from "../types/MissionStage";
import { MissionRepository } from "../repositories/MissionRepository";
import { MissionHistoryRepository } from "../repositories/MissionHistoryRepository";
import { MissionState } from "./MissionState";
import { MissionRunner } from "./MissionRunner";
import { MissionScheduler } from "./MissionScheduler";
import { MissionLogger } from "./MissionLogger";
import { MissionEvents } from "./MissionEvents";
import { MissionMetrics } from "./MissionMetrics";

/**
 * Autonomous Mission Orchestrator facade.
 * Coordinates Scanner → WI → CEO → Task Engine → Collaboration → Runtime → Memory → Reports.
 * Never performs AI reasoning — only calls existing public APIs.
 */
export class MissionOrchestrator {
  private static instance: MissionOrchestrator;

  private repo = MissionRepository.getInstance();
  private historyRepo = MissionHistoryRepository.getInstance();
  private runner = new MissionRunner();
  private scheduler = new MissionScheduler();
  private logger = MissionLogger.getInstance();
  private events = MissionEvents.getInstance();
  private metrics = new MissionMetrics();

  private constructor() {
    this.scheduler.setRunner((id) => this.runner.run(id));
    this.logger.info("Mission Orchestrator ready");
  }

  public static getInstance(): MissionOrchestrator {
    if (!MissionOrchestrator.instance) {
      MissionOrchestrator.instance = new MissionOrchestrator();
    }
    return MissionOrchestrator.instance;
  }

  /** Create a mission (does not start). */
  public createMission(input: CreateMissionInput): Mission {
    const now = new Date().toISOString();
    const website = this.normalizeWebsite(input.website);
    const stages = MissionState.initialStages();
    const mission: Mission = {
      id: `mission-${Date.now()}`,
      title: input.title || `AI Company: ${website.domain}`,
      goal: input.goal,
      website,
      status: "pending",
      currentStage: "website_added",
      stages,
      progress: {
        currentStage: "website_added",
        currentStageLabel: MISSION_STAGE_LABELS.website_added,
        overallPercent: 0,
        completedStages: 0,
        totalStages: stages.filter((s) => s.stage !== "completed").length,
        elapsedMs: 0,
        estimatedRemainingMs: 0,
        runningAgents: [],
        completedTasks: 0,
        failedTasks: 0,
        failures: 0,
      },
      maxRetriesPerStage: input.maxRetriesPerStage ?? 2,
      pauseRequested: false,
      cancelRequested: false,
      createdAt: now,
      updatedAt: now,
      artifacts: {
        taskIds: [],
        memoryItemIds: [],
        runtimeExecutionIds: [],
      },
    };

    this.repo.save(mission);
    this.events.emit(
      "mission_created",
      mission.id,
      `Mission created for ${website.domain}`,
      {
        status: "pending",
      },
    );
    this.logger.success(`Mission created ${mission.id}`, mission.id);
    return mission;
  }

  /** One-button entry: create + start the full AI company workflow. */
  public async startAiCompany(input: CreateMissionInput): Promise<Mission> {
    const mission = this.createMission(input);
    return this.startMission(mission.id);
  }

  public async startMission(missionId: string): Promise<Mission> {
    const mission = this.repo.get(missionId);
    if (!mission) throw new Error(`Mission not found: ${missionId}`);
    if (mission.status === "running" && this.runner.isRunning(missionId)) {
      return mission;
    }

    // Reset control flags for a fresh start / resume-from-pending
    this.repo.save({
      ...mission,
      cancelRequested: false,
      pauseRequested: false,
      status: mission.status === "paused" ? "paused" : "pending",
      updatedAt: new Date().toISOString(),
    });

    return this.runner.run(missionId);
  }

  public pauseMission(missionId: string): Mission {
    const mission = this.require(missionId);
    if (!MissionState.canPause(mission) && mission.status !== "running") {
      // Allow setting pause flag even if between stages
    }
    const updated = this.repo.save({
      ...mission,
      pauseRequested: true,
      updatedAt: new Date().toISOString(),
    });
    this.events.emit("mission_paused", missionId, "Pause requested", {
      status: updated.status,
    });
    this.logger.info("Pause requested", missionId);
    return updated;
  }

  public async resumeMission(missionId: string): Promise<Mission> {
    const mission = this.require(missionId);
    if (!MissionState.canResume(mission) && mission.status !== "paused") {
      throw new Error(
        `Mission cannot be resumed from status ${mission.status}`,
      );
    }
    const updated = this.repo.save({
      ...mission,
      status: "paused",
      pauseRequested: false,
      cancelRequested: false,
      updatedAt: new Date().toISOString(),
    });
    this.events.emit("mission_resumed", missionId, "Mission resumed", {
      status: "running",
    });
    return this.runner.run(updated.id);
  }

  public cancelMission(missionId: string): Mission {
    const mission = this.require(missionId);
    if (!MissionState.canCancel(mission) && mission.status === "completed") {
      throw new Error("Completed missions cannot be cancelled");
    }
    const updated = this.repo.save({
      ...mission,
      cancelRequested: true,
      pauseRequested: false,
      status: this.runner.isRunning(missionId) ? mission.status : "cancelled",
      completedAt: this.runner.isRunning(missionId)
        ? mission.completedAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastError: this.runner.isRunning(missionId)
        ? mission.lastError
        : "Cancelled by operator",
    });
    if (!this.runner.isRunning(missionId) && updated.status === "cancelled") {
      this.historyRepo.record(updated);
      this.events.emit("mission_cancelled", missionId, "Mission cancelled", {
        status: "cancelled",
      });
    }
    this.logger.warn("Cancel requested", missionId);
    return updated;
  }

  public async restartMission(missionId: string): Promise<Mission> {
    const mission = this.require(missionId);
    const fresh = this.createMission({
      title: mission.title,
      goal: mission.goal,
      website: mission.website,
      maxRetriesPerStage: mission.maxRetriesPerStage,
    });
    this.events.emit(
      "mission_restarted",
      fresh.id,
      `Restarted from ${missionId}`,
      {
        metadata: { previousMissionId: missionId },
      },
    );
    return this.startMission(fresh.id);
  }

  /** Queue without blocking (scheduler). */
  public enqueueMission(missionId: string): void {
    this.scheduler.enqueue(missionId);
  }

  public getMission(id: string): Mission | undefined {
    return this.repo.get(id);
  }

  public listMissions(): Mission[] {
    return this.repo.list();
  }

  public listRunning(): Mission[] {
    return this.repo.listRunning();
  }

  public listCompleted(): Mission[] {
    return this.repo.listCompleted();
  }

  public getHistory() {
    return this.historyRepo.list();
  }

  public getLogs(missionId?: string) {
    return this.logger.getLogs(missionId);
  }

  public getEvents(missionId?: string) {
    return this.events.getEvents(missionId);
  }

  public subscribe(listener: Parameters<MissionEvents["subscribe"]>[0]) {
    return this.events.subscribe(listener);
  }

  public getMetrics() {
    return this.metrics.snapshot();
  }

  private require(id: string): Mission {
    const m = this.repo.get(id);
    if (!m) throw new Error(`Mission not found: ${id}`);
    return m;
  }

  private normalizeWebsite(ref: MissionWebsiteRef): MissionWebsiteRef {
    return {
      ...ref,
      domain:
        ref.domain ||
        new URL(ref.url.startsWith("http") ? ref.url : `https://${ref.url}`)
          .hostname,
      url: ref.url.startsWith("http") ? ref.url : `https://${ref.url}`,
    };
  }
}
