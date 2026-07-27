export class AIError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, any>;
  public readonly timestamp: string;

  constructor(message: string, code: string = 'AI_ENGINE_ERROR', details?: Record<string, any>) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
