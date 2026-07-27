export interface WorkflowContext {
  executionId: string;
  workflowId: string;
  environment: 'production' | 'staging' | 'development';
  variables: Record<string, any>;
  stepResults: Record<string, any>;
  startedAt: string;
}
