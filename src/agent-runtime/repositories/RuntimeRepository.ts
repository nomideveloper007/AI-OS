import type { AgentExecution } from '../types/AgentExecution';
import type { AgentHeartbeatRecord } from '../types/AgentHeartbeat';
import type { AgentMessage } from '../types/AgentMessage';

const EXEC_KEY = 'aios.agentruntime.executions';
const MSG_KEY = 'aios.agentruntime.messages';
const HB_KEY = 'aios.agentruntime.heartbeats';

export class RuntimeRepository {
  private static instance: RuntimeRepository;
  private executions: Map<string, AgentExecution> = new Map();
  private messages: AgentMessage[] = [];
  private heartbeats: AgentHeartbeatRecord[] = [];
  private pendingQueue: string[] = []; // execution ids waiting for an idle agent

  private constructor() {
    this.load();
  }

  public static getInstance(): RuntimeRepository {
    if (!RuntimeRepository.instance) RuntimeRepository.instance = new RuntimeRepository();
    return RuntimeRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const execRaw = window.localStorage.getItem(EXEC_KEY);
      if (execRaw) {
        const list = JSON.parse(execRaw) as AgentExecution[];
        if (Array.isArray(list)) for (const e of list) this.executions.set(e.id, e);
      }
      const msgRaw = window.localStorage.getItem(MSG_KEY);
      if (msgRaw) {
        const list = JSON.parse(msgRaw) as AgentMessage[];
        if (Array.isArray(list)) this.messages = list.slice(0, 400);
      }
      const hbRaw = window.localStorage.getItem(HB_KEY);
      if (hbRaw) {
        const list = JSON.parse(hbRaw) as AgentHeartbeatRecord[];
        if (Array.isArray(list)) this.heartbeats = list.slice(0, 200);
      }
    } catch {
      // ignore
    }
  }

  private persistExecutions(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        EXEC_KEY,
        JSON.stringify(this.listExecutions().slice(0, 200))
      );
    } catch {
      // ignore
    }
  }

  private persistMessages(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(MSG_KEY, JSON.stringify(this.messages.slice(0, 400)));
    } catch {
      // ignore
    }
  }

  private persistHeartbeats(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(HB_KEY, JSON.stringify(this.heartbeats.slice(0, 200)));
    } catch {
      // ignore
    }
  }

  public saveExecution(execution: AgentExecution): AgentExecution {
    this.executions.set(execution.id, execution);
    this.persistExecutions();
    return execution;
  }

  public getExecution(id: string): AgentExecution | undefined {
    return this.executions.get(id);
  }

  public listExecutions(agentId?: string): AgentExecution[] {
    const all = Array.from(this.executions.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
    return agentId ? all.filter((e) => e.agentId === agentId) : all;
  }

  public enqueuePending(executionId: string): void {
    if (!this.pendingQueue.includes(executionId)) this.pendingQueue.push(executionId);
  }

  public dequeuePending(): string | undefined {
    return this.pendingQueue.shift();
  }

  public listPending(): string[] {
    return [...this.pendingQueue];
  }

  public addMessage(message: AgentMessage): AgentMessage {
    this.messages.unshift(message);
    if (this.messages.length > 400) this.messages.pop();
    this.persistMessages();
    return message;
  }

  public listMessages(agentId?: string): AgentMessage[] {
    if (!agentId) return [...this.messages];
    return this.messages.filter((m) => m.agentId === agentId);
  }

  public addHeartbeat(record: AgentHeartbeatRecord): AgentHeartbeatRecord {
    this.heartbeats.unshift(record);
    if (this.heartbeats.length > 200) this.heartbeats.pop();
    this.persistHeartbeats();
    return record;
  }

  public listHeartbeats(agentId?: string): AgentHeartbeatRecord[] {
    if (!agentId) return [...this.heartbeats];
    return this.heartbeats.filter((h) => h.agentId === agentId);
  }

  public clear(): void {
    this.executions.clear();
    this.messages = [];
    this.heartbeats = [];
    this.pendingQueue = [];
    this.persistExecutions();
    this.persistMessages();
    this.persistHeartbeats();
  }
}
