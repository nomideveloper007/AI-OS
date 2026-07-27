import type { Mission } from '../types/Mission';
import type { MissionStageRecord } from '../types/MissionProgress';

const STORAGE_KEY = 'aios.orchestrator.missions';

export class MissionRepository {
  private static instance: MissionRepository;
  private missions: Mission[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): MissionRepository {
    if (!MissionRepository.instance) MissionRepository.instance = new MissionRepository();
    return MissionRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as Mission[];
      if (Array.isArray(list)) this.missions = list.slice(0, 40);
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.missions.slice(0, 40)));
    } catch {
      // ignore
    }
  }

  public save(mission: Mission): Mission {
    const idx = this.missions.findIndex((m) => m.id === mission.id);
    if (idx >= 0) this.missions[idx] = mission;
    else this.missions.unshift(mission);
    this.persist();
    return mission;
  }

  public get(id: string): Mission | undefined {
    return this.missions.find((m) => m.id === id);
  }

  public list(): Mission[] {
    return [...this.missions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public listRunning(): Mission[] {
    return this.list().filter((m) => m.status === 'running' || m.status === 'paused');
  }

  public listCompleted(): Mission[] {
    return this.list().filter((m) => m.status === 'completed');
  }

  public updateStage(missionId: string, stage: MissionStageRecord): Mission | undefined {
    const m = this.get(missionId);
    if (!m) return undefined;
    m.stages = m.stages.map((s) => (s.stage === stage.stage ? stage : s));
    m.updatedAt = new Date().toISOString();
    return this.save(m);
  }
}
