import React from 'react';
import { Play, FileText, CheckSquare, Database, RefreshCw } from 'lucide-react';

interface DecisionPanelProps {
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onOpenReport: () => void;
  onOpenTasks: () => void;
  onOpenMemory: () => void;
}

export const DecisionPanel: React.FC<DecisionPanelProps> = ({
  onRunAnalysis,
  isAnalyzing,
  onOpenReport,
  onOpenTasks,
  onOpenMemory
}) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-xs">
      <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">CEO Executive Control Center</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="p-4 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold transition-all shadow-sm cursor-pointer flex items-center justify-between gap-2 disabled:opacity-50"
        >
          <div className="flex items-center gap-2">
            <Play className={`w-4 h-4 fill-current ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing...' : 'Run Executive Analysis'}</span>
          </div>
          <span className="text-[10px] font-mono opacity-80">AI Engine</span>
        </button>

        <button
          onClick={onOpenReport}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold transition-colors cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>View Full Report</span>
          </div>
        </button>

        <button
          onClick={onOpenTasks}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold transition-colors cursor-pointer flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Recommended Tasks</span>
          </div>
        </button>

        <button
          onClick={onOpenMemory}
          className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-extrabold transition-colors cursor-pointer flex items-center gap-2"
        >
          <Database className="w-4 h-4 text-purple-600" />
          <span>Open Memory System</span>
        </button>
      </div>
    </div>
  );
};
