import { RepositoryObject } from '../types/Repository';

export class RepositoryCacheRepository {
  private static instance: RepositoryCacheRepository;
  private cache: Map<string, { repo: RepositoryObject; cachedAt: string }> = new Map();

  private constructor() {}

  public static getInstance(): RepositoryCacheRepository {
    if (!RepositoryCacheRepository.instance) {
      RepositoryCacheRepository.instance = new RepositoryCacheRepository();
    }
    return RepositoryCacheRepository.instance;
  }

  public set(repo: RepositoryObject): void {
    this.cache.set(repo.id, {
      repo,
      cachedAt: new Date().toISOString()
    });
  }

  public get(id: string): RepositoryObject | undefined {
    return this.cache.get(id)?.repo;
  }

  public clear(): void {
    this.cache.clear();
  }

  public getAllCached(): RepositoryObject[] {
    return Array.from(this.cache.values()).map((item) => item.repo);
  }
}
