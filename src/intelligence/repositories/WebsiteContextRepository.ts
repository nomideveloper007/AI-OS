import type { WebsiteContext } from '../types/WebsiteContext';

const STORAGE_KEY = 'aios.intelligence.contexts';

export class WebsiteContextRepository {
  private static instance: WebsiteContextRepository;
  private contexts: Map<string, WebsiteContext> = new Map();

  private constructor() {
    this.load();
  }

  public static getInstance(): WebsiteContextRepository {
    if (!WebsiteContextRepository.instance) {
      WebsiteContextRepository.instance = new WebsiteContextRepository();
    }
    return WebsiteContextRepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as WebsiteContext[];
      if (!Array.isArray(list)) return;
      for (const ctx of list) {
        this.contexts.set(ctx.id, ctx);
      }
    } catch {
      // ignore corrupt storage
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      const list = Array.from(this.contexts.values()).slice(0, 100);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore quota
    }
  }

  public save(context: WebsiteContext): WebsiteContext {
    this.contexts.set(context.id, context);
    this.persist();
    return context;
  }

  public getById(id: string): WebsiteContext | undefined {
    return this.contexts.get(id);
  }

  public getLatestForWebsite(websiteId: string): WebsiteContext | undefined {
    return this.listForWebsite(websiteId)[0];
  }

  public getLatestForDomain(domain: string): WebsiteContext | undefined {
    const normalized = domain.toLowerCase();
    return this.listAll().find((c) => c.domain.toLowerCase() === normalized);
  }

  public listForWebsite(websiteId: string): WebsiteContext[] {
    return this.listAll().filter((c) => c.websiteId === websiteId);
  }

  public listAll(): WebsiteContext[] {
    return Array.from(this.contexts.values()).sort(
      (a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
    );
  }

  public clear(): void {
    this.contexts.clear();
    this.persist();
  }
}
