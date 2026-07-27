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
  category: 'SEO' | 'Security' | 'Performance' | 'Content' | 'UX' | 'Architecture';
  estimatedImpact: 'High' | 'Medium' | 'Low';
  estimatedDifficulty: 'Easy' | 'Moderate' | 'Hard';
  suggestedAgent: string;
  reason: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  approvalRequired: boolean;
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
}

export interface CEOContextData {
  websiteDomain: string;
  scannerData?: any;
  memoryItems?: any[];
  previousReports?: CEOExecutiveReport[];
  workflowHistory?: any[];
}
