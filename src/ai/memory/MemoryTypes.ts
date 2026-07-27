export type MemoryType = 
  | 'short_term' 
  | 'long_term' 
  | 'website_memory' 
  | 'agent_memory' 
  | 'global_memory' 
  | 'project_memory';

export interface MemoryRecord {
  id: string;
  type: MemoryType;
  key: string;
  value: any;
  websiteId?: string;
  agentId?: string;
  embeddingVector?: number[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}
