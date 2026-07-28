import { RepositoryFile } from '../types/RepositoryFile';

export class RepositoryContentLoader {
  private cache: Map<string, RepositoryFile> = new Map();

  public getCachedFile(path: string): RepositoryFile | undefined {
    return this.cache.get(path);
  }

  public setFile(path: string, file: RepositoryFile): void {
    this.cache.set(path, file);
  }

  public clear(): void {
    this.cache.clear();
  }
}
