import React, { useState } from 'react';
import { useAgent } from '../../agents/hooks/useAgent';
import { BaseAgent } from '../../agents/core/BaseAgent';
import { AgentCard } from '../../agents/components/AgentCard';
import { AgentDetailsView } from '../../agents/components/AgentDetailsView';
import { AgentRole } from '../../agents/types/AgentRole';
import { AgentStatus } from '../../agents/types/AgentStatus';
import { AgentPriority } from '../../agents/types/AgentPriority';
import { 
  Bot, 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  X,
  Layers
} from 'lucide-react';

export const AgentsView: React.FC = () => {
  const { agents, manager, refreshAgents } = useAgent();
  const [selectedAgent, setSelectedAgent] = useState<BaseAgent | null>(null);
  const [selectedTabForDetails, setSelectedTabForDetails] = useState<string>('overview');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Add Agent Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [newAgentRole, setNewAgentRole] = useState<AgentRole>('SEO Specialist');
  const [newAgentPriority, setNewAgentPriority] = useState<AgentPriority>('Medium');

  const filteredAgents = agents.filter((ag) => {
    if (searchQuery && !ag.name.toLowerCase().includes(searchQuery.toLowerCase()) && !ag.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && ag.status !== statusFilter) return false;
    if (roleFilter !== 'all' && ag.role !== roleFilter) return false;
    if (priorityFilter !== 'all' && ag.priority !== priorityFilter) return false;
    return true;
  });

  const totalCount = agents.length;
  const runningCount = agents.filter((a) => a.status === 'Running').length;
  const idleCount = agents.filter((a) => a.status === 'Idle').length;
  const pausedCount = agents.filter((a) => a.status === 'Paused').length;

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    manager.createAgent({
      name: newAgentName,
      description: newAgentDescription || 'Custom AI Agent blueprint created in AI OS.',
      role: newAgentRole,
      priority: newAgentPriority,
      capabilities: ['Analyze Data', 'Read Reports', 'Website Scan']
    });

    refreshAgents();
    setIsAddModalOpen(false);
    setNewAgentName('');
    setNewAgentDescription('');
  };

  if (selectedAgent) {
    return (
      <AgentDetailsView
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
        initialTab={selectedTabForDetails}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Bot className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">AI Agent Workforce Management</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Deploy, monitor, and configure autonomous AI employees built on the AI OS BaseAgent Framework.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add AI Agent
        </button>
      </div>

      {/* Fleet Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Total Fleet Size</p>
          <p className="text-2xl font-extrabold text-slate-900">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
          <p className="text-xs font-bold text-emerald-700">Active / Running</p>
          <p className="text-2xl font-extrabold text-emerald-800">{runningCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
          <p className="text-xs font-bold text-slate-500">Idle / Ready</p>
          <p className="text-2xl font-extrabold text-slate-800">{idleCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
          <p className="text-xs font-bold text-amber-700">Paused</p>
          <p className="text-2xl font-extrabold text-amber-800">{pausedCount}</p>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Idle">Idle</option>
            <option value="Running">Running</option>
            <option value="Paused">Paused</option>
            <option value="Stopped">Stopped</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Roles</option>
            <option value="Executive Director">Executive Director</option>
            <option value="SEO Specialist">SEO Specialist</option>
            <option value="Website Auditor">Website Auditor</option>
            <option value="Growth Marketing">Growth Marketing</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Agents Cards Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {filteredAgents.map((ag) => (
            <AgentCard
              key={ag.id}
              agent={ag}
              onSelect={(agent) => {
                setSelectedAgent(agent);
                setSelectedTabForDetails('overview');
              }}
              onViewLogs={(agent) => {
                setSelectedAgent(agent);
                setSelectedTabForDetails('logs');
              }}
              onViewMetrics={(agent) => {
                setSelectedAgent(agent);
                setSelectedTabForDetails('performance');
              }}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
          <Bot className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-extrabold text-slate-800">No agents match your filter criteria.</p>
          <p className="text-xs font-semibold text-slate-400">Try clearing filters or search query.</p>
        </div>
      )}

      {/* Add Agent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Instantiate New AI Agent</h3>
                  <p className="text-xs text-slate-500 font-medium">Configure framework agent blueprint</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Agent Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Security Sentinel Agent"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role / Specialization</label>
                <select
                  value={newAgentRole}
                  onChange={(e) => setNewAgentRole(e.target.value as AgentRole)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="SEO Specialist">SEO Specialist</option>
                  <option value="Website Auditor">Website Auditor</option>
                  <option value="Executive Director">Executive Director</option>
                  <option value="Growth Marketing">Growth Marketing</option>
                  <option value="Security Sentinel">Security Sentinel</option>
                  <option value="Custom Workforce">Custom Workforce</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={newAgentPriority}
                  onChange={(e) => setNewAgentPriority(e.target.value as AgentPriority)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description Directive</label>
                <textarea
                  rows={3}
                  placeholder="Operational responsibilities and guidelines for this agent..."
                  value={newAgentDescription}
                  onChange={(e) => setNewAgentDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Create Agent Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
