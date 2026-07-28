export interface RepositoryLogEntry {
  id: string;
  repoId: string;
  type: 'INFO' | 'SCAN' | 'INDEX' | 'FETCH' | 'ERROR';
  message: string;
  timestamp: string;
}

export class RepositoryLogger {
  private logs: RepositoryLogEntry[] = [];

  public log(repoId: string, type: RepositoryLogEntry['type'], message: string): void {
    const entry: RepositoryLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      repoId,
      type,
      message,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(entry);
  }

  public getLogs(repoId?: string): RepositoryLogEntry[] {
    if (repoId) {
      return this.logs.filter((l) => l.repoId === repoId);
    }
    return this.logs;
  }
}
