import React from 'react';
import type { RuntimeAgent } from '../types/Agent';
import { Activity, Cpu, Pause, Play, Power, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  agent: RuntimeAgent;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onRestart?: (id: string) => void;
  busy?: boolean;
}

const statusColor: Record<string, string> = {
  Offline: 'bg-slate-100 text-slate-600 border-slate-200',
  Starting: 'bg-sky-50 text-sky-700 border-sky-200',
  Idle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Busy: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  Paused: 'bg-orange-50 text-orange-700 border-orange-200',
  Completed: 'bg-teal-50 text-teal-700 border-teal-200',
  Error: 'bg-rose-50 text-rose-700 border-rose-200',
  Recovering: 'bg-violet-50 text-violet-700 border-violet-200',
};

export const AgentStatusCard: React.FC<Props> = ({
  agent,
  selected,
  onSelect,
  onStart,
  onStop,
  onPause,
  onResume,
  onRestart,
  busy,
}) => {
  return (
    <div
      className={`p-3 rounded-xl border text-xs transition-colors ${
        selected
          ? 'bg-indigo-50/80 border-indigo-200'
          : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100/80'
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect?.(agent.id)}
        className="w-full text-left cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 truncate">{agent.name}</p>
            <p className="text-[10px] text-slate-500 font-medium">{agent.role}</p>
          </div>
          <span
            className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold whitespace-nowrap ${
              statusColor[agent.status] || statusColor.Offline
            }`}
          >
            {agent.status}
          </span>
        </div>

        <p className="text-[10px] text-slate-500 font-medium mt-1.5 line-clamp-2">{agent.description}</p>

        <div className="flex flex-wrap gap-1 mt-2">
          {agent.capabilities.slice(0, 4).map((cap) => (
            <span
              key={cap}
              className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-semibold text-slate-600"
            >
              {cap}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-[10px] font-bold">
          <div className="px-1.5 py-1 rounded-md bg-white border border-slate-200 text-indigo-700 flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Run {agent.tasksCompleted}
          </div>
          <div className="px-1.5 py-1 rounded-md bg-white border border-slate-200 text-rose-700">
            Fail {agent.tasksFailed}
          </div>
          <div className="px-1.5 py-1 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            {agent.cpuUsage}%
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-medium mt-2 truncate">
          {agent.currentTaskTitle
            ? `Task: ${agent.currentTaskTitle}`
            : `Queue ${agent.queueLength} · Mem ${agent.memoryUsage}% · ${agent.health}`}
        </p>
      </button>

      <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-200/70">
        {agent.status === 'Offline' || agent.status === 'Error' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStart?.(agent.id)}
            className="px-2 py-1 rounded-lg bg-[#4F46E5] text-white text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" /> Start
          </button>
        ) : null}
        {agent.status === 'Paused' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onResume?.(agent.id)}
            className="px-2 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-current" /> Resume
          </button>
        ) : null}
        {agent.status === 'Idle' || agent.status === 'Busy' || agent.status === 'Waiting' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onPause?.(agent.id)}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <Pause className="w-3 h-3" /> Pause
          </button>
        ) : null}
        {agent.status !== 'Offline' ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStop?.(agent.id)}
            className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            <Power className="w-3 h-3" /> Stop
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => onRestart?.(agent.id)}
          className="px-2 py-1 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-[10px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Restart
        </button>
        {busy ? <RefreshCw className="w-3 h-3 text-slate-400 animate-spin ml-auto" /> : null}
      </div>
    </div>
  );
};
