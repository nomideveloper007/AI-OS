import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowRight, 
  Search, 
  FileEdit, 
  Globe, 
  TrendingUp, 
  Cpu 
} from 'lucide-react';

export const AiActivityCard: React.FC = () => {
  const { activityLogs, setActiveTab } = useApp();

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'SEO Agent':
        return <Search className="w-4 h-4 text-[#2563EB]" />;
      case 'Content Agent':
        return <FileEdit className="w-4 h-4 text-[#059669]" />;
      case 'Website Agent':
        return <Globe className="w-4 h-4 text-[#0284C7]" />;
      case 'Growth Agent':
        return <TrendingUp className="w-4 h-4 text-[#0EA5E9]" />;
      case 'Task Agent':
        return <Cpu className="w-4 h-4 text-[#7C3AED]" />;
      default:
        return <Search className="w-4 h-4 text-[#2563EB]" />;
    }
  };

  const getAgentBg = (agentName: string) => {
    switch (agentName) {
      case 'SEO Agent':
        return 'bg-[#EFF6FF]';
      case 'Content Agent':
        return 'bg-[#ECFDF5]';
      case 'Website Agent':
        return 'bg-[#E0F2FE]';
      case 'Growth Agent':
        return 'bg-[#F0F9FF]';
      case 'Task Agent':
        return 'bg-[#F5F3FF]';
      default:
        return 'bg-[#EFF6FF]';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base">
          AI Activity
        </h3>
        <button 
          onClick={() => setActiveTab('activity')}
          className="text-xs font-bold text-[#4F46E5] hover:underline px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-3 my-auto">
        {activityLogs.slice(0, 5).map((act) => (
          <div 
            key={act.id} 
            className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors group cursor-pointer"
            onClick={() => setActiveTab('activity')}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${getAgentBg(act.agentName)}`}>
                {getAgentIcon(act.agentName)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {act.agentName}
                </p>
                <p className="text-[11px] font-medium text-slate-500 truncate">
                  {act.action}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 text-right">
              <span className="text-[11px] font-medium text-slate-400">
                {act.timeAgo}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Button */}
      <button 
        onClick={() => setActiveTab('activity')}
        className="w-full py-2.5 px-3 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        View All Activity <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

