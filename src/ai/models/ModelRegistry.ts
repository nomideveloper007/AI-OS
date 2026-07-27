import { AIModel } from './ModelCapabilities';

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models: Map<string, AIModel> = new Map();

  private constructor() {
    this.registerDefaultModels();
  }

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  private registerDefaultModels(): void {
    const defaultModels: AIModel[] = [
      {
        id: 'mock-gpt-4o',
        name: 'Mock GPT-4o',
        provider: 'mock',
        description: 'Mock high-intelligence multimodal model for testing AI OS engine.',
        capabilities: {
          supportsVision: true,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 128000,
          maxOutputTokens: 4096
        },
        status: 'active'
      },
      {
        id: 'mock-claude-3-5-sonnet',
        name: 'Mock Claude 3.5 Sonnet',
        provider: 'mock',
        description: 'Mock elite reasoning and coding model.',
        capabilities: {
          supportsVision: true,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 200000,
          maxOutputTokens: 8192
        },
        status: 'active'
      },
      {
        id: 'mock-gemini-1-5-pro',
        name: 'Mock Gemini 1.5 Pro',
        provider: 'mock',
        description: 'Mock long-context multimodal model.',
        capabilities: {
          supportsVision: true,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 1000000,
          maxOutputTokens: 8192
        },
        status: 'active'
      },
      {
        id: 'mock-deepseek-r1',
        name: 'Mock DeepSeek R1',
        provider: 'mock',
        description: 'Mock open reasoning and logical chain model.',
        capabilities: {
          supportsVision: false,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 64000,
          maxOutputTokens: 8192
        },
        status: 'active'
      },
      {
        id: 'auto/best-chat',
        name: 'OmniRoute Auto · Best Chat',
        provider: 'omniroute',
        description: 'OmniRoute auto-combo: best general chat model from connected providers.',
        capabilities: {
          supportsVision: true,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 128000,
          maxOutputTokens: 8192
        },
        status: 'active'
      },
      {
        id: 'auto/best-coding',
        name: 'OmniRoute Auto · Best Coding',
        provider: 'omniroute',
        description: 'OmniRoute auto-combo optimized for coding tasks.',
        capabilities: {
          supportsVision: false,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 128000,
          maxOutputTokens: 8192
        },
        status: 'active'
      },
      {
        id: 'auto/best-reasoning',
        name: 'OmniRoute Auto · Best Reasoning',
        provider: 'omniroute',
        description: 'OmniRoute auto-combo optimized for deep reasoning.',
        capabilities: {
          supportsVision: false,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 128000,
          maxOutputTokens: 8192
        },
        status: 'active'
      },
      {
        id: 'auto/best-fast',
        name: 'OmniRoute Auto · Best Fast',
        provider: 'omniroute',
        description: 'OmniRoute auto-combo optimized for low latency.',
        capabilities: {
          supportsVision: false,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: false,
          contextWindow: 64000,
          maxOutputTokens: 4096
        },
        status: 'active'
      }
    ];

    defaultModels.forEach((m) => this.registerModel(m));
  }

  public registerModel(model: AIModel): void {
    this.models.set(model.id, model);
  }

  public getModel(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  public getAllModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  public getModelsByProvider(providerId: string): AIModel[] {
    return this.getAllModels().filter((m) => m.provider === providerId);
  }
}
