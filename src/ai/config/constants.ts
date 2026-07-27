export const AI_PROVIDERS = {
  MOCK: 'mock',
  OMNIROUTE: 'omniroute',
  OPENAI: 'openai',
  ANTHROPIC: 'anthropic',
  GEMINI: 'gemini',
  LOCAL_LLM: 'local_llm'
} as const;

export const TASK_TYPES = {
  GENERAL_CHAT: 'general_chat',
  CODE_GENERATION: 'code_generation',
  FAST_REASONING: 'fast_reasoning',
  DEEP_THINKING: 'deep_thinking',
  VISION_ANALYSIS: 'vision_analysis',
  TOOL_CALLING: 'tool_calling',
  SEARCH_SUMMARY: 'search_summary'
} as const;

/** Default model as advertised by local OmniRoute GET /v1/models */
export const DEFAULT_MODEL_ID = 'auto/best-chat';
export const DEFAULT_PROVIDER_ID = 'omniroute';
export const DEFAULT_TIMEOUT_MS = 60000;
export const DEFAULT_MAX_RETRIES = 3;
export const DEFAULT_BACKOFF_FACTOR = 1.5;
