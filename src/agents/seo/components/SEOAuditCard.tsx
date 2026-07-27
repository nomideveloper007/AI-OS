import React from 'react';
import type { SEOAudit } from '../types/SEOAudit';
import { FileSearch } from 'lucide-react';

interface Props {
  audit: SEOAudit;
}

export const SEOAuditCard: React.FC<Props> = ({ audit }) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <FileSearch className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Active Audit</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400 capitalize">
          {audit.status.replace(/_/g, ' ')}
        </span>
      </div>

      <p className="text-sm font-extrabold text-slate-900">{audit.domain}</p>
      <p className="text-[11px] text-slate-500 font-medium">{audit.message}</p>

      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            audit.status === 'failed' ? 'bg-rose-500' : 'bg-[#4F46E5]'
          }`}
          style={{ width: `${audit.progress}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500">
        <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          Progress {audit.progress}%
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          {audit.durationMs != null ? `${audit.durationMs}ms` : 'In progress'}
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          Memory ctx {audit.context?.memoryItemsLoaded ?? 0}
        </div>
        <div className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
          Prev reports {audit.context?.previousReportsLoaded ?? 0}
        </div>
      </div>

      {audit.errorMessage ? (
        <p className="text-xs font-semibold text-rose-700">{audit.errorMessage}</p>
      ) : null}
    </div>
  );
};
