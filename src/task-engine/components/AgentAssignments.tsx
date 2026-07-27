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
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Users className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Agent Assignments</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{agents.length} in registry</span>
      </div>

      {agents.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">No agents in registry.</p>
      ) : (
        <div className="space-y-2">
          {agents.map((agent) => {
            const util = utilById.get(agent.id) as
              | { running: number; completed: number; failed: number }
              | undefined;
            return (
              <div key={agent.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold text-slate-900 truncate">{agent.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{agent.role}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0 text-[10px] font-bold">
                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {util?.running ?? 0}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      {util?.completed ?? 0}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700">
                      {util?.failed ?? 0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
