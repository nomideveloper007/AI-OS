import { DEFAULT_PROVIDER_ID, DEFAULT_MODEL_ID, DEFAULT_TIMEOUT_MS, DEFAULT_MAX_RETRIES } from './constants';

export interface AIConfigOptions {
  defaultProviderId: string;
  defaultModelId: string;
  timeoutMs: number;
  maxRetries: number;
  enableStreaming: boolean;
  enableLogging: boolean;
  debugMode: boolean;
}

export class AIConfig {
  private static instance: AIConfig;
  private options: AIConfigOptions;

  private constructor() {
    this.options = {
      defaultProviderId: DEFAULT_PROVIDER_ID,
      defaultModelId: DEFAULT_MODEL_ID,
      timeoutMs: DEFAULT_TIMEOUT_MS,
      maxRetries: DEFAULT_MAX_RETRIES,
      enableStreaming: true,
      enableLogging: true,
      debugMode: true
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
