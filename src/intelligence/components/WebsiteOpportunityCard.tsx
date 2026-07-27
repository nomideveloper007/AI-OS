import React from 'react';
import type { WebsiteOpportunity } from '../types/WebsiteOpportunity';
import { TrendingUp } from 'lucide-react';

interface Props {
  opportunities: WebsiteOpportunity[];
}

function impactClass(impact: WebsiteOpportunity['impact']): string {
  switch (impact) {
    case 'high':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'medium':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function categoryLabel(category: WebsiteOpportunity['category']): string {
  return category.replace(/_/g, ' ');
}

export const WebsiteOpportunityCard: React.FC<Props> = ({ opportunities }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <TrendingUp className="w-4 h-4 text-emerald-600" />
        <h3 className="font-extrabold text-slate-900 text-sm">Opportunities</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{opportunities.length}</span>
      </div>

      {opportunities.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">No opportunities listed.</p>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${impactClass(opp.impact)}`}>
                  {opp.impact} impact
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  {categoryLabel(opp.category)}
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-900">{opp.title}</p>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{opp.description}</p>
              {opp.expectedBenefit && (
                <p className="text-[11px] text-emerald-700 font-semibold">Benefit: {opp.expectedBenefit}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
