import { CEOContextData, CEOExecutiveReport } from './CEOContext';
import { CEOAnalyzer } from './CEOAnalyzer';
import { CEOTaskGenerator } from './CEOTaskGenerator';
import { DEFAULT_CEO_CONFIG } from './CEOConfig';

export class CEOPlanner {
  private analyzer = new CEOAnalyzer();

  public async plan(context: CEOContextData): Promise<CEOExecutiveReport> {
    const rawAnalysis = await this.analyzer.analyze(context);
    const tasks = CEOTaskGenerator.generateTasks(rawAnalysis.risks, rawAnalysis.opportunities);

    const report: CEOExecutiveReport = {
      id: `rep-ceo-${Date.now()}`,
      timestamp: new Date().toISOString(),
      website: context.websiteDomain,
      model: DEFAULT_CEO_CONFIG.modelId,
      provider: DEFAULT_CEO_CONFIG.providerId,
      promptVersion: 'v1.0-executive',
      executiveSummary: rawAnalysis.executiveSummary,
      healthScores: rawAnalysis.healthScores,
      businessGoalAlignment: rawAnalysis.businessGoalAlignment,
      strengths: rawAnalysis.strengths,
      weaknesses: rawAnalysis.weaknesses,
      risks: rawAnalysis.risks,
      opportunities: rawAnalysis.opportunities,
      recommendedPriorities: rawAnalysis.recommendedPriorities,
      actionPlan: rawAnalysis.actionPlan,
      confidenceScore: rawAnalysis.confidenceScore,
      tasks
    };

    return report;
  }
}
