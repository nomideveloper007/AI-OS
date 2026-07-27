export type PlanPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type PlanHorizon = 'daily' | 'weekly' | 'monthly' | 'quarterly';

export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  horizon: PlanHorizon;
  priority: PlanPriority;
  successMetric: string;
  ownerEmployee: string;
}

export interface StrategicPriority {
  id: string;
  rank: number;
  title: string;
  rationale: string;
  priority: PlanPriority;
  estimatedImpact: string;
  relatedGoalIds: string[];
}

export interface PlannedTask {
  id: string;
  title: string;
  description: string;
  priority: PlanPriority;
  category: 'SEO' | 'Security' | 'Performance' | 'Content' | 'UX' | 'Architecture' | 'Growth';
  estimatedImpact: string;
  suggestedAgent: string;
  horizon: PlanHorizon;
  reason: string;
  /** Created in Task Engine (plan only — not executed by CEO). */
  taskEngineId?: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  horizon: PlanHorizon;
  periodLabel: string;
  items: string[];
  priority: PlanPriority;
}

export interface StrategicPlan {
  id: string;
  domain: string;
  websiteId?: string;
  createdAt: string;
  promptVersion: string;
  modelId?: string;
  providerId?: string;
  executiveSummary: string;
  businessHealthScore: number;
  healthBreakdown: {
    overall: number;
    website: number;
    seo: number;
    performance: number;
    security: number;
    content: number;
    growth: number;
    operations: number;
  };
  strategicGoals: StrategicGoal[];
  topPriorities: StrategicPriority[];
  immediateActions: string[];
  longTermStrategy: string[];
  recommendedEmployees: string[];
  estimatedImpact: string;
  risks: Array<{
    id: string;
    title: string;
    severity: PlanPriority;
    description: string;
    mitigation: string;
  }>;
  opportunities: Array<{
    id: string;
    title: string;
    potentialGrowth: string;
    description: string;
    actionPlan: string;
  }>;
  roadmap: {
    daily: RoadmapItem[];
    weekly: RoadmapItem[];
    monthly: RoadmapItem[];
    quarterly: RoadmapItem[];
  };
  plannedTasks: PlannedTask[];
  progress: {
    completedTasks: number;
    failedTasks: number;
    openTasks: number;
    completionRate: number;
  };
  sourceNotes: {
    websiteIntelligenceLoaded: boolean;
    memoryItemsLoaded: number;
    historicalReportsLoaded: number;
    taskHistoryLoaded: number;
  };
}

export interface PlanningInputBundle {
  domain: string;
  websiteId?: string;
  businessGoals: string[];
  websiteIntelligence?: Record<string, unknown>;
  memorySnippets: Array<{ title: string; snippet: string; category?: string }>;
  historicalReports: Array<{ id: string; summary: string; score?: number; createdAt?: string }>;
  completedTasks: Array<{ id: string; title: string; category?: string }>;
  failedTasks: Array<{ id: string; title: string; category?: string }>;
  openTasks: Array<{ id: string; title: string; status?: string }>;
  workflowHistory: Array<{ id: string; name: string; status?: string }>;
}
