import React from 'react';
import type { AgentHealthSnapshot } from '../types/AgentHealthStatus';
import type { RuntimeAgent } from '../types/Agent';
import { HeartPulse } from 'lucide-react';

interface Props {
  items: Array<{ agent: RuntimeAgent; health: AgentHealthSnapshot }>;
}

const healthColor: Record<string, string> = {
  healthy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  degraded: 'text-amber-700 bg-amber-50 border-amber-200',
  unhealthy: 'text-rose-700 bg-rose-50 border-rose-200',
  unknown: 'text-slate-600 bg-slate-50 border-slate-200',
};

export const AgentHealthCard: React.FC<Props> = ({ items }) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <HeartPulse className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Health</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{items.length} agents</span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">No agents yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {items.map(({ agent, health }) => (
            <div
              key={agent.id}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold text-slate-900 truncate">{agent.name}</p>
                <span
                  className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold capitalize ${
                    healthColor[health.status]
                  }`}
                >
                  {health.status} · {health.score}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">{health.message}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Missed HB {health.missedHeartbeats} · Crashes {health.crashCount} · CPU {agent.cpuUsage}% ·
                Mem {agent.memoryUsage}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
