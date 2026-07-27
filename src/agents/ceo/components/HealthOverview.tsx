import React from 'react';
import { HealthScores } from '../CEOContext';
import { ShieldCheck, Zap, Search, FileText, Smartphone, Globe, Sparkles } from 'lucide-react';

interface HealthOverviewProps {
  scores: HealthScores;
}

export const HealthOverview: React.FC<HealthOverviewProps> = ({ scores }) => {
  const getScoreBadgeStyle = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    return 'text-amber-700 bg-amber-50 border-amber-200';
  };

  const metrics = [
    { label: 'Overall Health', score: scores.overall, icon: Sparkles, color: 'text-amber-500' },
    { label: 'Website Engine', score: scores.website, icon: Globe, color: 'text-indigo-500' },
    { label: 'SEO Audit', score: scores.seo, icon: Search, color: 'text-blue-500' },
    { label: 'Performance', score: scores.performance, icon: Zap, color: 'text-[#4F46E5]' },
    { label: 'Security & SSL', score: scores.security, icon: ShieldCheck, color: 'text-emerald-500' },
    { label: 'Content Depth', score: scores.content, icon: FileText, color: 'text-purple-500' },
    { label: 'User Experience', score: scores.userExperience, icon: Smartphone, color: 'text-rose-500' },
    { label: 'Accessibility', score: scores.accessibility, icon: ShieldCheck, color: 'text-teal-500' }
  ];

  return (
    <div className="space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Multi-Dimensional Technical Health Scorecard</h3>
        <span className="text-xs font-bold text-slate-400">8 Core Metric Vectors</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-bold">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-slate-900">{m.score}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getScoreBadgeStyle(m.score)}`}>
                  {m.score >= 90 ? 'Optimal' : m.score >= 75 ? 'Good' : 'Needs Work'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4F46E5] rounded-full transition-all duration-500" 
                  style={{ width: `${m.score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
