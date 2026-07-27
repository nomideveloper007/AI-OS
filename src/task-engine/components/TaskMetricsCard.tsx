import React from 'react';
import type { TaskEngineMetricsSnapshot } from '../core/TaskMetrics';
import { Activity, CheckCircle2, AlertTriangle, ListOrdered, Timer, RefreshCw } from 'lucide-react';

interface Props {
  metrics: TaskEngineMetricsSnapshot;
}

export const TaskMetricsCard: React.FC<Props> = ({ metrics }) => {
  const items = [
    { label: 'Running', value: metrics.running, icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Queued', value: metrics.queueLength, icon: ListOrdered, color: 'text-amber-600 bg-amber-50' },
    { label: 'Completed', value: metrics.completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Failed', value: metrics.failed, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50' },
    { label: 'Avg Time', value: `${metrics.averageDurationMs}ms`, icon: Timer, color: 'text-slate-600 bg-slate-50' },
    { label: 'Retries', value: metrics.totalRetries, icon: RefreshCw, color: 'text-slate-600 bg-slate-50' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400">{item.label}</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">{item.value}</p>
          </div>
        );
      })}
    </div>
  );
};
