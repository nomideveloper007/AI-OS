import { AIChatChoice, AIChatResponse, AITokenUsage } from '../core/types';
import { ProviderError } from '../errors/ProviderError';

/** Raw OpenAI-compatible chat completion JSON. */
export interface OpenAIChatCompletionPayload {
  id?: string;
  object?: string;
  created?: number;
  model?: string;
  choices?: Array<{
    index?: number;
    message?: {
      role?: string;
      content?: string | Array<{ type?: string; text?: string }>;
    };
    delta?: {
      role?: string;
      content?: string | null;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
}

export class ResponseParser {
  public static extractJSON<T = unknown>(text: string): T | null {
    if (!text) return null;

    try {
      return JSON.parse(text) as T;
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch?.[1]) {
        try {
          return JSON.parse(jsonMatch[1]) as T;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  public static extractCodeBlocks(text: string): Array<{ language: string; code: string }> {
    const blocks: Array<{ language: string; code: string }> = [];
    const regex = /```(\w+)?\s*([\s\S]*?)\s*```/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2].trim(),
      });
    }

    return blocks;
  }

  public static extractMessageContent(
    content: string | Array<{ type?: string; text?: string }> | null | undefined
  ): string {
    if (content == null) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === 'string') return part;
          if (part && typeof part.text === 'string') return part.text;
          return '';
        })
        .join('');
    }
    return '';
  }

  public static normalizeFinishReason(
    reason: string | null | undefined
  ): AIChatChoice['finishReason'] {
    switch (reason) {
      case 'stop':
      case 'length':
      case 'tool_calls':
      case 'content_filter':
        return reason;
      case 'function_call':
        return 'tool_calls';
      default:
        return reason ? 'stop' : 'stop';
    }
  }

  public static parseUsage(usage: OpenAIChatCompletionPayload['usage']): AITokenUsage {
    const promptTokens = usage?.prompt_tokens ?? 0;
    const completionTokens = usage?.completion_tokens ?? 0;
    const totalTokens = usage?.total_tokens ?? promptTokens + completionTokens;
    return { promptTokens, completionTokens, totalTokens };
  }

  /**
   * Parse a non-streaming OpenAI-compatible chat completion body into AIChatResponse.
   */
  public static parseOpenAIChatCompletion(
    data: OpenAIChatCompletionPayload,
    fallback: { modelId: string; providerId: string; durationMs: number }
  ): AIChatResponse {
    if (data?.error?.message) {
      throw new ProviderError(data.error.message, fallback.providerId, 'PROVIDER_ERROR', {
        upstreamCode: data.error.code,
        upstreamType: data.error.type,
      });
    }

    const choice = data?.choices?.[0];
    if (!choice) {
      throw new ProviderError(
        'Invalid OpenAI response: missing choices[0].',
        fallback.providerId,
        'INVALID_JSON'
      );
    }

    const content = ResponseParser.extractMessageContent(choice.message?.content);
    const usage = ResponseParser.parseUsage(data.usage);

    return {
      id: data.id || `chatcmpl-${Date.now()}`,
      modelId: data.model || fallback.modelId,
      providerId: fallback.providerId,
      created: typeof data.created === 'number' ? data.created : Math.floor(Date.now() / 1000),
      choices: [
        {
          index: choice.index ?? 0,
          message: {
            id: `msg-${Date.now()}`,
            role: (choice.message?.role as 'assistant') || 'assistant',
            content,
            timestamp: new Date().toISOString(),
          },
          finishReason: ResponseParser.normalizeFinishReason(choice.finish_reason),
        },
      ],
      usage,
      durationMs: fallback.durationMs,
      timestamp: new Date().toISOString(),
    };
  }

  public static parseSSEDataLine(line: string): OpenAIChatCompletionPayload | '[DONE]' | null {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(':')) return null;
    if (!trimmed.startsWith('data:')) return null;
    const payload = trimmed.slice(5).trim();
    if (!payload) return null;
    if (payload === '[DONE]') return '[DONE]';
    try {
      return JSON.parse(payload) as OpenAIChatCompletionPayload;
    } catch {
      throw new ProviderError('Invalid JSON in SSE chunk.', 'omniroute', 'INVALID_JSON', {
        payloadPreview: payload.slice(0, 120),
      });
    }
  }
}
