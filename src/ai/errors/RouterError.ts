import { AIError } from './AIError';

export class RouterError extends AIError {
  constructor(message: string, code: string = 'ROUTER_ERROR', details?: Record<string, any>) {
    super(message, code, details);
    this.name = 'RouterError';
  }
}
