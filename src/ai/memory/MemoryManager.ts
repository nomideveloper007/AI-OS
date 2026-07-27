import { MemoryStorage } from './MemoryStorage';
import { MemoryRecord, MemoryType } from './MemoryTypes';
import { AILogger } from '../utils/Logger';

export class MemoryManager {
  private static instance: MemoryManager;
  private storage = MemoryStorage.getInstance();
  private logger = AILogger.getInstance();

  private constructor() {}

  public static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  public storeMemory(type: MemoryType, key: string, value: any, websiteId?: string, agentId?: string): MemoryRecord {
    const now = new Date().toISOString();
    const record: MemoryRecord = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      key,
      value,
      websiteId,
      agentId,
      createdAt: now,
      updatedAt: now
    };

    this.storage.set(record);
    this.logger.info(`Stored memory entry [${type}]: '${key}'`, 'MemoryManager');
    return record;
  }

  public retrieveMemory(type: MemoryType): MemoryRecord[] {
    return this.storage.getByType(type);
  }

  public getAllMemories(): MemoryRecord[] {
    return this.storage.getAll();
  }
}
