import { ModelRegistry } from './ModelRegistry';
import { AIModel } from './ModelCapabilities';

export interface ModelCriteria {
  providerId?: string;
  requireVision?: boolean;
  requireTools?: boolean;
  requireReasoning?: boolean;
  minContextWindow?: number;
}

export class ModelSelector {
  public static selectBestModel(criteria: ModelCriteria = {}): AIModel {
    const registry = ModelRegistry.getInstance();
    const models = registry.getAllModels().filter((m) => m.status === 'active');

    if (models.length === 0) {
      throw new Error('No active models available in registry.');
    }

    const filtered = models.filter((m) => {
      if (criteria.providerId && m.provider !== criteria.providerId) return false;
      if (criteria.requireVision && !m.capabilities.supportsVision) return false;
      if (criteria.requireTools && !m.capabilities.supportsTools) return false;
      if (criteria.requireReasoning && !m.capabilities.supportsReasoning) return false;
      if (criteria.minContextWindow && m.capabilities.contextWindow < criteria.minContextWindow) return false;
      return true;
    });

    return filtered[0] || models[0];
  }
}
