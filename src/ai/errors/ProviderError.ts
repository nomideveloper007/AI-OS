import { AIError } from './AIError';

export class ProviderError extends AIError {
  public readonly providerId: string;

  constructor(message: string, providerId: string, code: string = 'PROVIDER_ERROR', details?: Record<string, any>) {
    super(message, code, { ...details, providerId });
    this.name = 'ProviderError';
    this.providerId = providerId;
  }
}
