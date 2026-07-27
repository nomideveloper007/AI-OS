import { MemoryItem } from '../types/Memory';

export class WebsiteIndexer {
  public static groupMemoriesByWebsite(memories: MemoryItem[]): Map<string, MemoryItem[]> {
    const websiteMap = new Map<string, MemoryItem[]>();

    for (const mem of memories) {
      const site = mem.website || 'Global / Unassigned';
      if (!websiteMap.has(site)) {
        websiteMap.set(site, []);
      }
      websiteMap.get(site)!.push(mem);
    }

    return websiteMap;
  }
}
