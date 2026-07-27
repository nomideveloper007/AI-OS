import type { Mission } from '../types/Mission';

const HISTORY_KEY = 'aios.orchestrator.mission_history';

export interface MissionHistoryEntry {
  id: string;
  missionId: string;
  title: string;
  goal: string;
  domain: string;
  status: string;
  summary: string;
  completedAt: string;
  confidenceScore?: number;
}

/**
 * Append-only history of finished missions (completed / failed / cancelled).
 */
export class MissionHistoryRepository {
  private static instance: MissionHistoryRepository;
  private entries: MissionHistoryEntry[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): MissionHistoryRepository {
    if (!MissionHistoryRepository.instance) {
      MissionHistoryRepository.instance = new MissionHistoryRepository();
    }
    return MissionHistoryRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as MissionHistoryEntry[];
      if (Array.isArray(list)) this.entries = list.slice(0, 100);
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(this.entries.slice(0, 100)));
    } catch {
      // ignore
    }
  }

  public record(mission: Mission): MissionHistoryEntry {
    const entry: MissionHistoryEntry = {
      id: `mhist-${Date.now()}`,
      missionId: mission.id,
      title: mission.title,
      goal: mission.goal,
      domain: mission.website.domain,
      status: mission.status,
      summary: mission.result?.executiveSummary || mission.lastError || mission.status,
      completedAt: mission.completedAt || new Date().toISOString(),
      confidenceScore: mission.result?.confidenceScore,
    };
    this.entries.unshift(entry);
    this.persist();
    return entry;
  }

  public list(): MissionHistoryEntry[] {
    return [...this.entries];
  }
}
