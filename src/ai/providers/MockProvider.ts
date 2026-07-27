import { BaseProvider } from './BaseProvider';
import { AIChatRequest, AIChatResponse, AIStreamChunk, AIHealthCheckResult } from '../core/types';
import { AIModel } from '../models/ModelCapabilities';
import { ModelRegistry } from '../models/ModelRegistry';
import { AILogger } from '../utils/Logger';

export class MockProvider extends BaseProvider {
  public readonly id = 'mock';
  public readonly name = 'Mock Provider Engine';
  public isConnected = true;
  private logger = AILogger.getInstance();

  public async initialize(): Promise<void> {
    this.logger.info('Initializing MockProvider engine...', 'MockProvider');
    this.isConnected = true;
  }

  public async connect(): Promise<void> {
    this.isConnected = true;
    this.logger.info('Connected to MockProvider.', 'MockProvider');
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.logger.info('Disconnected from MockProvider.', 'MockProvider');
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const startTime = Date.now();
    const modelId = request.modelId || 'mock-gpt-4o';

    this.logger.info(`Processing chat request with model ${modelId}`, 'MockProvider');

    const lastMessage = request.messages[request.messages.length - 1]?.content || 'Hello';
    const mockReply = `[Mock Response] Processed query: "${lastMessage.substring(0, 60)}...". The AI OS Engine architecture is fully operational and safely routed.`;

    const durationMs = Date.now() - startTime;

    return {
      id: `chatcmpl-mock-${Date.now()}`,
      modelId,
      providerId: this.id,
      choices: [
        {
          index: 0,
          message: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: mockReply,
            timestamp: new Date().toISOString()
          },
          finishReason: 'stop'
        }
      ],
      usage: {
        promptTokens: Math.ceil(lastMessage.length / 4) + 12,
        completionTokens: Math.ceil(mockReply.length / 4),
        totalTokens: Math.ceil((lastMessage.length + mockReply.length) / 4) + 12
      },
      durationMs,
      timestamp: new Date().toISOString()
    };
  }

  public async stream(request: AIChatRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<AIChatResponse> {
    const startTime = Date.now();
    const modelId = request.modelId || 'mock-gpt-4o';
    const lastMessage = request.messages[request.messages.length - 1]?.content || 'Hello';

    const fullResponse = `[Mock Streaming Response] Executed request: "${lastMessage.substring(0, 40)}". AI OS engine pipeline validated successfully.`;
    const tokens = fullResponse.split(' ');

    for (let i = 0; i < tokens.length; i++) {
      const isLast = i === tokens.length - 1;
      const chunk: AIStreamChunk = {
        id: `chunk-${Date.now()}-${i}`,
        modelId,
        providerId: this.id,
        delta: {
          role: i === 0 ? 'assistant' : undefined,
          content: tokens[i] + (isLast ? '' : ' ')
        },
        finishReason: isLast ? 'stop' : undefined
      };

      onChunk(chunk);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return this.chat(request);
  }

  public async listModels(): Promise<AIModel[]> {
    return ModelRegistry.getInstance().getModelsByProvider(this.id);
  }

  public async healthCheck(): Promise<AIHealthCheckResult> {
    return {
      providerId: this.id,
      status: 'healthy',
      latencyMs: 5,
      message: 'Mock Provider engine operational.',
      timestamp: new Date().toISOString()
    };
  }
}
