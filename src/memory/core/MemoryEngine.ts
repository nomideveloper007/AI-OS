import { MemoryRepository } from '../repositories/MemoryRepository';
import { KnowledgeRepository } from '../repositories/KnowledgeRepository';
import { MemorySearch, MemorySearchFilter } from '../search/MemorySearch';
import { KnowledgeSearch } from '../search/KnowledgeSearch';
import { MemoryItem } from '../types/Memory';
import { KnowledgeArticle } from '../types/Knowledge';

export class MemoryEngine {
  private static instance: MemoryEngine;
  public readonly memoryRepo = new MemoryRepository();
  public readonly knowledgeRepo = new KnowledgeRepository();

  private constructor() {}

  public static getInstance(): MemoryEngine {
    if (!MemoryEngine.instance) {
      MemoryEngine.instance = new MemoryEngine();
    }
    return MemoryEngine.instance;
  }

  public searchMemories(filter: MemorySearchFilter): MemoryItem[] {
    const all = this.memoryRepo.getAllMemories();
    return MemorySearch.filterMemories(all, filter);
  }

  public searchKnowledge(query?: string, category?: string): KnowledgeArticle[] {
    const all = this.knowledgeRepo.getAllArticles();
    return KnowledgeSearch.search(all, query, category);
  }
}
