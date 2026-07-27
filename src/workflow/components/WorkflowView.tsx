import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { WorkflowObject } from '../types/Workflow';
import { WorkflowCard } from './WorkflowCard';
import { WorkflowTimeline } from './WorkflowTimeline';
import { WorkflowSteps } from './WorkflowSteps';
import { WorkflowMetricsView } from './WorkflowMetrics';
import { WorkflowBuilderModal } from './WorkflowBuilderModal';
import { WorkflowDetailsView } from './WorkflowDetailsView';
import { 
  Workflow as WorkflowIcon, 
  Plus, 
  Search, 
  Layers, 
  Clock, 
  CheckSquare, 
  ShieldCheck, 
  Activity, 
  BarChart3,
  Check,
  X,
  Play
} from 'lucide-react';

export const WorkflowView: React.FC = () => {
  const { workflows, metrics, queue, approval, deleteWorkflow } = useWorkflow();
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowObject | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflows' | 'queue' | 'approvals' | 'history' | 'timeline' | 'metrics'>('workflows');

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [triggerFilter, setTriggerFilter] = useState('all');

  const filteredWorkflows = workflows.filter((wf) => {
    if (searchQuery && !wf.name.toLowerCase().includes(searchQuery.toLowerCase()) && !wf.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (categoryFilter !== 'all' && wf.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && wf.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && wf.priority !== priorityFilter) return false;
    if (triggerFilter !== 'all' && wf.trigger !== triggerFilter) return false;
    return true;
  });

  const pendingApprovals = approval.getPendingRequests();
  const queueItems = queue.getQueue();

  if (selectedWorkflow) {
    return (
      <WorkflowDetailsView
        workflow={selectedWorkflow}
        onBack={() => setSelectedWorkflow(null)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <WorkflowIcon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Workflow Engine Mission Control</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Orchestrate, organize, track, execute, and monitor automated AI OS workflow pipelines.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Workflow Builder
        </button>
      </div>

      {/* Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-400">Total Workflows</p>
          <p className="text-xl font-extrabold text-slate-900">{metrics.totalWorkflows}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
          <p className="text-[11px] font-bold text-emerald-700">Active / Running</p>
          <p className="text-xl font-extrabold text-emerald-800">{metrics.runningWorkflows}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
          <p className="text-[11px] font-bold text-amber-700">Waiting Approval</p>
          <p className="text-xl font-extrabold text-amber-800">{pendingApprovals.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
          <p className="text-[11px] font-bold text-indigo-700">Success Rate</p>
          <p className="text-xl font-extrabold text-indigo-800">{metrics.successRate}%</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
          <p className="text-[11px] font-bold text-slate-500">Average Duration</p>
          <p className="text-xl font-extrabold text-slate-900">{metrics.averageTimeMs} ms</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center space-y-1">
          <p className="text-[11px] font-bold text-purple-700">Queue Items</p>
          <p className="text-xl font-extrabold text-purple-800">{queueItems.length}</p>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search workflows by name, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="SEO">SEO</option>
            <option value="Security">Security</option>
            <option value="Reports">Reports</option>
            <option value="Content">Content</option>
            <option value="Analytics">Analytics</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Ready">Ready</option>
            <option value="Running">Running</option>
            <option value="Waiting Approval">Waiting Approval</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>

          {/* Trigger Filter */}
          <select
            value={triggerFilter}
            onChange={(e) => setTriggerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Triggers</option>
            <option value="Manual">Manual</option>
            <option value="Website Scan Completed">Website Scan Completed</option>
            <option value="Daily Schedule">Daily Schedule</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'workflows', label: `All Workflows (${filteredWorkflows.length})`, icon: WorkflowIcon },
          { id: 'queue', label: `Priority Queue (${queueItems.length})`, icon: Clock },
          { id: 'approvals', label: `Approval Requests (${pendingApprovals.length})`, icon: ShieldCheck },
          { id: 'timeline', label: 'Timeline Log', icon: Activity },
          { id: 'metrics', label: 'Engine Analytics', icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'workflows' && (
        filteredWorkflows.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredWorkflows.map((wf) => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onSelect={(w) => setSelectedWorkflow(w)}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <WorkflowIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-slate-800">No workflows match your search query.</p>
            <p className="text-xs font-semibold text-slate-400">Try adjusting your filters or create a new workflow blueprint.</p>
          </div>
        )
      )}

      {activeTab === 'queue' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Task Queue & Scheduled Executions</h3>
            <span className="text-xs font-bold text-slate-400">{queueItems.length} Enqueued Workflows</span>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-slate-600">
                <tr>
                  <th className="p-3">Queue ID</th>
                  <th className="p-3">Workflow Name</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Enqueued Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {queueItems.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-slate-900">{q.id}</td>
                    <td className="p-3 font-extrabold text-slate-800">{q.workflowName}</td>
                    <td className="p-3 font-bold text-indigo-700">{q.priority}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 text-[11px]">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-500 font-mono">{q.enqueuedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Pending Workflow Approval Requests</h3>
            <span className="text-xs font-bold text-slate-400">{pendingApprovals.length} Requests Pending</span>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{req.workflowName}</span>
                    <span className="text-slate-400">• Step: {req.stepName}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{req.reason}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Requester: {req.requester}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => approval.approve(req.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => approval.reject(req.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {pendingApprovals.length === 0 && (
              <p className="text-slate-400 font-semibold text-center py-6">No pending approval requests.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && <WorkflowTimeline />}

      {activeTab === 'metrics' && <WorkflowMetricsView />}

      {/* Builder Modal */}
      <WorkflowBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />
    </div>
  );
};
