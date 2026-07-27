/**
 * Single shared context for all agents in a collaboration session.
 * Built once — no duplicated memory / intelligence lookups per agent.
 */
export interface SharedContext {
  sessionId: string;
  domain?: string;
  websiteId?: string;
  objective: string;
  businessGoals: string[];
  memorySnippets: Array<{
    id: string;
    title: string;
    snippet: string;
    category?: string;
  }>;
  websiteContext?: Record<string, unknown>;
  websiteSummary?: string;
  priorReports: Array<{
    id: string;
    title: string;
    snippet: string;
  }>;
  taskHints: Array<{
    id: string;
    title: string;
    status?: string;
  }>;
  builtAt: string;
  sourceNotes: {
    memoryLoaded: number;
    websiteIntelligenceLoaded: boolean;
    reportsLoaded: number;
    tasksLoaded: number;
  };
}
