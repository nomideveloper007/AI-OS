import { MemoryRecord, MemoryType } from './MemoryTypes';

export class MemoryStorage {
  private static instance: MemoryStorage;
  private records: Map<string, MemoryRecord> = new Map();

  private constructor() {}

  public static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  public set(record: MemoryRecord): void {
    this.records.set(record.id, record);
  }

  public get(id: string): MemoryRecord | undefined {
    return this.records.get(id);
  }

  public getByType(type: MemoryType): MemoryRecord[] {
    return Array.from(this.records.values()).filter((r) => r.type === type);
  }

  public getAll(): MemoryRecord[] {
    return Array.from(this.records.values());
  }

  public delete(id: string): boolean {
    return this.records.delete(id);
  }
}
