import React from 'react';
import type { SEOReport } from '../types/SEOReport';
import type { SEOAudit } from '../types/SEOAudit';
import { History } from 'lucide-react';

interface Props {
  reports: SEOReport[];
  audits: SEOAudit[];
  selectedReportId?: string;
  onSelectReport?: (id: string) => void;
}

export const SEOHistoryView: React.FC<Props> = ({
  reports,
  audits,
  selectedReportId,
  onSelectReport,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <History className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">History</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">
          {reports.length} reports
        </span>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-4">
          No SEO audit history yet.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {reports.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectReport?.(r.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg border text-[11px] cursor-pointer ${
                selectedReportId === r.id
                  ? 'bg-indigo-50 border-indigo-200'
                  : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 truncate">{r.domain}</span>
                <span className="font-bold text-indigo-700">{r.overallSeoScore}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {new Date(r.createdAt).toLocaleString()} · {r.priority} ·{' '}
                {r.criticalIssues.length} critical
              </p>
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-slate-100 pt-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Recent executions</p>
        {audits.length === 0 ? (
          <p className="text-[11px] text-slate-400 font-medium">No executions yet.</p>
        ) : (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {audits.slice(0, 8).map((a) => (
              <div
                key={a.id}
                className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px] font-medium text-slate-600"
              >
                {a.domain} · {a.status.replace(/_/g, ' ')} · {a.progress}%
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
