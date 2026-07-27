import { KnowledgeStorage } from '../storage/KnowledgeStorage';
import { KnowledgeArticle } from '../types/Knowledge';

export class KnowledgeRepository {
  private storage = KnowledgeStorage.getInstance();

  public saveArticle(article: KnowledgeArticle): void {
    this.storage.save(article);
  }

  public getArticleById(id: string): KnowledgeArticle | undefined {
    return this.storage.get(id);
  }

  public getAllArticles(): KnowledgeArticle[] {
    return this.storage.getAll();
  }
}
