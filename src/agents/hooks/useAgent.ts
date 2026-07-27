import { useState, useEffect } from 'react';
import { AgentManager } from '../core/AgentManager';
import { BaseAgent } from '../core/BaseAgent';
import { AgentEvents } from '../core/AgentEvents';

export function useAgent() {
  const [manager] = useState(() => AgentManager.getInstance());
  const [agents, setAgents] = useState<BaseAgent[]>([]);

  const refreshAgents = () => {
    setAgents([...manager.listAgents()]);
  };

  useEffect(() => {
    refreshAgents();
    const unsubscribe = AgentEvents.subscribe(() => {
      refreshAgents();
    });
    return () => unsubscribe();
  }, [manager]);

  return {
    agents,
    manager,
    refreshAgents,
    startAgent: async (id: string) => {
      await manager.startAgent(id);
      refreshAgents();
    },
    pauseAgent: async (id: string) => {
      await manager.pauseAgent(id);
      refreshAgents();
    },
    stopAgent: async (id: string) => {
      await manager.stopAgent(id);
      refreshAgents();
    }
  };
}
