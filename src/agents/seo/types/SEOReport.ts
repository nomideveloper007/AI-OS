import type { SEOIssue } from './SEOIssue';
import type { SEORecommendation } from './SEORecommendation';
import type { SEOScore } from './SEOScore';

export interface SEOGeneratedTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  estimatedImpact: string;
  status: 'generated' | 'queued' | 'acknowledged';
}

export interface SEOReport {
  id: string;
  auditId: string;
  websiteId?: string;
  domain: string;
  websiteName?: string;
  createdAt: string;
  overallSeoScore: number;
  score: SEOScore;
  criticalIssues: SEOIssue[];
  warnings: SEOIssue[];
  opportunities: SEOIssue[];
  quickWins: SEORecommendation[];
  longTermImprovements: SEORecommendation[];
  recommendations: SEORecommendation[];
  estimatedSeoImpact: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  executiveSummary: string;
  generatedTasks: SEOGeneratedTask[];
  memoryItemId?: string;
  modelId?: string;
  providerId?: string;
  promptVersion: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  rawAiJson?: Record<string, unknown>;
  /** Exact assistant text from the model — must match Network tab content. */
  rawAiContent?: string;
  /** Where the analysis came from */
  analysisSource?: 'ai_engine' | 'ai_engine_text' | 'heuristic_offline';
}
