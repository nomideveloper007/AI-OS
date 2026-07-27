import React, { useState } from 'react';
import { WorkflowObject } from '../types/Workflow';
import { WorkflowSteps } from './WorkflowSteps';
import { WorkflowLogs } from './WorkflowLogs';
import { useWorkflow } from '../hooks/useWorkflow';
import { 
  ArrowLeft, 
  Workflow as WorkflowIcon, 
  Play, 
  Pause, 
  Layers, 
  Activity, 
  FileText, 
  BarChart2, 
  CheckSquare, 
  Clock, 
  Zap,
  Globe,
  ShieldCheck
} from 'lucide-react';

interface WorkflowDetailsViewProps {
  workflow: WorkflowObject;
  onBack: () => void;
}

export const WorkflowDetailsView: React.FC<WorkflowDetailsViewProps> = ({ workflow, onBack }) => {
  const { updateStatus } = useWorkflow();
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'conditions' | 'actions' | 'history' | 'metrics' | 'logs' | 'executions'>('overview');

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Back to Workflows
        </button>

        <div className="flex items-center gap-2">
          {workflow.status === 'Running' ? (
            <button
              onClick={() => updateStatus(workflow.id, 'Paused')}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause Workflow
            </button>
          ) : (
            <button
              onClick={() => updateStatus(workflow.id, 'Running')}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#059669] font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              Run Workflow
            </button>
          )}
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <WorkflowIcon className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">{workflow.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {workflow.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {workflow.priority} Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Category: <span className="text-slate-800">{workflow.category}</span> • Created {formatDate(workflow.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center min-w-24">
            <p className="text-[10px] font-bold text-slate-400">Total Runs</p>
            <p className="font-extrabold text-slate-900 text-base mt-0.5">{workflow.executionCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center min-w-24">
            <p className="text-[10px] font-bold text-emerald-600">Successes</p>
            <p className="font-extrabold text-emerald-700 text-base mt-0.5">{workflow.successCount}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: WorkflowIcon },
          { id: 'steps', label: `Steps (${workflow.steps.length})`, icon: Layers },
          { id: 'conditions', label: 'Conditions', icon: ShieldCheck },
          { id: 'actions', label: 'Actions', icon: Zap },
          { id: 'history', label: 'History', icon: Activity },
          { id: 'metrics', label: 'Metrics', icon: BarChart2 },
          { id: 'logs', label: 'Logs', icon: FileText },
          { id: 'executions', label: 'Future Executions', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Workflow Specifications</h3>
              <p className="text-slate-400 font-medium">Core configuration parameters</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <p className="font-bold text-slate-400">Workflow ID</p>
                <p className="font-mono font-extrabold text-slate-900 mt-1">{workflow.id}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Trigger Event</p>
                <p className="font-extrabold text-[#4F46E5] mt-1">{workflow.trigger}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Assigned Agent</p>
                <p className="font-extrabold text-slate-900 mt-1">{workflow.assignedAgent || 'System Orchestrator'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Website</p>
                <p className="font-extrabold text-slate-900 mt-1">{workflow.website || 'Global'}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Average Duration</p>
                <p className="font-extrabold text-slate-900 mt-1">{workflow.averageDuration} ms</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Last Updated</p>
                <p className="font-extrabold text-slate-900 mt-1">{formatDate(workflow.updatedAt)}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="font-bold text-slate-400 mb-1">Description</p>
              <p className="text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                {workflow.description}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'steps' && <WorkflowSteps steps={workflow.steps} />}

        {activeTab === 'conditions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Evaluated Conditions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workflow.conditions.map((cond, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {cond}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Registered Action Executions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {workflow.actions.map((act, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  {act}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6 text-center text-slate-400 font-semibold">
            Execution history records saved in workspace database.
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-400">Total Runs</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{workflow.executionCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="font-bold text-emerald-600">Successes</p>
              <p className="text-xl font-extrabold text-emerald-700 mt-1">{workflow.successCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
              <p className="font-bold text-rose-600">Failures</p>
              <p className="text-xl font-extrabold text-rose-700 mt-1">{workflow.failureCount}</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="font-bold text-indigo-600">Avg Time</p>
              <p className="text-xl font-extrabold text-indigo-700 mt-1">{workflow.averageDuration}ms</p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && <WorkflowLogs workflowId={workflow.id} />}

        {activeTab === 'executions' && (
          <div className="p-6 text-center font-bold text-slate-500">
            Future workflow scheduling and cron execution triggers ready.
          </div>
        )}
      </div>
    </div>
  );
};
