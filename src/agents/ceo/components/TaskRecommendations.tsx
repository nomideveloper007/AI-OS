import React from 'react';
import { CEOTaskRecommendation } from '../CEOContext';
import { CheckSquare, ShieldCheck, ArrowUpRight, Bot } from 'lucide-react';

interface TaskRecommendationsProps {
  tasks: CEOTaskRecommendation[];
}

export const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({ tasks }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">CEO Task Recommendations</h3>
        <span className="text-xs font-bold text-slate-400">{tasks.length} Recommended Tasks</span>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">{task.title}</span>
                <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                  {task.status}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-700">
                  {task.category}
                </span>
                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700">
                  {task.priority} Priority
                </span>
              </div>
            </div>

            <p className="text-slate-600 font-medium">{task.description}</p>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1 text-slate-700">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                Suggested: {task.suggestedAgent}
              </span>
              <span>Impact: <strong className="text-slate-900">{task.estimatedImpact}</strong></span>
              <span>Difficulty: <strong className="text-slate-900">{task.estimatedDifficulty}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
