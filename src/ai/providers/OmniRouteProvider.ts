import { BaseProvider } from './BaseProvider';
import { AIChatRequest, AIChatResponse, AIStreamChunk, AIHealthCheckResult } from '../core/types';
import { AIModel } from '../models/ModelCapabilities';
import { ModelRegistry } from '../models/ModelRegistry';
import { AILogger } from '../utils/Logger';

export class OmniRouteProvider extends BaseProvider {
  public readonly id = 'omniroute';
  public readonly name = 'OmniRoute Smart Gateway (Placeholder)';
  public isConnected = false;
  private logger = AILogger.getInstance();

  public async initialize(): Promise<void> {
    this.logger.info('Initializing OmniRouteProvider stub...', 'OmniRouteProvider');
  }

  public async connect(): Promise<void> {
    this.isConnected = false;
    this.logger.warn('OmniRoute gateway is in architecture mode. No active endpoint configured.', 'OmniRouteProvider');
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    this.logger.warn('Chat routed to OmniRoute fallback mock.', 'OmniRouteProvider');
    const startTime = Date.now();
    return {
      id: `chatcmpl-omni-${Date.now()}`,
      modelId: request.modelId || 'omniroute-auto',
      providerId: this.id,
      choices: [
        {
          index: 0,
          message: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: '[OmniRoute Placeholder] Request received by OmniRoute gateway abstraction layer.',
            timestamp: new Date().toISOString()
          },
          finishReason: 'stop'
        }
      ],
      usage: { promptTokens: 10, completionTokens: 15, totalTokens: 25 },
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }

  public async stream(request: AIChatRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<AIChatResponse> {
    onChunk({
      id: `chunk-omni-${Date.now()}`,
      modelId: 'omniroute-auto',
      providerId: this.id,
      delta: { role: 'assistant', content: '[OmniRoute Stream Placeholder]' },
      finishReason: 'stop'
    });
    return this.chat(request);
  }

  public async listModels(): Promise<AIModel[]> {
    return ModelRegistry.getInstance().getModelsByProvider(this.id);
  }

  public async healthCheck(): Promise<AIHealthCheckResult> {
    return {
      providerId: this.id,
      status: 'degraded',
      latencyMs: 0,
      message: 'OmniRoute provider stub initialized.',
      timestamp: new Date().toISOString()
    };
  }
}
