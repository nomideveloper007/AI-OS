import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Search, ShieldCheck, FileText, Globe, Cpu } from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { activityLogs } = useApp();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Activity Audit Trail</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time event logs, agent actions, and system execution history.
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-6">
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {activityLogs.map((log) => (
            <div key={log.id} className="relative group">
              {/* Timeline Dot */}
              <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 bg-indigo-600"></div>

              <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {log.agentName}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">{log.timeAgo}</span>
                </div>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{log.action}</p>
                {log.details && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 leading-relaxed">
                    {log.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
