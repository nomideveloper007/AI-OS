import { AIManager } from './AIManager';
import { AIChatRequest, AIChatResponse, AIStreamChunk, AIHealthCheckResult } from './types';
import { AIConfig } from '../config/AIConfig';
import { RetryHandler } from '../utils/RetryHandler';
import { AILogger } from '../utils/Logger';

export class AIEngine {
  private static instance: AIEngine;
  private manager = AIManager.getInstance();
  private config = AIConfig.getInstance();
  private logger = AILogger.getInstance();

  private constructor() {
    this.logger.info('AI Engine Enterprise Architecture Core initialized.', 'AIEngine');
  }

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    }
    return AIEngine.instance;
  }

  public getManager(): AIManager {
    return this.manager;
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const configOptions = this.config.getConfig();
    const taskType = request.metadata?.taskType || 'general_chat';

    // Route request to best model and provider
    const route = this.manager.router.routeTask(taskType, request.modelId);
    this.logger.info(`Routing request to provider '${route.provider.id}' using model '${route.model.id}'`, 'AIEngine');

    const preparedRequest: AIChatRequest = {
      ...request,
      modelId: route.model.id,
      providerId: route.provider.id
    };

    // Execute with RetryHandler
    return RetryHandler.execute(
      () => route.provider.chat(preparedRequest),
      {
        maxRetries: configOptions.maxRetries,
        baseDelayMs: 1000
      },
      'AIEngine'
    );
  }

  public async stream(request: AIChatRequest, onChunk: (chunk: AIStreamChunk) => void): Promise<AIChatResponse> {
    const taskType = request.metadata?.taskType || 'general_chat';
    const route = this.manager.router.routeTask(taskType, request.modelId);

    const preparedRequest: AIChatRequest = {
      ...request,
      modelId: route.model.id,
      providerId: route.provider.id
    };

    return route.provider.stream(preparedRequest, onChunk);
  }

  public async healthCheck(): Promise<AIHealthCheckResult[]> {
    const providers = this.manager.providers.getAllProviders();
    const results: AIHealthCheckResult[] = [];

    for (const provider of providers) {
      const res = await provider.healthCheck();
      results.push(res);
    }

    return results;
  }
}
