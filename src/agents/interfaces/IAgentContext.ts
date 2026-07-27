export interface IAgentContext {
  workspaceId: string;
  websiteId?: string;
  environment: 'production' | 'staging' | 'development';
  sharedMemory: Record<string, any>;
  sessionTokens: number;
}
