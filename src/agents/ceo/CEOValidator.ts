import { CEOExecutiveReport } from './CEOContext';

export class CEOValidator {
  public static validateReport(report: Partial<CEOExecutiveReport>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!report.executiveSummary) errors.push('Executive Summary is required.');
    if (!report.healthScores) errors.push('Health scores object is required.');
    if (!report.tasks || report.tasks.length === 0) errors.push('At least one task recommendation is required.');
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
