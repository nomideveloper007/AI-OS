import React from 'react';
import { BaseAgent } from '../core/BaseAgent';
import { AgentStatusBadge } from './AgentStatusBadge';
import { useAgent } from '../hooks/useAgent';
import { 
  Bot, 
  Play, 
  Pause, 
  Square, 
  Eye, 
  FileText, 
  BarChart2, 
  Calendar,
  Zap,
  ShieldAlert
} from 'lucide-react';

interface AgentCardProps {
  agent: BaseAgent;
  onSelect: (agent: BaseAgent) => void;
  onViewLogs: (agent: BaseAgent) => void;
  onViewMetrics: (agent: BaseAgent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect, onViewLogs, onViewMetrics }) => {
  const { startAgent, pauseAgent, stopAgent } = useAgent();

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4">
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Bot className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <h3 
              onClick={() => onSelect(agent)}
              className="font-extrabold text-slate-900 text-base truncate hover:text-[#4F46E5] cursor-pointer transition-colors"
            >
              {agent.name}
            </h3>
            <p className="text-xs font-bold text-slate-400 truncate mt-0.5">
              {agent.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <AgentStatusBadge status={agent.status} />
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getPriorityStyle(agent.priority)}`}>
            {agent.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {agent.description}
      </p>

      {/* Capabilities Badges */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-slate-400">Capabilities</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {agent.capabilities.map((cap, i) => (
            <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px]">
              {cap}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(agent.createdAt)}</span>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => onSelect(agent)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            View
          </button>

          {agent.status === 'Running' ? (
            <button
              onClick={() => pauseAgent(agent.id)}
              className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Pause Agent"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              Pause
            </button>
          ) : (
            <button
              onClick={() => startAgent(agent.id)}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#059669] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              title="Start Agent"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Start
            </button>
          )}

          <button
            onClick={() => stopAgent(agent.id)}
            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
            title="Stop Agent"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>

          <button
            onClick={() => onViewLogs(agent)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="View Logs"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => onViewMetrics(agent)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="View Metrics"
          >
            <BarChart2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
