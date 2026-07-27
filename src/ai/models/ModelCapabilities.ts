export interface ModelCapabilities {
  supportsVision: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  supportsReasoning: boolean;
  contextWindow: number;
  maxOutputTokens: number;
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: ModelCapabilities;
  status: 'active' | 'deprecated' | 'offline';
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
}
