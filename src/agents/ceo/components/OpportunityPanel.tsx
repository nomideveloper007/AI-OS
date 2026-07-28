import React from 'react';
import { CEOOpportunityItem } from '../CEOContext';
import { Sparkles, TrendingUp } from 'lucide-react';

interface OpportunityPanelProps {
  opportunities: CEOOpportunityItem[];
}

export const OpportunityPanel: React.FC<OpportunityPanelProps> = ({ opportunities }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          Growth & SEO Opportunities
        </h3>
        <span className="text-xs font-bold text-slate-400">{opportunities.length} Opportunities</span>
      </div>

      {opportunities.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-bold bg-slate-50/50 rounded-xl border border-slate-100">
          No growth opportunities identified yet. Run planning analysis to search!
        </div>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opp) => (
            <div key={opp.id} className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-emerald-950 text-sm">{opp.title}</span>
                <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {opp.potentialGrowth}
                </span>
              </div>
              <p className="text-emerald-900 font-medium">{opp.description}</p>
              <p className="text-[11px] font-bold text-emerald-700">Action Plan: {opp.actionPlan}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
