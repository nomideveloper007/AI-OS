import React from 'react';
import type { AgentExecution } from '../types/AgentExecution';
import { Boxes } from 'lucide-react';

interface Props {
  executions: AgentExecution[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export const AgentExecutionPanel: React.FC<Props> = ({ executions, selectedId, onSelect }) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Boxes className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Live Activity</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{executions.length}</span>
      </div>

      {executions.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-6">
          No executions yet. Seed demo or receive a task.
        </p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {executions.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelect?.(ex.id)}
              className={`w-full text-left p-2.5 rounded-xl border text-xs cursor-pointer ${
                selectedId === ex.id
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 truncate">{ex.taskTitle}</span>
                <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                  {ex.progress}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                {ex.agentName} · {ex.status}
                {ex.durationMs != null ? ` · ${ex.durationMs}ms` : ''}
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    ex.status === 'failed' || ex.status === 'timed_out'
                      ? 'bg-rose-500'
                      : ex.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-indigo-500'
                  }`}
                  style={{ width: `${ex.progress}%` }}
                />
              </div>
              {ex.tokenUsage ? (
                <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                  Tokens {ex.tokenUsage.totalTokens} · Memory{' '}
                  {ex.memoryContextLoaded ? 'yes' : 'no'} · Website{' '}
                  {ex.websiteContextLoaded ? 'yes' : 'no'}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
