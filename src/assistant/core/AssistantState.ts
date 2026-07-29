import { AssistantVoiceState } from '../types';
import { AssistantEvents } from './AssistantEvents';
import { AssistantLogger } from './AssistantLogger';

export class AssistantState {
  private static instance: AssistantState;
  private currentState: AssistantVoiceState = 'idle';
  private logger = AssistantLogger.getInstance();
  private events = AssistantEvents.getInstance();

  private constructor() {}

  public static getInstance(): AssistantState {
    if (!AssistantState.instance) {
      AssistantState.instance = new AssistantState();
    }
    return AssistantState.instance;
  }

  public getState(): AssistantVoiceState {
    return this.currentState;
  }

  public setState(state: AssistantVoiceState): void {
    if (this.currentState !== state) {
      this.logger.info(`State transition: ${this.currentState} -> ${state}`, 'AssistantState');
      const oldState = this.currentState;
      this.currentState = state;
      this.events.emit('state_changed', { oldState, newState: state });
    }
  }
}
