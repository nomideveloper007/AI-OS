import { DEFAULT_PROVIDER_ID, DEFAULT_MODEL_ID, DEFAULT_TIMEOUT_MS, DEFAULT_MAX_RETRIES } from './constants';

export interface AIConfigOptions {
  defaultProviderId: string;
  defaultModelId: string;
  timeoutMs: number;
  maxRetries: number;
  enableStreaming: boolean;
  enableLogging: boolean;
  debugMode: boolean;
  omniRouteBaseUrl: string;
  omniRouteApiKey: string;
  temperature: number;
  maxTokens: number;
}

export class AIConfig {
  private static instance: AIConfig;
  private options: AIConfigOptions;

  private constructor() {
    // Read from env or default
    const envBaseUrl = typeof process !== 'undefined' && process.env?.OMNIROUTE_BASE_URL ? process.env.OMNIROUTE_BASE_URL : 'https://api.omniroute.ai/v1';
    const envApiKey = typeof process !== 'undefined' && process.env?.OMNIROUTE_API_KEY ? process.env.OMNIROUTE_API_KEY : '';
    const envModel = typeof process !== 'undefined' && process.env?.DEFAULT_MODEL ? process.env.DEFAULT_MODEL : 'omniroute-auto';

    this.options = {
      defaultProviderId: 'omniroute',
      defaultModelId: envModel,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      maxRetries: DEFAULT_MAX_RETRIES,
      enableStreaming: true,
      enableLogging: true,
      debugMode: true,
      omniRouteBaseUrl: envBaseUrl,
      omniRouteApiKey: envApiKey,
      temperature: 0.7,
      maxTokens: 2048
    };
  }

  public static getInstance(): AIConfig {
    if (!AIConfig.instance) {
      AIConfig.instance = new AIConfig();
    }
    return AIConfig.instance;
  }

  public getConfig(): AIConfigOptions {
    return { ...this.options };
  }

  public updateConfig(partial: Partial<AIConfigOptions>): void {
    this.options = { ...this.options, ...partial };
  }
}
