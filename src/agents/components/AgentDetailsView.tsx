import React, { useState } from 'react';
import { BaseAgent } from '../core/BaseAgent';
import { AgentStatusBadge } from './AgentStatusBadge';
import { AgentLogs } from './AgentLogs';
import { AgentTimeline } from './AgentTimeline';
import { useAgent } from '../hooks/useAgent';
import { 
  ArrowLeft, 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Activity, 
  FileText, 
  BarChart2, 
  Settings, 
  Layers, 
  CheckSquare, 
  Database, 
  MessageSquare,
  ShieldCheck,
  Calendar,
  Clock,
  Zap
} from 'lucide-react';

interface AgentDetailsViewProps {
  agent: BaseAgent;
  onBack: () => void;
  initialTab?: string;
}

export const AgentDetailsView: React.FC<AgentDetailsViewProps> = ({ agent, onBack, initialTab }) => {
  const { startAgent, pauseAgent, stopAgent } = useAgent();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'configuration' | 'logs' | 'timeline' | 'performance' | 'capabilities' | 'tasks' | 'memory' | 'conversations'
  >((initialTab as any) || 'overview');

  const metrics = agent.getMetrics();

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          Back to Agents Fleet
        </button>

        <div className="flex items-center gap-2">
          {agent.status === 'Running' ? (
            <button
              onClick={() => pauseAgent(agent.id)}
              className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Pause className="w-4 h-4 fill-current" />
              Pause Agent
            </button>
          ) : (
            <button
              onClick={() => startAgent(agent.id)}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#059669] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Play className="w-4 h-4 fill-current" />
              Start Agent
            </button>
          )}

          <button
            onClick={() => stopAgent(agent.id)}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop Agent
          </button>
        </div>
      </div>

      {/* Main Agent Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Bot className="w-8 h-8 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">{agent.name}</h1>
              <AgentStatusBadge status={agent.status} />
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                {agent.priority} Priority
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Role: <span className="text-slate-800">{agent.role}</span> • Created {formatDate(agent.createdAt)}
            </p>
          </div>
        </div>

        {/* Quick Performance Badge */}
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center min-w-28">
            <p className="text-[11px] font-bold text-slate-400">Total Executions</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{metrics.executionCount}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center min-w-28">
            <p className="text-[11px] font-bold text-emerald-600">Success Rate</p>
            <p className="text-lg font-extrabold text-emerald-700 mt-0.5">
              {metrics.executionCount > 0 ? Math.round((metrics.successCount / metrics.executionCount) * 100) : 100}%
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Bot },
          { id: 'configuration', label: 'Configuration', icon: Settings },
          { id: 'logs', label: 'Logs', icon: FileText },
          { id: 'timeline', label: 'Timeline', icon: Activity },
          { id: 'performance', label: 'Performance', icon: BarChart2 },
          { id: 'capabilities', label: 'Capabilities', icon: Layers },
          { id: 'tasks', label: 'Tasks', icon: CheckSquare },
          { id: 'memory', label: 'Future Memory', icon: Database },
          { id: 'conversations', label: 'Future Conversations', icon: MessageSquare },
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

      {/* Tab Body */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        {activeTab === 'overview' && (
          <div className="space-y-6 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Agent Overview</h3>
              <p className="text-slate-400 font-medium">Framework details and operational metadata</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <p className="font-bold text-slate-400">Agent ID</p>
                <p className="font-mono font-extrabold text-slate-900 mt-1">{agent.id}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Name</p>
                <p className="font-extrabold text-slate-900 mt-1">{agent.name}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Role</p>
                <p className="font-extrabold text-slate-900 mt-1">{agent.role}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Status</p>
                <div className="mt-1"><AgentStatusBadge status={agent.status} /></div>
              </div>
              <div>
                <p className="font-bold text-slate-400">Priority Level</p>
                <p className="font-extrabold text-slate-900 mt-1">{agent.priority}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400">Created Date</p>
                <p className="font-extrabold text-slate-900 mt-1">{formatDate(agent.createdAt)}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="font-bold text-slate-400 mb-1">Description</p>
              <p className="text-slate-700 font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                {agent.description}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'configuration' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Agent Blueprint Configuration</h3>
            <div className="p-4 bg-slate-950 text-slate-100 font-mono rounded-xl">
              <pre>{JSON.stringify(agent.report(), null, 2)}</pre>
            </div>
          </div>
        )}

        {activeTab === 'logs' && <AgentLogs agent={agent} />}

        {activeTab === 'timeline' && <AgentTimeline agent={agent} />}

        {activeTab === 'performance' && (
          <div className="space-y-5 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="font-bold text-slate-400">Total Executions</p>
                <p className="text-xl font-extrabold text-slate-900 mt-1">{metrics.executionCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                <p className="font-bold text-emerald-600">Successes</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-1">{metrics.successCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                <p className="font-bold text-rose-600">Failures</p>
                <p className="text-xl font-extrabold text-rose-700 mt-1">{metrics.failureCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="font-bold text-indigo-600">Avg Duration</p>
                <p className="text-xl font-extrabold text-indigo-700 mt-1">{metrics.averageDurationMs} ms</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'capabilities' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">Assigned Capabilities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agent.capabilities.map((cap, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  {cap}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-8 text-center text-xs space-y-2">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Agent Task Queue</p>
            <p className="text-slate-400 font-medium">Framework task executor queue ready for future task assignments.</p>
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="p-8 text-center text-xs space-y-2">
            <Database className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Agent Memory System</p>
            <p className="text-slate-400 font-medium">Short-term & long-term memory architecture placeholder ready.</p>
          </div>
        )}

        {activeTab === 'conversations' && (
          <div className="p-8 text-center text-xs space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Agent Conversation Threads</p>
            <p className="text-slate-400 font-medium">AI Engine conversation trajectory interface ready for future integration.</p>
          </div>
        )}
      </div>
    </div>
  );
};
