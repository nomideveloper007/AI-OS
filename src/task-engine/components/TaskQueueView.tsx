import React from 'react';
import type { Task } from '../types/Task';
import { TaskLifecycle } from '../core/TaskLifecycle';
import { ListOrdered } from 'lucide-react';

interface Props {
  queue: Task[];
  onSelect?: (taskId: string) => void;
  selectedId?: string;
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

export const TaskQueueView: React.FC<Props> = ({ queue, onSelect, selectedId }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 h-full">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <ListOrdered className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Task Queue</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{queue.length}</span>
      </div>

      {queue.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-6">Queue is empty.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
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
