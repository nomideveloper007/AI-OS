import type { CollaborationSession, CollaborationSessionBundle } from '../types/CollaborationSession';
import type { AgentContribution } from '../types/AgentContribution';
import type { AgentMessage } from '../types/AgentMessage';
import type { Conflict } from '../types/Conflict';
import type { Consensus } from '../types/Consensus';

const STORAGE_KEY = 'aios.collaboration.store';

interface CollaborationStore {
  sessions: CollaborationSession[];
  contributions: AgentContribution[];
  messages: AgentMessage[];
  conflicts: Conflict[];
  consensus: Consensus[];
}

/**
 * Persists collaboration artifacts (sessions, contributions, messages, conflicts, consensus).
 */
export class CollaborationRepository {
  private static instance: CollaborationRepository;
  private store: CollaborationStore = {
    sessions: [],
    contributions: [],
    messages: [],
    conflicts: [],
    consensus: [],
  };

  private constructor() {
    this.load();
  }

  public static getInstance(): CollaborationRepository {
    if (!CollaborationRepository.instance) {
      CollaborationRepository.instance = new CollaborationRepository();
    }
    return CollaborationRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CollaborationStore;
      if (parsed && Array.isArray(parsed.sessions)) {
        this.store = {
          sessions: parsed.sessions.slice(0, 50),
          contributions: parsed.contributions || [],
          messages: parsed.messages || [],
          conflicts: parsed.conflicts || [],
          consensus: parsed.consensus || [],
        };
      }
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sessions: this.store.sessions.slice(0, 50),
          contributions: this.store.contributions.slice(0, 500),
          messages: this.store.messages.slice(0, 800),
          conflicts: this.store.conflicts.slice(0, 200),
          consensus: this.store.consensus.slice(0, 200),
        })
      );
    } catch {
      // ignore
    }
  }

  public saveSession(session: CollaborationSession): CollaborationSession {
    const idx = this.store.sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) this.store.sessions[idx] = session;
    else this.store.sessions.unshift(session);
    this.persist();
    return session;
  }

  public getSession(id: string): CollaborationSession | undefined {
    return this.store.sessions.find((s) => s.id === id);
  }

  public listSessions(): CollaborationSession[] {
    return [...this.store.sessions].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public saveContribution(c: AgentContribution): AgentContribution {
    const idx = this.store.contributions.findIndex((x) => x.id === c.id);
    if (idx >= 0) this.store.contributions[idx] = c;
    else this.store.contributions.unshift(c);
    this.persist();
    return c;
  }

  public listContributions(sessionId: string): AgentContribution[] {
    return this.store.contributions
      .filter((c) => c.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public saveMessage(m: AgentMessage): AgentMessage {
    this.store.messages.unshift(m);
    this.persist();
    return m;
  }

  public listMessages(sessionId: string): AgentMessage[] {
    return this.store.messages
      .filter((m) => m.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public saveConflict(c: Conflict): Conflict {
    const idx = this.store.conflicts.findIndex((x) => x.id === c.id);
    if (idx >= 0) this.store.conflicts[idx] = c;
    else this.store.conflicts.unshift(c);
    this.persist();
    return c;
  }

  public listConflicts(sessionId: string): Conflict[] {
    return this.store.conflicts.filter((c) => c.sessionId === sessionId);
  }

  public saveConsensus(c: Consensus): Consensus {
    const idx = this.store.consensus.findIndex((x) => x.id === c.id);
    if (idx >= 0) this.store.consensus[idx] = c;
    else this.store.consensus.unshift(c);
    this.persist();
    return c;
  }

  public listConsensus(sessionId: string): Consensus[] {
    return this.store.consensus.filter((c) => c.sessionId === sessionId);
  }

  public getBundle(sessionId: string): CollaborationSessionBundle | undefined {
    const session = this.getSession(sessionId);
    if (!session) return undefined;
    return {
      session,
      contributions: this.listContributions(sessionId),
      messages: this.listMessages(sessionId),
      conflicts: this.listConflicts(sessionId),
      consensus: this.listConsensus(sessionId),
    };
  }

  public clear(): void {
    this.store = {
      sessions: [],
      contributions: [],
      messages: [],
      conflicts: [],
      consensus: [],
    };
    this.persist();
  }
}
