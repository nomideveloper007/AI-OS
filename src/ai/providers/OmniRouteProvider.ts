import { BaseProvider } from './BaseProvider';
import { AIChatRequest, AIChatResponse, AIStreamChunk, AIHealthCheckResult } from '../core/types';
import { AIModel } from '../models/ModelCapabilities';
import { ModelRegistry } from '../models/ModelRegistry';
import { AIConfig } from '../config/AIConfig';
import { ProviderError } from '../errors/ProviderError';
import { AILogger } from '../utils/Logger';
import { ResponseParser, OpenAIChatCompletionPayload } from '../utils/ResponseParser';
import { TokenCounter } from '../utils/TokenCounter';

function buildUrl(baseUrl: string, path: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Map legacy playground placeholders to real OmniRoute model ids. */
function resolveModelId(modelId: string | undefined, fallback: string): string {
  const id = (modelId || fallback || 'auto/best-chat').trim();
  if (!id || id === 'omniroute-auto' || id === 'omniroute') {
    return 'auto/best-chat';
  }
  return id;
}

function buildHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (apiKey.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }
  return headers;
}

async function readErrorDetail(response: Response): Promise<string> {
  try {
    const errBody = (await response.json()) as OpenAIChatCompletionPayload;
    return errBody?.error?.message || (errBody as { message?: string }).message || '';
  } catch {
    try {
      return (await response.text()).slice(0, 300);
    } catch {
      return '';
    }
  }
}

function mapHttpError(status: number, detail: string, providerId: string): ProviderError {
  const message = detail ? detail : `HTTP ${status}`;
  if (status === 401 || status === 403) {
    return new ProviderError(`Unauthorized: ${message}`, providerId, 'UNAUTHORIZED', { status });
  }
  if (status === 404) {
    return new ProviderError(`Invalid model or route: ${message}`, providerId, 'INVALID_MODEL', {
      status,
    });
  }
  if (status === 429) {
    return new ProviderError(`Rate limit exceeded: ${message}`, providerId, 'RATE_LIMIT', { status });
  }
  if (status === 408) {
    return new ProviderError(`Request timeout: ${message}`, providerId, 'TIMEOUT', { status });
  }
  if (status === 502 || status === 503 || status === 504) {
    return new ProviderError(`Provider offline: ${message}`, providerId, 'PROVIDER_OFFLINE', {
      status,
    });
  }
  return new ProviderError(`OmniRoute error (${status}): ${message}`, providerId, 'HTTP_ERROR', {
    status,
  });
}

export class OmniRouteProvider extends BaseProvider {
  public readonly id = 'omniroute';
  public readonly name = 'OmniRoute Gateway';
  public isConnected = true;
  private logger = AILogger.getInstance();
  private config = AIConfig.getInstance();

  public async initialize(): Promise<void> {
    this.logger.info('Initializing OmniRouteProvider (production mode)...', 'OmniRouteProvider');
    this.isConnected = true;
  }

  public async connect(): Promise<void> {
    this.isConnected = true;
    this.logger.info('Connected to OmniRoute AI gateway.', 'OmniRouteProvider');
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false;
    this.logger.info('Disconnected from OmniRoute AI gateway.', 'OmniRouteProvider');
  }

  private requireBaseUrl(): string {
    const baseUrl = this.config.getConfig().omniRouteBaseUrl;
    if (!baseUrl) {
      throw new ProviderError(
        'OmniRoute base URL is not configured. Set VITE_OMNIROUTE_BASE_URL or Settings → Providers.',
        this.id,
        'CONFIG_ERROR'
      );
    }
    return baseUrl;
  }

