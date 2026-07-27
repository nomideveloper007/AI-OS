import { Indexer } from '../indexing/Indexer';
import { TagIndexer } from '../indexing/TagIndexer';
import { WebsiteIndexer } from '../indexing/WebsiteIndexer';
import { MemoryItem } from '../types/Memory';

export class MemoryIndexer {
  private static instance: MemoryIndexer;

  private constructor() {}

  public static getInstance(): MemoryIndexer {
    if (!MemoryIndexer.instance) {
      MemoryIndexer.instance = new MemoryIndexer();
    }
    return MemoryIndexer.instance;
  }

  public indexAll(memories: MemoryItem[]) {
    return {
      invertedIndex: Indexer.buildInvertedIndex(memories),
      tagCounts: TagIndexer.extractAllTags(memories),
      websiteGroups: WebsiteIndexer.groupMemoriesByWebsite(memories)
    };
  }
}
