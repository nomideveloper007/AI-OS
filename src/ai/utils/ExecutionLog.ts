export interface ExecutionRecord {
  id: string;
  prompt: string;
  response: string;
  providerId: string;
  modelId: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  finishReason: string;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  streamed: boolean;
  timestamp: string;
}

type ExecutionListener = (record: ExecutionRecord) => void;

const STORAGE_KEY = 'aios.ai.executionLog';
const MAX_RECORDS = 100;

export class ExecutionLog {
  private static instance: ExecutionLog;
  private records: ExecutionRecord[] = [];
  private listeners: Set<ExecutionListener> = new Set();

  private constructor() {
    this.records = this.load();
  }

  public static getInstance(): ExecutionLog {
    if (!ExecutionLog.instance) {
      ExecutionLog.instance = new ExecutionLog();
    }
    return ExecutionLog.instance;
  }

  private load(): ExecutionRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as ExecutionRecord[]) : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records.slice(0, MAX_RECORDS)));
    } catch {
      // ignore quota
    }
  }

  public record(partial: Omit<ExecutionRecord, 'id' | 'timestamp'> & { timestamp?: string }): ExecutionRecord {
    const entry: ExecutionRecord = {
      id: `exec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: partial.timestamp || new Date().toISOString(),
      ...partial,
    };
    this.records.unshift(entry);
    if (this.records.length > MAX_RECORDS) {
      this.records = this.records.slice(0, MAX_RECORDS);
    }
    this.persist();
    this.listeners.forEach((listener) => listener(entry));
    return entry;
  }

  public getRecords(): ExecutionRecord[] {
    return [...this.records];
  }

  public clear(): void {
    this.records = [];
    this.persist();
  }

  public subscribe(listener: ExecutionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