  public async chat(request: AIChatRequest): Promise<AIChatResponse> {
    const startTime = Date.now();
    const cfg = this.config.getConfig();
    const modelId = resolveModelId(request.modelId || cfg.defaultModelId, 'auto/best-chat');
    const baseUrl = this.requireBaseUrl();
    const lastMessage = request.messages[request.messages.length - 1]?.content || '';

    this.logger.info(`Chat → OmniRoute (${modelId})`, 'OmniRouteProvider', {
      modelId,
      promptLength: lastMessage.length,
      temperature: request.temperature ?? cfg.temperature,
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeoutMs || 60000);

    try {
      const response = await fetch(buildUrl(baseUrl, '/chat/completions'), {
        method: 'POST',
        headers: buildHeaders(cfg.omniRouteApiKey || ''),
        body: JSON.stringify({
          model: modelId,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: request.temperature ?? cfg.temperature,
          max_tokens: request.maxTokens ?? cfg.maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const detail = await readErrorDetail(response);
        throw mapHttpError(response.status, detail, this.id);
      }

      let data: OpenAIChatCompletionPayload;
      try {
        data = (await response.json()) as OpenAIChatCompletionPayload;
      } catch {
        throw new ProviderError('Invalid JSON in chat completion response.', this.id, 'INVALID_JSON');
      }

      const parsed = ResponseParser.parseOpenAIChatCompletion(data, {
        modelId,
        providerId: this.id,
        durationMs: Date.now() - startTime,
      });

      this.logger.info(`Chat ← OmniRoute ${parsed.durationMs}ms`, 'OmniRouteProvider', {
        modelId: parsed.modelId,
        tokens: parsed.usage.totalTokens,
        finishReason: parsed.choices[0]?.finishReason,
      });

      return parsed;
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw this.normalizeFetchError(err, cfg.timeoutMs || 60000, baseUrl);
    }
  }

  public async stream(
    request: AIChatRequest,
    onChunk: (chunk: AIStreamChunk) => void
  ): Promise<AIChatResponse> {
    const startTime = Date.now();
    const cfg = this.config.getConfig();
    const modelId = resolveModelId(request.modelId || cfg.defaultModelId, 'auto/best-chat');
    const baseUrl = this.requireBaseUrl();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), cfg.timeoutMs || 60000);

    let fullContent = '';
    let resolvedModelId = modelId;
    let responseId = `chatcmpl-omni-${Date.now()}`;
    let created = Math.floor(Date.now() / 1000);
    let finishReason: AIChatResponse['choices'][0]['finishReason'] = 'stop';
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let chunkIndex = 0;

    try {
      const response = await fetch(buildUrl(baseUrl, '/chat/completions'), {
        method: 'POST',
        headers: {
          ...buildHeaders(cfg.omniRouteApiKey || ''),
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          model: modelId,
          messages: request.messages.map((m) => ({ role: m.role, content: m.content })),
          temperature: request.temperature ?? cfg.temperature,
          max_tokens: request.maxTokens ?? cfg.maxTokens,
          stream: true,
          stream_options: { include_usage: true },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        clearTimeout(timeoutId);
        const detail = await readErrorDetail(response);
        throw mapHttpError(response.status, detail, this.id);
      }

      if (!response.body) {
        clearTimeout(timeoutId);
        this.logger.warn('Stream body missing; falling back to non-streaming chat.', 'OmniRouteProvider');
        return this.chat(request);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          let parsed: OpenAIChatCompletionPayload | '[DONE]' | null;
          try {
            parsed = ResponseParser.parseSSEDataLine(line);
          } catch (sseErr) {
            if (sseErr instanceof ProviderError && sseErr.code === 'INVALID_JSON') {
              this.logger.warn('Skipping malformed SSE line', 'OmniRouteProvider');
              continue;
            }
            throw sseErr;
          }
          if (!parsed || parsed === '[DONE]') continue;

          if (parsed.id) responseId = parsed.id;
          if (parsed.model) resolvedModelId = parsed.model;
          if (typeof parsed.created === 'number') created = parsed.created;
          if (parsed.usage) {
            usage = ResponseParser.parseUsage(parsed.usage);
          }

          const choice = parsed.choices?.[0];
          if (!choice) continue;

          if (choice.finish_reason) {
            finishReason = ResponseParser.normalizeFinishReason(choice.finish_reason);
          }

          const deltaText = ResponseParser.extractMessageContent(
            choice.delta?.content as string | Array<{ type?: string; text?: string }> | null | undefined
          );
          if (!deltaText) continue;

          fullContent += deltaText;
          chunkIndex += 1;
          onChunk({
            id: `${responseId}-${chunkIndex}`,
            modelId: resolvedModelId,
            providerId: this.id,
            delta: {
              role: chunkIndex === 1 ? 'assistant' : undefined,
              content: deltaText,
            },
            finishReason: choice.finish_reason || undefined,
          });
        }
      }

      clearTimeout(timeoutId);

      if (!fullContent) {
        throw new ProviderError('Empty streaming response from OmniRoute.', this.id, 'EMPTY_RESPONSE');
      }

      if (usage.totalTokens === 0) {
        const promptTokens = TokenCounter.estimateMessageTokens(
          request.messages.map((m) => ({ role: m.role, content: m.content }))
        );
        const completionTokens = TokenCounter.estimateTokens(fullContent);
        usage = {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        };
      }

      const durationMs = Date.now() - startTime;
      this.logger.info(`Stream ← OmniRoute ${durationMs}ms`, 'OmniRouteProvider', {
        modelId: resolvedModelId,
        tokens: usage.totalTokens,
        chunks: chunkIndex,
      });

      return {
        id: responseId,
        modelId: resolvedModelId,
        providerId: this.id,
        created,
        choices: [
          {
            index: 0,
            message: {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: fullContent,
              timestamp: new Date().toISOString(),
            },
            finishReason,
          },
        ],
        usage,
        durationMs,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      throw this.normalizeFetchError(err, cfg.timeoutMs || 60000, baseUrl);
    }
  }

  private normalizeFetchError(err: unknown, timeoutMs: number, baseUrl: string): ProviderError {
    if (err instanceof ProviderError) return err;
    const anyErr = err as { name?: string; message?: string };
    if (anyErr?.name === 'AbortError') {
      this.logger.error(`OmniRoute timed out after ${timeoutMs}ms`, 'OmniRouteProvider');
      return new ProviderError('OmniRoute connection timed out.', this.id, 'TIMEOUT');
    }
    this.logger.error(`OmniRoute network error: ${anyErr?.message}`, 'OmniRouteProvider');
    return new ProviderError(
      `Network error reaching OmniRoute (${baseUrl}): ${anyErr?.message || 'unknown'}`,
      this.id,
      'NETWORK_ERROR'
    );
  }

  public async listModels(): Promise<AIModel[]> {
    const cfg = this.config.getConfig();
    if (!cfg.omniRouteBaseUrl) {
      return ModelRegistry.getInstance().getModelsByProvider(this.id);
    }

    try {
      const res = await fetch(buildUrl(cfg.omniRouteBaseUrl, '/models'), {
        headers: buildHeaders(cfg.omniRouteApiKey || ''),
      });
      if (!res.ok) {
        return ModelRegistry.getInstance().getModelsByProvider(this.id);
      }
      const data = await res.json();
      const items = Array.isArray(data?.data) ? data.data : [];
      return items.slice(0, 50).map((m: { id?: string }) => ({
        id: m.id || 'unknown',
        name: m.id || 'unknown',
        provider: this.id,
        description: `OmniRoute model ${m.id}`,
        capabilities: {
          supportsVision: true,
          supportsTools: true,
          supportsStreaming: true,
          supportsReasoning: true,
          contextWindow: 128000,
          maxOutputTokens: 8192,
        },
        status: 'active' as const,
      }));
    } catch {
      return ModelRegistry.getInstance().getModelsByProvider(this.id);
    }
  }

  public async healthCheck(): Promise<AIHealthCheckResult> {
    const cfg = this.config.getConfig();
    const startTime = Date.now();

    if (!cfg.omniRouteBaseUrl) {
      return {
        providerId: this.id,
        status: 'unhealthy',
        latencyMs: 0,
        message: 'OmniRoute base URL not configured',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const res = await fetch(buildUrl(cfg.omniRouteBaseUrl, '/models'), {
        headers: buildHeaders(cfg.omniRouteApiKey || ''),
      });
      const latency = Date.now() - startTime;
      if (res.ok) {
        this.isConnected = true;
        return {
          providerId: this.id,
          status: 'healthy',
          latencyMs: latency,
          message: `OmniRoute Production Mode Connected (${latency}ms)`,
          timestamp: new Date().toISOString(),
        };
      }
      this.isConnected = false;
      return {
        providerId: this.id,
        status: 'unhealthy',
        latencyMs: latency,
        message: `OmniRoute /models returned HTTP ${res.status}`,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      this.isConnected = false;
      const message = err instanceof Error ? err.message : 'network error';
      return {
        providerId: this.id,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        message: `Provider offline: ${message}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
