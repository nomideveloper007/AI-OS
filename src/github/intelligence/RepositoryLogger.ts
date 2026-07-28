export class RepositoryIntelligenceLogger {
  private logs: { timestamp: string; action: string; details: string }[] = [];

  public log(action: string, details: string): void {
    this.logs.unshift({
      timestamp: new Date().toISOString(),
      action,
      details
    });
  }

  public getLogs() {
    return this.logs;
  }
}
