import React from 'react';
import type { Task } from '../types/Task';
import { TaskLifecycle } from '../core/TaskLifecycle';
import { ListOrdered, Sparkles } from 'lucide-react';

interface Props {
  queue: Task[];
  onSelect?: (taskId: string) => void;
  selectedId?: string;
  onSeed?: () => void;
  busy?: boolean;
}

function priorityClass(priority: Task['priority']): string {
  switch (priority) {
    case 'critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'support':
      return 'bg-slate-50 text-slate-600 border-slate-200';
    default:
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
}

export const TaskQueueView: React.FC<Props> = ({
  queue,
  onSelect,
  selectedId,
  onSeed,
  busy,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <ListOrdered className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Task Queue</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{queue.length} ready</span>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-5 text-center space-y-3">
          <p className="text-xs font-semibold text-slate-500">
            Queue is empty. Create a task or seed the demo pipeline.
          </p>
          {onSeed && (
            <button
              type="button"
              onClick={onSeed}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46E5] text-white text-[11px] font-bold hover:bg-[#4338CA] cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Seed Demo Pipeline
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {queue.map((task, idx) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelect?.(task.id)}
              className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                selectedId === task.id
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200/70 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 text-[10px] font-bold mb-1">
                <span className="text-slate-400">#{idx + 1}</span>
                <span className={`px-1.5 py-0.5 rounded-full border uppercase ${priorityClass(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-slate-400 uppercase">{task.category}</span>
              </div>
              <p className="text-xs font-extrabold text-slate-900 truncate">{task.title}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {task.assignedAgentName || 'Unassigned'} · {TaskLifecycle.label(task.status)}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
