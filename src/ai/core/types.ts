export type AIChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface AIChatMessage {
  id: string;
  role: AIChatRole;
  content: string;
  name?: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: {
      name: string;
      arguments: string;
    };
  }>;
  tool_call_id?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AIChatRequest {
  modelId?: string;
  providerId?: string;
  messages: AIChatMessage[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: any[];
  responseFormat?: { type: 'json' | 'text' };
  metadata?: Record<string, any>;
}

export interface AIChatChoice {
  index: number;
  message: AIChatMessage;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
}

export interface AITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIChatResponse {
  id: string;
  modelId: string;
  providerId: string;
  /** Unix seconds from upstream OpenAI-compatible payload when present. */
  created?: number;
  choices: AIChatChoice[];
  usage: AITokenUsage;
  durationMs: number;
  timestamp: string;
}

export interface AIStreamChunk {
  id: string;
  modelId: string;
  providerId: string;
  delta: {
    role?: AIChatRole;
    content?: string;
  };
  finishReason?: string;
}

export interface AIHealthCheckResult {
  providerId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  message?: string;
  timestamp: string;
}
