import React from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Search, ShieldCheck, FileText, Globe, Cpu } from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { activityLogs } = useApp();

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Activity Audit Trail</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time event logs, agent actions, and system execution history.
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
        {activityLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-bold bg-slate-50/50 rounded-xl border border-slate-100 space-y-2">
            <Activity className="w-8 h-8 text-[#4F46E5] mx-auto" />
            <p className="text-xs text-slate-800 font-extrabold">No Activity Logged Yet</p>
            <p className="text-[11px] text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
              Your AI agent fleet actions, audit trails, and task execution events will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {activityLogs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#4F46E5]"></div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      {log.agentName}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-400">{log.timeAgo}</span>
                  </div>
                  <p className="text-xs font-extrabold text-[#4F46E5]">{log.action}</p>
                  {log.details && (
                    <p className="text-xs text-slate-600 font-medium pt-1 leading-relaxed">
                      {log.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
