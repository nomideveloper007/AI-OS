import { AIToolDefinition } from './ToolTypes';
import { AILogger } from '../utils/Logger';

export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<string, AIToolDefinition> = new Map();
  private logger = AILogger.getInstance();

  private constructor() {
    this.registerBuiltInTools();
  }

  public static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private registerBuiltInTools(): void {
    const defaultTools: AIToolDefinition[] = [
      {
        id: 'website_scanner',
        name: 'Website Scanner Tool',
        description: 'Retrieves technical scan results and pages inventory from database.',
        category: 'scanner',
        version: '1.0.0',
        parameters: [
          { name: 'website_id', type: 'string', description: 'Connected website ID', required: true }
        ]
      },
      {
        id: 'file_reader',
        name: 'File System Reader',
        description: 'Reads local configuration and project files.',
        category: 'file',
        version: '1.0.0',
        parameters: [
          { name: 'filepath', type: 'string', description: 'Relative path to file', required: true }
        ]
      },
      {
        id: 'database_query',
        name: 'Database Query Engine',
        description: 'Queries internal AI OS databases and tables.',
        category: 'database',
        version: '1.0.0',
        parameters: [
          { name: 'table', type: 'string', description: 'Target table name', required: true }
        ]
      },
      {
        id: 'web_search',
        name: 'Search Engine Utility',
        description: 'Performs external search queries.',
        category: 'search',
        version: '1.0.0',
        parameters: [
          { name: 'query', type: 'string', description: 'Search term query', required: true }
        ]
      }
    ];

    defaultTools.forEach((t) => this.registerTool(t));
  }

  public registerTool(tool: AIToolDefinition): void {
    this.tools.set(tool.id, tool);
    this.logger.info(`Registered AI tool: ${tool.name} (${tool.id})`, 'ToolRegistry');
  }

  public getTool(id: string): AIToolDefinition | undefined {
    return this.tools.get(id);
  }

  public getAllTools(): AIToolDefinition[] {
    return Array.from(this.tools.values());
  }
}
