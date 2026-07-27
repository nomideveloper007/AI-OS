import { MemoryItem } from '../types/Memory';

export class MemoryRegistry {
  private static instance: MemoryRegistry;
  private registry: Map<string, MemoryItem> = new Map();

  private constructor() {}

  public static getInstance(): MemoryRegistry {
    if (!MemoryRegistry.instance) {
      MemoryRegistry.instance = new MemoryRegistry();
    }
    return MemoryRegistry.instance;
  }

  public register(item: MemoryItem): void {
    this.registry.set(item.id, item);
  }

  public get(id: string): MemoryItem | undefined {
    return this.registry.get(id);
  }

  public getAll(): MemoryItem[] {
    return Array.from(this.registry.values());
  }
}
