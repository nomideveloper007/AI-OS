import { IAgentResult } from '../interfaces/IAgentResult';

export class AgentHistory {
  private history: IAgentResult[] = [];

  public recordResult(result: IAgentResult): void {
    this.history.unshift(result);
  }

  public getHistoryForAgent(agentId: string): IAgentResult[] {
    return this.history.filter((r) => r.agentId === agentId);
  }
}
