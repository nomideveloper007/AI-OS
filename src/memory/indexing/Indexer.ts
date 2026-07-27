import { MemoryItem } from '../types/Memory';

export class Indexer {
  public static buildInvertedIndex(memories: MemoryItem[]): Map<string, Set<string>> {
    const index = new Map<string, Set<string>>();

    for (const mem of memories) {
      const tokens = `${mem.title} ${mem.description} ${mem.tags.join(' ')}`
        .toLowerCase()
        .split(/\W+/)
        .filter((t) => t.length > 2);

      for (const token of tokens) {
        if (!index.has(token)) {
          index.set(token, new Set());
        }
        index.get(token)!.add(mem.id);
      }
    }

    return index;
  }
}
