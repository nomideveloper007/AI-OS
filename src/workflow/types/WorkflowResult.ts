export interface WorkflowResult {
  executionId: string;
  workflowId: string;
  success: boolean;
  stepsCompleted: number;
  totalSteps: number;
  executionTimeMs: number;
  error?: string;
  timestamp: string;
}
