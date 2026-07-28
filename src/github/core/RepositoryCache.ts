import { RepositoryCacheRepository } from '../repositories/RepositoryCacheRepository';
import { RepositoryObject } from '../types/Repository';

export class RepositoryCache {
  private storage = RepositoryCacheRepository.getInstance();

  public getCachedRepo(id: string): RepositoryObject | undefined {
    return this.storage.get(id);
  }

  public setCachedRepo(repo: RepositoryObject): void {
    this.storage.set(repo);
  }

  public clear(): void {
    this.storage.clear();
  }
}
