import React from 'react';
import type { SEOIssue } from '../types/SEOIssue';
import { AlertTriangle } from 'lucide-react';

interface Props {
  issues: SEOIssue[];
  title?: string;
  emptyLabel?: string;
}

const severityStyle: Record<string, string> = {
  critical: 'border-rose-200 bg-rose-50/60 text-rose-800',
  warning: 'border-amber-200 bg-amber-50/60 text-amber-800',
  opportunity: 'border-indigo-200 bg-indigo-50/60 text-indigo-800',
};

export const SEOIssueCard: React.FC<Props> = ({
  issues,
  title = 'Issues',
  emptyLabel = 'No issues in this category.',
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <AlertTriangle className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">{title}</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{issues.length}</span>
      </div>

      {issues.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">{emptyLabel}</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-2.5 rounded-xl border text-xs ${severityStyle[issue.severity]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-extrabold text-slate-900">{issue.title}</p>
                <span className="text-[10px] font-bold uppercase whitespace-nowrap">
                  {issue.estimatedImpact}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium mt-1">{issue.description}</p>
              {issue.evidence ? (
                <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{issue.evidence}</p>
              ) : null}
              {issue.suggestedFix ? (
                <p className="text-[11px] font-semibold text-slate-700 mt-1.5">
                  Fix: {issue.suggestedFix}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
