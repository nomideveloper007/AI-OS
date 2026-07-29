export class AssistantLogger {
  private static instance: AssistantLogger;

  private constructor() {}

  public static getInstance(): AssistantLogger {
    if (!AssistantLogger.instance) {
      AssistantLogger.instance = new AssistantLogger();
    }
    return AssistantLogger.instance;
  }

  public info(message: string, context?: string): void {
    console.log(`[SAIRA][INFO]${context ? `[${context}]` : ''} ${message}`);
  }

  public warn(message: string, context?: string): void {
    console.warn(`[SAIRA][WARN]${context ? `[${context}]` : ''} ${message}`);
  }

  public error(message: string, error?: any, context?: string): void {
    console.error(`[SAIRA][ERROR]${context ? `[${context}]` : ''} ${message}`, error || '');
  }

  public debug(message: string, context?: string): void {
    console.debug(`[SAIRA][DEBUG]${context ? `[${context}]` : ''} ${message}`);
  }
}
