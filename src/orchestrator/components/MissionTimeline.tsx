import React from 'react';
import type { Mission } from '../types/Mission';
import { GitCommitHorizontal } from 'lucide-react';

interface MissionTimelineProps {
  mission: Mission;
}

const statusClass = (status: string) => {
  if (status === 'completed') return 'bg-emerald-50 border-emerald-100 text-emerald-900';
  if (status === 'running') return 'bg-indigo-50 border-indigo-100 text-indigo-900';
  if (status === 'failed') return 'bg-rose-50 border-rose-100 text-rose-900';
  return 'bg-slate-50 border-slate-100 text-slate-700';
};

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ mission }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
        <GitCommitHorizontal className="w-4 h-4 text-[#4F46E5]" />
        Mission Timeline / Pipeline
      </h3>
      <ol className="relative border-l border-slate-200 ml-2 space-y-3">
        {mission.stages.map((s) => (
          <li key={s.stage} className="ml-4">
            <span
              className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white ${
                s.status === 'completed'
                  ? 'bg-emerald-500'
                  : s.status === 'running'
                    ? 'bg-[#4F46E5]'
                    : s.status === 'failed'
                      ? 'bg-rose-500'
                      : 'bg-slate-300'
              }`}
            />
            <div className={`p-3 rounded-xl border ${statusClass(s.status)}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-extrabold">{s.label}</p>
                <span className="text-[10px] font-extrabold uppercase">
                  {s.status}
                  {s.attempt > 0 ? ` · try ${s.attempt}` : ''}
                </span>
              </div>
              {s.summary && <p className="font-medium mt-1 opacity-90">{s.summary}</p>}
              {s.errorMessage && (
                <p className="font-semibold mt-1 text-rose-700">{s.errorMessage}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
