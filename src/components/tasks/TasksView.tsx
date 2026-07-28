import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskStatus } from '../../types';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Filter
} from 'lucide-react';

export const TasksView: React.FC = () => {
  const { tasks, setIsCreateTaskOpen, showToast } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const runningCount = tasks.filter((t) => t.status === 'Running').length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const failedCount = tasks.filter((t) => t.status === 'Failed').length;

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         t.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Running
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            Completed
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Task Management Queue</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitor real-time task progress, background agent jobs, and execution history.
          </p>
        </div>

        <button
          onClick={() => setIsCreateTaskOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create New Task
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => setStatusFilter('Running')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'Running' ? 'border-[#4F46E5] shadow-xs' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Running</span>
            <Play className="w-4 h-4 text-emerald-500 fill-current" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{runningCount}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'Pending' ? 'border-amber-500 shadow-xs' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{pendingCount}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('Completed')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'Completed' ? 'border-emerald-500 shadow-xs' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedCount}</p>
        </div>

        <div 
          onClick={() => setStatusFilter('Failed')}
          className={`p-4 rounded-2xl bg-white border cursor-pointer transition-all ${
            statusFilter === 'Failed' ? 'border-rose-500 shadow-xs' : 'border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Failed</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{failedCount}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['All', 'Running', 'Pending', 'Completed', 'Failed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white text-[#4F46E5] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Task Title</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4 text-right">Time Ago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold text-xs">
                    No matching tasks found.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {task.title}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#4F46E5]">
                      {task.agentName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                        {task.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="py-3.5 px-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200/60">
                          <div 
                            className="bg-[#4F46E5] h-full rounded-full transition-all" 
                            style={{ width: `${task.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-500">{task.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-medium font-mono">
                      {task.timeAgo}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
