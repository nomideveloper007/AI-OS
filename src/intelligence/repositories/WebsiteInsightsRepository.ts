import type { WebsiteInsight } from '../types/WebsiteInsight';
import type { WebsiteSnapshotData } from '../types/WebsiteContext';

const INSIGHTS_KEY = 'aios.intelligence.insights';
const SNAPSHOTS_KEY = 'aios.intelligence.snapshots';

interface InsightRecord {
  contextId: string;
  websiteId: string;
  domain: string;
  analyzedAt: string;
  insights: WebsiteInsight[];
}

export class WebsiteInsightsRepository {
  private static instance: WebsiteInsightsRepository;
  private insightRecords: InsightRecord[] = [];
  private snapshots: WebsiteSnapshotData[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): WebsiteInsightsRepository {
    if (!WebsiteInsightsRepository.instance) {
      WebsiteInsightsRepository.instance = new WebsiteInsightsRepository();
    }
    return WebsiteInsightsRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const insightsRaw = window.localStorage.getItem(INSIGHTS_KEY);
      if (insightsRaw) {
        const parsed = JSON.parse(insightsRaw);
        if (Array.isArray(parsed)) this.insightRecords = parsed;
      }
      const snapsRaw = window.localStorage.getItem(SNAPSHOTS_KEY);
      if (snapsRaw) {
        const parsed = JSON.parse(snapsRaw);
        if (Array.isArray(parsed)) this.snapshots = parsed;
      }
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(INSIGHTS_KEY, JSON.stringify(this.insightRecords.slice(0, 100)));
      window.localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(this.snapshots.slice(0, 200)));
    } catch {
      // ignore
    }
  }

  public saveInsights(
    contextId: string,
    websiteId: string,
    domain: string,
    analyzedAt: string,
    insights: WebsiteInsight[]
  ): void {
    this.insightRecords = [
      { contextId, websiteId, domain, analyzedAt, insights },
      ...this.insightRecords.filter((r) => r.contextId !== contextId),
    ].slice(0, 100);
    this.persist();
  }

  public saveSnapshot(snapshot: WebsiteSnapshotData): void {
    this.snapshots = [
      snapshot,
      ...this.snapshots.filter((s) => s.id !== snapshot.id),
    ].slice(0, 200);
    this.persist();
  }

  public getSnapshotsForWebsite(websiteId: string): WebsiteSnapshotData[] {
    return this.snapshots
      .filter((s) => s.websiteId === websiteId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getAllSnapshots(): WebsiteSnapshotData[] {
    return [...this.snapshots].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getInsightsForWebsite(websiteId: string): InsightRecord[] {
    return this.insightRecords.filter((r) => r.websiteId === websiteId);
  }
}
