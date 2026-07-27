import { PromptTemplate, PromptLoader } from './PromptLoader';
import { AILogger } from '../utils/Logger';

export class PromptManager {
  private static instance: PromptManager;
  private templates: Map<string, PromptTemplate> = new Map();
  private logger = AILogger.getInstance();

  private constructor() {
    this.loadBuiltInPrompts();
  }

  public static getInstance(): PromptManager {
    if (!PromptManager.instance) {
      PromptManager.instance = new PromptManager();
    }
    return PromptManager.instance;
  }

  private loadBuiltInPrompts(): void {
    const builtIn = PromptLoader.loadBuiltInTemplates();
    builtIn.forEach((tpl) => this.registerTemplate(tpl));
  }

  public registerTemplate(template: PromptTemplate): void {
    this.templates.set(template.id, template);
    this.logger.info(`Registered prompt template: ${template.name} (${template.id})`, 'PromptManager');
  }

  public getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  public compile(templateId: string, variables: Record<string, string>): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Prompt template with ID '${templateId}' not found.`);
    }

    let compiled = template.templateText;
    for (const key of template.variables) {
      const val = variables[key] ?? `{{${key}}}`;
      compiled = compiled.replaceAll(`{{${key}}}`, val);
    }

    this.logger.info(`Compiled prompt '${templateId}' with ${Object.keys(variables).length} variables`, 'PromptManager');
    return compiled.trim();
  }

  public validateVariables(templateId: string, variables: Record<string, string>): { valid: boolean; missing: string[] } {
    const template = this.getTemplate(templateId);
    if (!template) return { valid: false, missing: [] };

    const missing = template.variables.filter((v) => variables[v] === undefined || variables[v] === '');
    return {
      valid: missing.length === 0,
      missing
    };
  }
}
