export type AgentCapability = 
  | 'Website Scan' 
  | 'Read Reports' 
  | 'Generate Prompt' 
  | 'Analyze Data' 
  | 'Write Content' 
  | 'Send Email' 
  | 'Read Database';

export interface AgentCapabilitiesConfig {
  capabilities: AgentCapability[];
  maxConcurrentTasks?: number;
  allowedToolIds?: string[];
  permissions?: string[];
}
