export interface AIToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
}

export interface AIToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'scanner' | 'file' | 'database' | 'email' | 'browser' | 'terminal' | 'search';
  parameters: AIToolParameter[];
  version: string;
}

export interface AIToolExecutionResult {
  toolId: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTimeMs: number;
}
