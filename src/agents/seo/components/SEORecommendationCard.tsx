import React from 'react';
import type { SEORecommendation } from '../types/SEORecommendation';
import { Lightbulb } from 'lucide-react';

interface Props {
  recommendations: SEORecommendation[];
  title?: string;
}

const priorityColor: Record<string, string> = {
  critical: 'bg-rose-50 text-rose-700 border-rose-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-slate-50 text-slate-600 border-slate-200',
};

export const SEORecommendationCard: React.FC<Props> = ({
  recommendations,
  title = 'Recommendations',
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Lightbulb className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">{title}</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">
          {recommendations.length}
        </span>
      </div>

      {recommendations.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">
          No recommendations yet.
        </p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-slate-900">{rec.title}</p>
                <span
                  className={`px-1.5 py-0.5 rounded-md border text-[10px] font-bold capitalize whitespace-nowrap ${
                    priorityColor[rec.priority]
                  }`}
                >
                  {rec.priority}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">{rec.description}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-1.5">
                {rec.type === 'quick_win' ? 'Quick win' : 'Long-term'} · Effort {rec.effort} ·{' '}
                {rec.estimatedSeoImpact}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
