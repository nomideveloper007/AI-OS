import type { WebsiteSnapshotData, WebsiteScores } from '../types/WebsiteContext';

export interface SnapshotComparison {
  previous: WebsiteSnapshotData;
  current: WebsiteSnapshotData;
  overallDelta: number;
  scoreDeltas: Partial<Record<keyof WebsiteScores, number>>;
  improved: boolean;
}

/**
 * Historical snapshot comparison helpers (in-memory / repository-backed).
 */
export class WebsiteHistory {
  public static sortNewestFirst(snapshots: WebsiteSnapshotData[]): WebsiteSnapshotData[] {
    return [...snapshots].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static compare(
    current: WebsiteSnapshotData,
    previous: WebsiteSnapshotData
  ): SnapshotComparison {
    const keys: Array<keyof WebsiteScores> = [
      'overall',
      'seo',
      'performance',
      'security',
      'accessibility',
      'content',
      'maintainability',
    ];

    const scoreDeltas: Partial<Record<keyof WebsiteScores, number>> = {};
    for (const key of keys) {
      const cur = current.scores[key];
      const prev = previous.scores[key];
      if (typeof cur === 'number' && typeof prev === 'number') {
        scoreDeltas[key] = cur - prev;
      }
    }

    const overallDelta = current.overallHealth - previous.overallHealth;
    return {
      previous,
      current,
      overallDelta,
      scoreDeltas,
      improved: overallDelta >= 0,
    };
  }

  public static timeline(snapshots: WebsiteSnapshotData[]): WebsiteSnapshotData[] {
    return WebsiteHistory.sortNewestFirst(snapshots);
  }
}
