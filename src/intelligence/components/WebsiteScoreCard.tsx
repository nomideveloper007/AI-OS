import React from 'react';
import type { WebsiteScores } from '../types/WebsiteContext';

interface Props {
  scores: WebsiteScores;
}

const ROWS: Array<{ key: keyof WebsiteScores; label: string }> = [
  { key: 'seo', label: 'SEO' },
  { key: 'performance', label: 'Performance' },
  { key: 'security', label: 'Security' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'content', label: 'Content' },
  { key: 'maintainability', label: 'Maintainability' },
];

function barColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-rose-500';
}

export const WebsiteScoreCard: React.FC<Props> = ({ scores }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">Scores</h3>
      <div className="space-y-3">
        {ROWS.map((row) => {
          const value = scores[row.key];
          const num = typeof value === 'number' ? value : 0;
          return (
            <div key={row.key} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">{row.label}</span>
                <span className="text-slate-900 font-extrabold">{num}/100</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${barColor(num)}`}
                  style={{ width: `${num}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
