import React from 'react';
import type { Task } from '../types/Task';
import { TaskLifecycle } from '../core/TaskLifecycle';
import {
  Pause,
  Play,
  XCircle,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  task: Task | null;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onApprove: (id: string) => void;
}

function statusClass(status: Task['status']): string {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'failed') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status === 'running') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (status === 'waiting_approval') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-50 text-slate-600 border-slate-200';
}

export const TaskDetailsView: React.FC<Props> = ({
  task,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onApprove,
}) => {
  if (!task) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-6 text-center">
          <p className="text-xs font-semibold text-slate-500">
            Select a task from the queue or task list to view details, logs, and controls.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-slate-900">{task.title}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">{task.description || 'No description'}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border capitalize whitespace-nowrap ${statusClass(task.status)}`}>
          {TaskLifecycle.label(task.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        {[
          ['Priority', task.priority],
          ['Category', task.category],
          ['Agent', task.assignedAgentName || '—'],
          ['Website', task.websiteDomain || '—'],
          ['Requested By', task.requestedBy],
          ['Retries', `${task.retryCount}/${task.maxRetries}`],
          ['Est. Duration', `${task.estimatedDurationMs}ms`],
          ['Actual', task.actualDurationMs != null ? `${task.actualDurationMs}ms` : '—'],
        ].map(([label, value]) => (
          <div key={label} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <p className="text-[10px] font-bold text-slate-400">{label}</p>
            <p className="font-extrabold text-slate-900 mt-0.5 truncate capitalize">{value}</p>
          </div>
        ))}
      </div>

      {task.dependencies.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Dependencies</p>
          <p className="text-[11px] font-mono text-slate-600 break-all">{task.dependencies.join(', ')}</p>
        </div>
      )}

      {task.resultSummary && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 font-medium">
          {task.resultSummary}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(task.status === 'queued' || task.status === 'running') && (
          <button
            type="button"
            onClick={() => onPause(task.id)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
          >
            <Pause className="w-3.5 h-3.5" /> Pause
          </button>
        )}
        {task.status === 'paused' && (
          <button
            type="button"
            onClick={() => onResume(task.id)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" /> Resume
          </button>
        )}
        {task.status === 'failed' && (
          <button
            type="button"
            onClick={() => onRetry(task.id)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
        {task.status === 'waiting_approval' && (
          <button
            type="button"
            onClick={() => onApprove(task.id)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </button>
        )}
        {!TaskLifecycle.isTerminal(task.status) && (
          <button
            type="button"
            onClick={() => onCancel(task.id)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-50 cursor-pointer flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">Logs</p>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {task.logs.length === 0 ? (
            <p className="text-[11px] text-slate-400">No logs.</p>
          ) : (
            task.logs.slice(0, 20).map((log) => (
              <div key={log.id} className="text-[11px] text-slate-600 font-medium">
                <span className="font-bold uppercase text-slate-400 mr-2">{log.level}</span>
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
