import React from 'react';
import { BaseAgent } from '../core/BaseAgent';
import { Calendar, Clock, Activity, CheckCircle2 } from 'lucide-react';

interface AgentTimelineProps {
  agent: BaseAgent;
}

export const AgentTimeline: React.FC<AgentTimelineProps> = ({ agent }) => {
  const events = agent.getTimeline();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Agent State Event Timeline</h3>
        <span className="text-xs font-bold text-slate-400">{events.length} Events</span>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold text-center py-4">No events logged yet.</p>
        ) : (
          events.map((evt) => (
            <div key={evt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{evt.event}</span>
                  <span className="text-[10px] font-bold text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-slate-600 font-medium mt-0.5">{evt.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
