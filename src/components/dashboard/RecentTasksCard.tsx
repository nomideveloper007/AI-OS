import React from 'react';
import { useApp } from '../../context/AppContext';
import { TaskStatus } from '../../types';
import { Search, FileText, ShieldCheck, Target, Clock } from 'lucide-react';

export const RecentTasksCard: React.FC = () => {
  const { tasks, setActiveTab } = useApp();

  const getTaskIcon = (title: string) => {
    if (title.toLowerCase().includes('seo') || title.toLowerCase().includes('optimize')) {
      return <Search className="w-4 h-4 text-blue-500" />;
    }
    if (title.toLowerCase().includes('write') || title.toLowerCase().includes('blog')) {
      return <FileText className="w-4 h-4 text-indigo-500" />;
    }
    if (title.toLowerCase().includes('scan') || title.toLowerCase().includes('security')) {
      return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
    }
    if (title.toLowerCase().includes('earning') || title.toLowerCase().includes('tasks')) {
      return <Target className="w-4 h-4 text-sky-500" />;
    }
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Running':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-emerald-200/60">
            Running
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-amber-200/60">
            Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#059669] border border-emerald-200/60">
            Completed
          </span>
        );
      case 'Failed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-rose-200/60">
            Failed
          </span>
        );
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base">
          Recent Tasks
        </h3>
        <button 
          onClick={() => setActiveTab('tasks')}
          className="text-xs font-bold text-[#4F46E5] hover:underline px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.slice(0, 5).map((task) => (
          <div 
            key={task.id} 
            className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
            onClick={() => setActiveTab('tasks')}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition-colors">
                {getTaskIcon(task.title)}
              </div>
              <p className="text-xs font-bold text-slate-800 truncate">
                {task.title}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {getStatusBadge(task.status)}
              <span className="text-[11px] font-medium text-slate-400 w-16 text-right">
                {task.timeAgo}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

