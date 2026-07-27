import React from 'react';
import { WorkflowObject } from '../types/Workflow';
import { useWorkflow } from '../hooks/useWorkflow';
import { 
  Workflow as WorkflowIcon, 
  Play, 
  Pause, 
  Trash2, 
  Layers, 
  Clock, 
  Globe, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  Eye
} from 'lucide-react';

interface WorkflowCardProps {
  workflow: WorkflowObject;
  onSelect: (workflow: WorkflowObject) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({ workflow, onSelect }) => {
  const { updateStatus, deleteWorkflow } = useWorkflow();

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'Running':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse';
      case 'Waiting Approval':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Ready':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const successRate = workflow.executionCount > 0 ? Math.round((workflow.successCount / workflow.executionCount) * 100) : 100;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all space-y-4 flex flex-col justify-between">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <WorkflowIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <h3 
              onClick={() => onSelect(workflow)}
              className="font-extrabold text-slate-900 text-base truncate hover:text-[#4F46E5] cursor-pointer transition-colors"
            >
              {workflow.name}
            </h3>
            <p className="text-xs font-bold text-slate-400 truncate mt-0.5">
              Category: <span className="text-slate-700">{workflow.category}</span> • Trigger: <span className="text-[#4F46E5]">{workflow.trigger}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${getStatusBadge(workflow.status)}`}>
            {workflow.status}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getPriorityStyle(workflow.priority)}`}>
            {workflow.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {workflow.description}
      </p>

      {/* Steps Summary & Website */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            {workflow.steps.length} Workflow Steps
          </span>
          {workflow.website && (
            <span className="font-semibold text-slate-400 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              {workflow.website}
            </span>
          )}
        </div>

        {/* Action Tags */}
        <div className="flex items-center gap-1 flex-wrap">
          {workflow.actions.map((act, i) => (
            <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px] rounded">
              {act}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Metrics & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400">
          <span>{workflow.executionCount} Runs</span>
          <span>{successRate}% Success</span>
          <span>{workflow.averageDuration}ms avg</span>
        </div>

        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => onSelect(workflow)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </button>

          {workflow.status === 'Running' ? (
            <button
              onClick={() => updateStatus(workflow.id, 'Paused')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </button>
          ) : (
            <button
              onClick={() => updateStatus(workflow.id, 'Running')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run
            </button>
          )}

          <button
            onClick={() => deleteWorkflow(workflow.id)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Workflow"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
