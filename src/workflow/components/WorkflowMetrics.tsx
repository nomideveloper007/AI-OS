import React from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { BarChart3, Clock, Zap, CheckCircle2 } from 'lucide-react';

export const WorkflowMetricsView: React.FC = () => {
  const { metrics } = useWorkflow();

  return (
    <div className="space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-extrabold text-slate-900">Workflow Metrics & Execution Analytics</h3>
        <p className="text-slate-400 font-medium">Aggregated execution stats across all workflows</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <p className="font-bold text-slate-400">Total Workflows</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.totalWorkflows}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <p className="font-bold text-emerald-600">Success Rate</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{metrics.successRate}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
          <p className="font-bold text-indigo-600">Average Duration</p>
          <p className="text-2xl font-extrabold text-indigo-700 mt-1">{metrics.averageTimeMs} ms</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <p className="font-bold text-slate-500">Longest Execution</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{metrics.longestWorkflowMs} ms</p>
        </div>
      </div>
    </div>
  );
};
