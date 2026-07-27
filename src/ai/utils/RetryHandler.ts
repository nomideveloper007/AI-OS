import { AILogger } from './Logger';
import { ProviderError } from '../errors/ProviderError';

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any) => boolean;
}

const NON_RETRYABLE = new Set([
  'UNAUTHORIZED',
  'INVALID_MODEL',
  'RATE_LIMIT',
  'INVALID_JSON',
  'CONFIG_ERROR',
  'EMPTY_RESPONSE',
]);

function defaultShouldRetry(error: unknown): boolean {
  if (error instanceof ProviderError && NON_RETRYABLE.has(error.code)) {
    return false;
  }
  return true;
}

export class RetryHandler {
  public static async execute<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {},
    source: string = 'RetryHandler'
  ): Promise<T> {
    const logger = AILogger.getInstance();
    const maxRetries = options.maxRetries ?? 3;
    const baseDelay = options.baseDelayMs ?? 1000;
    const maxDelay = options.maxDelayMs ?? 10000;
    const backoff = options.backoffFactor ?? 2;
    const shouldRetry = options.shouldRetry ?? defaultShouldRetry;

    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await fn();
      } catch (error: any) {
        attempt++;
        if (attempt > maxRetries || !shouldRetry(error)) {
          logger.error(
            `Exhausted max retries (${maxRetries}). Operation failed: ${error.message}`,
            source
          );
          throw error;
        }

        const delay = Math.min(maxDelay, baseDelay * Math.pow(backoff, attempt - 1));
        logger.warn(
          `Attempt ${attempt}/${maxRetries} failed: ${error.message}. Retrying in ${delay}ms...`,
          source
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error('Retry loop terminated unexpectedly.');
  }
}
