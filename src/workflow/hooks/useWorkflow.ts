import { useState, useEffect } from 'react';
import { WorkflowEngine } from '../core/WorkflowEngine';
import { WorkflowObject } from '../types/Workflow';
import { WorkflowEvents } from '../core/WorkflowEvents';
import { WorkflowMetrics } from '../core/WorkflowMetrics';

export function useWorkflow() {
  const [engine] = useState(() => WorkflowEngine.getInstance());
  const [workflows, setWorkflows] = useState<WorkflowObject[]>([]);

  const refreshState = () => {
    setWorkflows([...engine.manager.getWorkflows()]);
  };

  useEffect(() => {
    refreshState();
    const unsub = WorkflowEvents.subscribe(() => {
      refreshState();
    });
    return () => unsub();
  }, [engine]);

  const metrics = WorkflowMetrics.calculateMetrics(workflows);

  return {
    engine,
    workflows,
    metrics,
    manager: engine.manager,
    queue: engine.queue,
    approval: engine.approval,
    refreshState,
    updateStatus: (id: string, status: any) => {
      engine.manager.updateWorkflowStatus(id, status);
      refreshState();
    },
    deleteWorkflow: (id: string) => {
      const res = engine.manager.deleteWorkflow(id);
      refreshState();
      return res;
    }
  };
}
