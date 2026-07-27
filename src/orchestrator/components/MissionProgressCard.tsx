import React from 'react';
import type { Mission } from '../types/Mission';
import { Activity, Clock, AlertTriangle, CheckCircle2, Bot } from 'lucide-react';

interface MissionProgressCardProps {
  mission: Mission;
}

function formatMs(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

export const MissionProgressCard: React.FC<MissionProgressCardProps> = ({ mission }) => {
  const p = mission.progress;
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-xs">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">{mission.title}</h3>
          <p className="text-slate-500 font-medium mt-0.5">{mission.goal}</p>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border border-indigo-100 bg-indigo-50 text-indigo-700">
          {mission.status}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#4F46E5]" />
            {p.currentStageLabel}
          </span>
          <span className="font-extrabold text-[#4F46E5]">{p.overallPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#4F46E5] transition-all"
            style={{ width: `${p.overallPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
            <Clock className="w-3 h-3" /> Elapsed
          </p>
          <p className="font-extrabold text-slate-800 mt-0.5">{formatMs(p.elapsedMs)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase">ETA</p>
          <p className="font-extrabold text-slate-800 mt-0.5">{formatMs(p.estimatedRemainingMs)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-[10px] font-extrabold text-emerald-600 uppercase flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Tasks OK
          </p>
          <p className="font-extrabold text-emerald-800 mt-0.5">{p.completedTasks}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-[10px] font-extrabold text-rose-600 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Failures
          </p>
          <p className="font-extrabold text-rose-800 mt-0.5">
            {p.failures} / tasks {p.failedTasks}
          </p>
        </div>
      </div>

      {p.runningAgents.length > 0 && (
        <div>
          <p className="font-extrabold text-slate-700 flex items-center gap-1.5 mb-1">
            <Bot className="w-3.5 h-3.5" /> Running Agents
          </p>
          <div className="flex flex-wrap gap-1.5">
            {p.runningAgents.map((a) => (
              <span
                key={a}
                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {mission.lastError && (
        <p className="text-rose-700 font-semibold bg-rose-50 border border-rose-100 rounded-xl p-2.5">
          {mission.lastError}
        </p>
      )}
    </div>
  );
};
