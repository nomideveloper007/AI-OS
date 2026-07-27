import { MemoryItem } from '../types/Memory';

export class MemoryStorage {
  private static instance: MemoryStorage;
  private store: Map<string, MemoryItem> = new Map();

  private constructor() {
    this.seedDefaultMemories();
  }

  public static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  private seedDefaultMemories(): void {
    const defaultItems: MemoryItem[] = [
      {
        id: 'mem-101',
        title: 'TaskToMoney Technical Stack Specification',
        description: 'Next.js 14 App Router, TailwindCSS, TypeScript, PostgreSQL DB schema and Stripe Webhook configurations.',
        content: 'Full domain technical profile stored for TaskToMoney.com. Uses SSR for SEO optimization.',
        type: 'Website Memory',
        category: 'Website',
        priority: 'High',
        tags: ['Next.js', 'TaskToMoney', 'Architecture', 'Stripe'],
        source: 'Website Scanner Engine',
        website: 'tasktomoney.com',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        visibility: 'Global',
        status: 'Active',
        isPinned: true,
        timeline: [
          { id: 'evt-1', event: 'Stored', details: 'Initial technical profile saved.', timestamp: '3 days ago' },
          { id: 'evt-2', event: 'Updated', details: 'Added Stripe webhook endpoints.', timestamp: 'Yesterday' }
        ]
      },
      {
        id: 'mem-102',
        title: 'AI OS Core Subsystem Guidelines',
        description: 'System-wide AI Engine model routing strategy, provider registry, and prompt compilation rules.',
        content: 'All agent requests must pass through AIEngine facade. OmniRoute gateway handles routing.',
        type: 'Global Memory',
        category: 'Settings',
        priority: 'Critical',
        tags: ['AIEngine', 'Architecture', 'Routing', 'Global'],
        source: 'System Core Administrator',
        website: 'ai-os.io',
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        visibility: 'Global',
        status: 'Active',
        isPinned: true,
        timeline: [
          { id: 'evt-3', event: 'Created', details: 'Global memory policy initialized.', timestamp: '5 days ago' }
        ]
      },
      {
        id: 'mem-103',
        title: 'SEO Agent Target Keywords & Canonical Strategy',
        description: 'Primary keywords: AI Automation, AI Workforce, Autonomous Website Management.',
        content: 'Targeting rank #1 for autonomous web master tools.',
        type: 'Agent Memory',
        category: 'SEO',
        priority: 'High',
        tags: ['SEO', 'Keywords', 'Agent', 'Strategy'],
        source: 'SEO Specialist Agent',
        website: 'ai-os.io',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date().toISOString(),
        visibility: 'Team',
        status: 'Active',
        isPinned: false,
        timeline: [
          { id: 'evt-4', event: 'Indexed', details: 'Keywords indexed in memory registry.', timestamp: '2 days ago' }
        ]
      },
      {
        id: 'mem-104',
        title: 'Security Sentinel HTTPS Header Audit Log',
        description: 'HSTS, CSP, and X-Frame-Options headers verified across all 5 connected websites.',
        content: 'Security scan passed with 0 vulnerability warnings.',
        type: 'Long Term Memory',
        category: 'Security',
        priority: 'Medium',
        tags: ['Security', 'Audit', 'HTTPS', 'Headers'],
        source: 'Security Sentinel Agent',
        website: 'ai-os.io',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        visibility: 'Agent-Only',
        status: 'Active',
        isPinned: false,
        timeline: [
          { id: 'evt-5', event: 'Logged', details: 'Audit entry stored.', timestamp: '4 days ago' }
        ]
      }
    ];

    defaultItems.forEach((item) => this.store.set(item.id, item));
  }

  public save(item: MemoryItem): void {
    this.store.set(item.id, item);
  }

  public get(id: string): MemoryItem | undefined {
    return this.store.get(id);
  }

  public getAll(): MemoryItem[] {
    return Array.from(this.store.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public delete(id: string): boolean {
    return this.store.delete(id);
  }
}
