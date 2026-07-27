import { AIModel } from '../models/ModelCapabilities';

export interface RoutingStrategy {
  readonly name: string;
  selectModel(models: AIModel[], taskType?: string): AIModel;
}

export class PerformanceStrategy implements RoutingStrategy {
  public readonly name = 'PerformanceFirst';

  public selectModel(models: AIModel[]): AIModel {
    return models.reduce((best, current) => {
      const bestScore = (best.capabilities.contextWindow || 0) + (best.capabilities.maxOutputTokens || 0);
      const currentScore = (current.capabilities.contextWindow || 0) + (current.capabilities.maxOutputTokens || 0);
      return currentScore > bestScore ? current : best;
    }, models[0]);
  }
}

export class CapabilityMatchStrategy implements RoutingStrategy {
  public readonly name = 'CapabilityMatch';

  public selectModel(models: AIModel[], taskType?: string): AIModel {
    if (taskType === 'vision_analysis') {
      const visionModel = models.find((m) => m.capabilities.supportsVision);
      if (visionModel) return visionModel;
    }
    if (taskType === 'tool_calling') {
      const toolModel = models.find((m) => m.capabilities.supportsTools);
      if (toolModel) return toolModel;
    }
    return models[0];
  }
}
