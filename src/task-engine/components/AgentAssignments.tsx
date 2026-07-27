import React from 'react';
import type { TaskEngineMetricsSnapshot } from '../core/TaskMetrics';
import { Users } from 'lucide-react';

interface Props {
  metrics: TaskEngineMetricsSnapshot;
  agents: Array<{ id: string; name: string; role: string; capabilities: string[] }>;
}

export const AgentAssignments: React.FC<Props> = ({ metrics, agents }) => {
  const utilById = new Map(metrics.agentUtilization.map((u) => [u.agentId, u]));

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 h-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Users className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Agent Assignments</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{agents.length} registry</span>
      </div>

      {agents.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-6">No agents in registry.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {agents.map((agent) => {
            const util = utilById.get(agent.id) as
              | { running: number; completed: number; failed: number }
              | undefined;
            return (
              <div key={agent.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <p className="font-extrabold text-slate-900">{agent.name}</p>
                <p className="text-[10px] text-slate-500 font-medium">{agent.role}</p>
                <div className="flex gap-3 mt-2 text-[10px] font-bold text-slate-600">
                  <span>Run {util?.running ?? 0}</span>
                  <span className="text-emerald-600">Done {util?.completed ?? 0}</span>
                  <span className="text-rose-600">Fail {util?.failed ?? 0}</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  {agent.capabilities.join(' · ')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
