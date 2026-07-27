import { BaseProvider } from './BaseProvider';
import { MockProvider } from './MockProvider';
import { OmniRouteProvider } from './OmniRouteProvider';
import { ProviderError } from '../errors/ProviderError';
import { AILogger } from '../utils/Logger';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private providers: Map<string, BaseProvider> = new Map();
  private logger = AILogger.getInstance();

  private constructor() {
    this.registerDefaultProviders();
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  /** Dev/HMR: drop stale singleton so OmniRouteProvider production code is re-bound. */
  public static resetInstance(): void {
    ProviderRegistry.instance = undefined as unknown as ProviderRegistry;
  }

  private registerDefaultProviders(): void {
    const mock = new MockProvider();
    const omni = new OmniRouteProvider();

    this.registerProvider(mock);
    this.registerProvider(omni);
  }

  /** Always prefer a fresh OmniRoute provider binding after hot reload. */
  public ensureOmniRouteProduction(): void {
    this.registerProvider(new OmniRouteProvider());
  }

  public registerProvider(provider: BaseProvider): void {
    this.providers.set(provider.id, provider);
    this.logger.info(`Registered AI provider: ${provider.name} (${provider.id})`, 'ProviderRegistry');
  }

  public getProvider(id: string): BaseProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new ProviderError(`Provider with ID '${id}' is not registered in AI OS.`, id, 'PROVIDER_NOT_FOUND');
    }
    return provider;
  }

  public getAllProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  public hasProvider(id: string): boolean {
    return this.providers.has(id);
  }
}
