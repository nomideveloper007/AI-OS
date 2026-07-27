import React from 'react';
import type { WebsiteInsight } from '../types/WebsiteInsight';
import { Lightbulb } from 'lucide-react';

interface Props {
  insights: WebsiteInsight[];
}

function severityClass(severity: WebsiteInsight['severity']): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'important':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

export const WebsiteInsightCard: React.FC<Props> = ({ insights }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Lightbulb className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Insights</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{insights.length}</span>
      </div>

      {insights.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">No insights generated.</p>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {insights.map((insight) => (
            <div key={insight.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${severityClass(insight.severity)}`}>
                  {insight.severity}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">{insight.category}</span>
              </div>
              <p className="text-xs font-extrabold text-slate-900">{insight.title}</p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{insight.description}</p>
              {insight.recommendation && (
                <p className="text-[11px] text-indigo-700 font-semibold">→ {insight.recommendation}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
