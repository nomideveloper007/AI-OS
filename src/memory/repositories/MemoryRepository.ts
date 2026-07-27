import { MemoryStorage } from '../storage/MemoryStorage';
import { MemoryItem } from '../types/Memory';

export class MemoryRepository {
  private storage = MemoryStorage.getInstance();

  public saveMemory(item: MemoryItem): void {
    this.storage.save(item);
  }

  public getMemoryById(id: string): MemoryItem | undefined {
    return this.storage.get(id);
  }

  public getAllMemories(): MemoryItem[] {
    return this.storage.getAll();
  }

  public deleteMemory(id: string): boolean {
    return this.storage.delete(id);
  }

  public togglePin(id: string): boolean {
    const item = this.getMemoryById(id);
    if (item) {
      item.isPinned = !item.isPinned;
      item.updatedAt = new Date().toISOString();
      this.saveMemory(item);
      return Boolean(item.isPinned);
    }
    return false;
  }
}
