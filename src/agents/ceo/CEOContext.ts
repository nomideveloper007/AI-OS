import type { StrategicPlan } from './planning/planTypes';

export interface HealthScores {
  overall: number;
  website: number;
  seo: number;
  performance: number;
  security: number;
  content: number;
  userExperience: number;
  accessibility: number;
}

export interface CEOTaskRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'SEO' | 'Security' | 'Performance' | 'Content' | 'UX' | 'Architecture' | 'Growth';
  estimatedImpact: 'High' | 'Medium' | 'Low' | string;
  estimatedDifficulty: 'Easy' | 'Moderate' | 'Hard';
  suggestedAgent: string;
  reason: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  approvalRequired: boolean;
  taskEngineId?: string;
  horizon?: string;
}

export interface CEORiskItem {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  mitigationStrategy: string;
}

export interface CEOOpportunityItem {
  id: string;
  title: string;
  potentialGrowth: string;
  description: string;
  actionPlan: string;
}

export interface CEOExecutiveReport {
  id: string;
  timestamp: string;
  website: string;
  model: string;
  provider: string;
  promptVersion: string;
  executiveSummary: string;
  healthScores: HealthScores;
  businessGoalAlignment: string;
  strengths: string[];
  weaknesses: string[];
  risks: CEORiskItem[];
  opportunities: CEOOpportunityItem[];
  recommendedPriorities: string[];
  actionPlan: string[];
  confidenceScore: number;
  tasks: CEOTaskRecommendation[];
  /** Full strategic plan from CEO planning brain (plan-only). */
  strategicPlan?: StrategicPlan;
  recommendedEmployees?: string[];
  estimatedImpact?: string;
  longTermStrategy?: string[];
  immediateActions?: string[];
}

export interface CEOContextData {
  websiteDomain: string;
  websiteId?: string;
  scannerData?: Record<string, unknown>;
  websiteIntelligence?: Record<string, unknown>;
  memoryItems?: Array<{ title: string; snippet: string; category?: string }>;
  previousReports?: CEOExecutiveReport[];
  workflowHistory?: Array<{ id: string; name: string; status?: string }>;
  businessGoals?: string[];
  completedTasks?: Array<{ id: string; title: string; category?: string }>;
  failedTasks?: Array<{ id: string; title: string; category?: string }>;
  openTasks?: Array<{ id: string; title: string; status?: string }>;
}
