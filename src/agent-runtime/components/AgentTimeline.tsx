import React from 'react';
import type { AgentRuntimeEvent } from '../core/AgentEvents';
import { Clock } from 'lucide-react';

interface Props {
  events: AgentRuntimeEvent[];
}

export const AgentTimeline: React.FC<Props> = ({ events }) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Clock className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Timeline</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{events.length}</span>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-6">No timeline events yet.</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {events.slice(0, 40).map((ev) => (
            <div
              key={ev.id}
              className="flex gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/60"
            >
              <div className="w-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-extrabold text-slate-800 truncate">{ev.type}</p>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5">{ev.message}</p>
                {ev.agentName ? (
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {ev.agentName}
                    {ev.progress != null ? ` · ${ev.progress}%` : ''}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
