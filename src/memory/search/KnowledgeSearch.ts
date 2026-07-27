import { KnowledgeArticle } from '../types/Knowledge';

export class KnowledgeSearch {
  public static search(articles: KnowledgeArticle[], query?: string, category?: string): KnowledgeArticle[] {
    return articles.filter((art) => {
      if (query && query.trim().length > 0) {
        const q = query.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.summary.toLowerCase().includes(q);
        const matchesTags = art.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesTags) return false;
      }

      if (category && category !== 'all') {
        if (art.category !== category) return false;
      }

      return true;
    });
  }
}
