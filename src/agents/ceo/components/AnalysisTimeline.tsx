import React from 'react';
import { Activity } from 'lucide-react';

interface AnalysisTimelineProps {
  logs: any[];
}

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({ logs }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Analysis Event Timeline</h3>
        <span className="text-xs font-bold text-slate-400">{logs.length} Milestones</span>
      </div>

      <div className="space-y-2.5">
        {logs.map((log, i) => (
          <div key={log.id || i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 mt-0.5">
              <Activity className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">{log.message}</span>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
