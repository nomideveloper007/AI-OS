import { BaseAgent } from './BaseAgent';
import { AgentEvents } from './AgentEvents';

export class AgentLifecycle {
  public static async transitionToStart(agent: BaseAgent): Promise<void> {
    await agent.start();
    AgentEvents.emit('agent_started', agent.id);
  }

  public static async transitionToPause(agent: BaseAgent): Promise<void> {
    await agent.pause();
    AgentEvents.emit('agent_paused', agent.id);
  }

  public static async transitionToStop(agent: BaseAgent): Promise<void> {
    await agent.stop();
    AgentEvents.emit('agent_stopped', agent.id);
  }
}
