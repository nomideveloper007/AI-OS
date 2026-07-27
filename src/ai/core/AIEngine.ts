import { AIManager } from './AIManager';
import { AIChatRequest, AIChatResponse, AIStreamChunk, AIHealthCheckResult } from './types';
import { AIConfig } from '../config/AIConfig';
import { RetryHandler } from '../utils/RetryHandler';
import { AILogger } from '../utils/Logger';
import { ExecutionLog } from '../utils/ExecutionLog';
import { ProviderError } from '../errors/ProviderError';
import { BaseProvider } from '../providers/BaseProvider';

export class AIEngine {
  private static instance: AIEngine;
  private manager = AIManager.getInstance();
  private config = AIConfig.getInstance();
  private logger = AILogger.getInstance();
  private executionLog = ExecutionLog.getInstance();

  private constructor() {
    // Re-bind production OmniRoute provider (clears stale HMR mock instances)
    this.manager.providers.ensureOmniRouteProduction();
    this.logger.info('AI Engine Production Mode initialized.', 'AIEngine');
  }

  public static getInstance(): AIEngine {
    if (!AIEngine.instance) {
      AIEngine.instance = new AIEngine();
    } else {
      // Keep OmniRoute provider on the production implementation across HMR
      AIEngine.instance.manager.providers.ensureOmniRouteProduction();
    }
    return AIEngine.instance;
  }

  public static resetInstance(): void {
    AIEngine.instance = undefined as unknown as AIEngine;
  }

  public getManager(): AIManager {
    return this.manager;
  }

  public getExecutionLog(): ExecutionLog {
    return this.executionLog;
  }

  private prepareRequest(request: AIChatRequest): {
    prepared: AIChatRequest;
    provider: BaseProvider;
    providerId: string;
    modelId: string;
    prompt: string;
  } {
    const configOptions = this.config.getConfig();
    const taskType = request.metadata?.taskType || 'general_chat';
    const route = this.manager.router.routeTask(taskType, request.modelId);

    const prepared: AIChatRequest = {
      ...request,
      modelId: route.model.id,
      providerId: route.provider.id,
      temperature: request.temperature ?? configOptions.temperature,
      maxTokens: request.maxTokens ?? configOptions.maxTokens,
    };

    const prompt =
      [...prepared.messages].reverse().find((m) => m.role === 'user')?.content ||
      prepared.messages[prepared.messages.length - 1]?.content ||
      '';

    this.logger.info(
      `Routing → provider='${route.provider.id}' model='${route.model.id}'`,
      'AIEngine',
      { reason: route.reason, promptChars: prompt.length }
    );

    return {
      prepared,
      provider: route.provider,
      providerId: route.provider.id,
      modelId: route.model.id,
      prompt,
    };
  }

  private logSuccess(prompt: string, response: AIChatResponse, streamed: boolean): void {
    this.executionLog.record({
      prompt,
      response: response.choices[0]?.message?.content || '',
      providerId: response.providerId,
      modelId: response.modelId,
      latencyMs: response.durationMs,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      finishReason: response.choices[0]?.finishReason || 'stop',
      success: true,
      streamed,
    });

    this.logger.info('Execution recorded', 'AIEngine', {
      providerId: response.providerId,
      modelId: response.modelId,
      latencyMs: response.durationMs,
      totalTokens: response.usage.totalTokens,
      streamed,
    });
  }

  private logFailure(
    prompt: string,
    providerId: string,
    modelId: string,
    latencyMs: number,
    err: unknown,
    streamed: boolean
  ): never {
    const code = err instanceof ProviderError ? err.code : 'AI_ENGINE_ERROR';
    const message = err instanceof Error ? err.message : String(err);

    this.executionLog.record({
      prompt,
      response: '',
      providerId,
      modelId,
      latencyMs,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      finishReason: 'error',
      success: false,
      errorCode: code,
      errorMessage: message,
      streamed,
    });

    this.logger.error(`Execution failed: ${message}`, 'AIEngine', {
      providerId,
      modelId,
      code,
      streamed,
    });

    throw err;
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const configOptions = this.config.getConfig();
    const { prepared, provider, providerId, modelId, prompt } = this.prepareRequest(request);
    const started = Date.now();

    try {
      const response = await RetryHandler.execute(
        () => provider.chat(prepared),
        {
          maxRetries: configOptions.maxRetries,
          baseDelayMs: 1000,
        },
        'AIEngine'
      );
      this.logSuccess(prompt, response, false);
      return response;
    } catch (err) {
      return this.logFailure(prompt, providerId, modelId, Date.now() - started, err, false);
    }
  }

  public async stream(
    request: AIChatRequest,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<AIChatResponse> {
    const { prepared, provider, providerId, modelId, prompt } = this.prepareRequest(request);
    const started = Date.now();

    try {
      const response = await provider.stream(prepared, onChunk);
      this.logSuccess(prompt, response, true);
      return response;
    } catch (err) {
      return this.logFailure(prompt, providerId, modelId, Date.now() - started, err, true);
    }
  }

  public async healthCheck(): Promise<AIHealthCheckResult[]> {
    const providers = this.manager.providers.getAllProviders();
    const results: AIHealthCheckResult[] = [];

    for (const p of providers) {
      results.push(await p.healthCheck());
    }

    return results;
  }
}
