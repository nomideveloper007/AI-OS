import { MemoryEngine } from './MemoryEngine';
import { MemoryItem, MemoryType, MemoryTimelineEntry } from '../types/Memory';
import { KnowledgeCategory } from '../types/MemoryCategory';
import { MemoryPriority } from '../types/MemoryPriority';
import { MemoryVisibility } from '../types/MemoryVisibility';
import { MemoryValidator } from './MemoryValidator';

export class MemoryManager {
  private static instance: MemoryManager;
  private engine = MemoryEngine.getInstance();

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public createMemoryItem(params: {
    title: string;
    description: string;
    content?: string;
    type: MemoryType;
    category: KnowledgeCategory;
    priority?: MemoryPriority;
    tags?: string[];
    source?: string;
    website?: string;
    visibility?: MemoryVisibility;
    isPinned?: boolean;
  }): MemoryItem {
    const validation = MemoryValidator.validateMemory(params);
    if (!validation.valid) {
      throw new Error(`Memory validation failed: ${validation.errors.join(', ')}`);
    }

    const now = new Date().toISOString();
    const item: MemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: params.title,
      description: params.description,
      content: params.content,
      type: params.type,
      category: params.category,
      priority: params.priority || 'Medium',
      tags: params.tags || ['Memory', params.category],
      source: params.source || 'AI OS System',
      website: params.website,
      createdAt: now,
      updatedAt: now,
      visibility: params.visibility || 'Global',
      status: 'Active',
      isPinned: Boolean(params.isPinned),
      timeline: [
        {
          id: `evt-${Date.now()}`,
          event: 'Created',
          details: `Memory item stored by ${params.source || 'AI OS System'}.`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    };

    this.engine.memoryRepo.saveMemory(item);
    return item;
  }

  public getMemories(): MemoryItem[] {
    return this.engine.memoryRepo.getAllMemories();
  }

  public togglePin(id: string): boolean {
    return this.engine.memoryRepo.togglePin(id);
  }

  public deleteMemory(id: string): boolean {
    return this.engine.memoryRepo.deleteMemory(id);
  }

  public getKnowledgeArticles() {
    return this.engine.knowledgeRepo.getAllArticles();
  }
}
