import type { SEOAudit } from '../types/SEOAudit';

const STORAGE_KEY = 'aios.seo.audit_history';

export class SEOHistoryRepository {
  private static instance: SEOHistoryRepository;
  private audits: Map<string, SEOAudit> = new Map();

  private constructor() {
    this.load();
  }

  public static getInstance(): SEOHistoryRepository {
    if (!SEOHistoryRepository.instance) {
      SEOHistoryRepository.instance = new SEOHistoryRepository();
    }
    return SEOHistoryRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as SEOAudit[];
      if (!Array.isArray(list)) return;
      for (const a of list) this.audits.set(a.id, a);
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.listAll().slice(0, 150)));
    } catch {
      // ignore
    }
  }

  public save(audit: SEOAudit): SEOAudit {
    this.audits.set(audit.id, audit);
    this.persist();
    return audit;
  }

  public get(id: string): SEOAudit | undefined {
    return this.audits.get(id);
  }

  public listAll(): SEOAudit[] {
    return Array.from(this.audits.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public listByDomain(domain: string): SEOAudit[] {
    return this.listAll().filter((a) => a.domain.toLowerCase() === domain.toLowerCase());
  }

  public clear(): void {
    this.audits.clear();
    this.persist();
  }
}
