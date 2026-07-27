import React from 'react';
import { AgentStatus } from '../types/AgentStatus';

interface AgentStatusBadgeProps {
  status: AgentStatus;
}

export const AgentStatusBadge: React.FC<AgentStatusBadgeProps> = ({ status }) => {
  const getBadgeStyle = (st: AgentStatus) => {
    switch (st) {
      case 'Running':
        return 'bg-[#ECFDF5] text-[#059669] border-emerald-200 animate-pulse';
      case 'Idle':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'Paused':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Failed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Stopped':
        return 'bg-slate-200 text-slate-800 border-slate-300';
      case 'Waiting':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(status)}`}>
      {status}
    </span>
  );
};
