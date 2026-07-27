import { ModelRegistry } from '../models/ModelRegistry';
import { ProviderRegistry } from '../providers/ProviderRegistry';
import { BaseProvider } from '../providers/BaseProvider';
import { AIModel } from '../models/ModelCapabilities';
import { RoutingStrategy, CapabilityMatchStrategy } from './RoutingStrategy';
import { RouterError } from '../errors/RouterError';
import { AILogger } from '../utils/Logger';

export interface RouteResolution {
  model: AIModel;
  provider: BaseProvider;
  reason: string;
}

export class ModelRouter {
  private static instance: ModelRouter;
  private strategy: RoutingStrategy;
  private logger = AILogger.getInstance();

  private constructor() {
    this.strategy = new CapabilityMatchStrategy();
  }

  public static getInstance(): ModelRouter {
    if (!ModelRouter.instance) {
      ModelRouter.instance = new ModelRouter();
    }
    return ModelRouter.instance;
  }

  public setStrategy(strategy: RoutingStrategy): void {
    this.strategy = strategy;
    this.logger.info(`Updated ModelRouter strategy to: ${strategy.name}`, 'ModelRouter');
  }

  public routeTask(taskType: string, explicitModelId?: string): RouteResolution {
    const modelRegistry = ModelRegistry.getInstance();
    const providerRegistry = ProviderRegistry.getInstance();

    if (explicitModelId) {
      const explicitModel = modelRegistry.getModel(explicitModelId);
      if (explicitModel) {
        const provider = providerRegistry.getProvider(explicitModel.provider);
        return {
          model: explicitModel,
          provider,
          reason: `Explicitly requested model '${explicitModelId}'.`
        };
      }
    }

    const availableModels = modelRegistry.getAllModels().filter((m) => m.status === 'active');
    if (availableModels.length === 0) {
      throw new RouterError('No active models available for routing.');
    }

    const selectedModel = this.strategy.selectModel(availableModels, taskType);
    const provider = providerRegistry.getProvider(selectedModel.provider);

    this.logger.info(`Routed task '${taskType}' to model '${selectedModel.id}' on provider '${provider.id}'`, 'ModelRouter');

    return {
      model: selectedModel,
      provider,
      reason: `Routed using ${this.strategy.name} strategy for task type '${taskType}'.`
    };
  }
}
