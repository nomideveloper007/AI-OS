import { MemoryItem } from '../types/Memory';

export class TagIndexer {
  public static extractAllTags(memories: MemoryItem[]): Map<string, number> {
    const tagCounts = new Map<string, number>();

    for (const mem of memories) {
      for (const tag of mem.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return tagCounts;
  }
}
