import { CEOExecutiveReport } from './CEOContext';

export class CEOHistory {
  private reports: CEOExecutiveReport[] = [];

  public recordReport(report: CEOExecutiveReport): void {
    this.reports.unshift(report);
  }

  public getReports(): CEOExecutiveReport[] {
    return [...this.reports];
  }

  public getLatestReport(): CEOExecutiveReport | undefined {
    return this.reports[0];
  }
}
