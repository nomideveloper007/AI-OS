import { ToolRegistry } from './ToolRegistry';
import { AIToolExecutionResult } from './ToolTypes';
import { AILogger } from '../utils/Logger';

export class ToolExecutor {
  private static instance: ToolExecutor;
  private logger = AILogger.getInstance();

  private constructor() {}

  public static getInstance(): ToolExecutor {
    if (!ToolExecutor.instance) {
      ToolExecutor.instance = new ToolExecutor();
    }
    return ToolExecutor.instance;
  }

  public async executeTool(toolId: string, params: Record<string, any>): Promise<AIToolExecutionResult> {
    const startTime = Date.now();
    const tool = ToolRegistry.getInstance().getTool(toolId);

    if (!tool) {
      this.logger.error(`Tool execution failed: '${toolId}' not found.`, 'ToolExecutor');
      return {
        toolId,
        success: false,
        error: `Tool '${toolId}' is not registered.`,
        executionTimeMs: Date.now() - startTime
      };
    }

    this.logger.info(`Executing tool '${tool.name}' with params: ${JSON.stringify(params)}`, 'ToolExecutor');

    // Architecture execution interface (mock response for tool call)
    const duration = Date.now() - startTime;
    return {
      toolId,
      success: true,
      result: {
        message: `Tool '${tool.name}' executed successfully in architecture sandbox mode.`,
        params,
        timestamp: new Date().toISOString()
      },
      executionTimeMs: duration
    };
  }
}
