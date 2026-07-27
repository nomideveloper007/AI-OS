import type { Mission, MissionWebsiteRef } from '../types/Mission';
import type { WebsiteItem } from '../../types';

/**
 * Builds lightweight context bags for stages — no AI, no duplicate lookups beyond refs.
 */
export class MissionContext {
  public static toWebsiteItem(ref: MissionWebsiteRef): WebsiteItem {
    return {
      id: ref.id,
      name: ref.name,
      url: ref.url,
      domain: ref.domain,
      framework: (ref.framework as WebsiteItem['framework']) || 'Unknown',
      category: (ref.category as WebsiteItem['category']) || 'Other',
      status: (ref.status as WebsiteItem['status']) || 'Active',
      favorite: Boolean(ref.favorite),
      created_at: ref.created_at || new Date().toISOString(),
      updated_at: ref.updated_at || new Date().toISOString(),
    };
  }

  public static describe(mission: Mission): Record<string, unknown> {
    return {
      missionId: mission.id,
      goal: mission.goal,
      domain: mission.website.domain,
      websiteId: mission.website.id,
      currentStage: mission.currentStage,
      status: mission.status,
      artifacts: mission.artifacts,
    };
  }
}
