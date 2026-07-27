export interface IAgentResult {
  taskId: string;
  agentId: string;
  success: boolean;
  data?: any;
  error?: string;
  executionTimeMs: number;
  tokensUsed?: number;
  timestamp: string;
}
