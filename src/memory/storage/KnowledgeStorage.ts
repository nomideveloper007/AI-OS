import { KnowledgeArticle } from '../types/Knowledge';

export class KnowledgeStorage {
  private static instance: KnowledgeStorage;
  private articles: Map<string, KnowledgeArticle> = new Map();

  private constructor() {
    this.seedDefaultKnowledge();
  }

  public static getInstance(): KnowledgeStorage {
    if (!KnowledgeStorage.instance) {
      KnowledgeStorage.instance = new KnowledgeStorage();
    }
    return KnowledgeStorage.instance;
  }

  private seedDefaultKnowledge(): void {
    const defaultArticles: KnowledgeArticle[] = [
      {
        id: 'kb-201',
        title: 'Modern SEO Optimization Best Practices for SaaS Web Apps',
        summary: 'Guide on meta tags, canonical URL structures, schema markups, and PageSpeed metrics.',
        category: 'SEO',
        tags: ['SEO', 'SaaS', 'Optimization', 'MetaTags'],
        author: 'SEO Specialist Agent',
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        readCount: 42
      },
      {
        id: 'kb-202',
        title: 'Enterprise Web Security & Security Headers Checklist',
        summary: 'Detailed explanation of HSTS, CSP directives, CORS, and X-Content-Type-Options.',
        category: 'Security',
        tags: ['Security', 'HTTPS', 'Headers', 'Audit'],
        author: 'Security Sentinel Agent',
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        readCount: 29
      },
      {
        id: 'kb-203',
        title: 'Growth Marketing Funnel Analysis for AI Operating Systems',
        summary: 'Strategies for landing page conversion optimization and user onboarding flows.',
        category: 'Marketing',
        tags: ['Growth', 'Funnel', 'Conversion', 'Marketing'],
        author: 'Growth Marketing Agent',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date().toISOString(),
        readCount: 18
      }
    ];

    defaultArticles.forEach((art) => this.articles.set(art.id, art));
  }

  public save(article: KnowledgeArticle): void {
    this.articles.set(article.id, article);
  }

  public get(id: string): KnowledgeArticle | undefined {
    return this.articles.get(id);
  }

  public getAll(): KnowledgeArticle[] {
    return Array.from(this.articles.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
}
