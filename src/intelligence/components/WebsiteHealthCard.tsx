import React from 'react';
import type { WebsiteScores, HealthGrade } from '../types/WebsiteContext';

function gradeLabel(grade: HealthGrade): string {
  switch (grade) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    default:
      return 'Critical';
  }
}

function gradeColor(grade: HealthGrade): string {
  switch (grade) {
    case 'excellent':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'good':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'fair':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'poor':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-rose-50 text-rose-700 border-rose-200';
  }
}

interface Props {
  scores: WebsiteScores;
  domain: string;
  analyzedAt?: string;
}

export const WebsiteHealthCard: React.FC<Props> = ({ scores, domain, analyzedAt }) => {
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scores.overall / 100) * circumference;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-sm">Overall Health</h3>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${gradeColor(scores.grade)}`}>
          {gradeLabel(scores.grade)}
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-slate-100"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={radius}
              className="text-[#4F46E5] transition-all duration-700"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">{scores.overall}</span>
            <span className="text-[10px] text-slate-400 font-medium">/100</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs min-w-0">
          <p className="font-extrabold text-slate-900 truncate">{domain}</p>
          <p className="text-slate-500 font-medium leading-relaxed">
            Structured health score from Website Scanner data (no AI).
          </p>
          {analyzedAt && (
            <p className="text-[10px] text-slate-400 font-semibold">
              Analyzed {new Date(analyzedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
