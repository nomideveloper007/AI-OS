import { ProviderRegistry } from '../providers/ProviderRegistry';
import { ModelRegistry } from '../models/ModelRegistry';
import { ModelRouter } from '../router/ModelRouter';
import { PromptManager } from '../prompts/PromptManager';
import { ConversationManager } from '../conversation/ConversationManager';
import { MemoryManager } from '../memory/MemoryManager';
import { ToolRegistry } from '../tools/ToolRegistry';
import { AILogger } from '../utils/Logger';

export class AIManager {
  private static instance: AIManager;

  public readonly providers = ProviderRegistry.getInstance();
  public readonly models = ModelRegistry.getInstance();
  public readonly router = ModelRouter.getInstance();
  public readonly prompts = PromptManager.getInstance();
  public readonly conversations = ConversationManager.getInstance();
  public readonly memory = MemoryManager.getInstance();
  public readonly tools = ToolRegistry.getInstance();
  public readonly logger = AILogger.getInstance();

  private constructor() {
    this.logger.info('AIManager subsystem core components initialized.', 'AIManager');
  }

  public static getInstance(): AIManager {
    if (!AIManager.instance) {
      AIManager.instance = new AIManager();
    }
    return AIManager.instance;
  }
}
