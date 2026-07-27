import React from 'react';
import type { Consensus } from '../types/Consensus';
import type { Conflict } from '../types/Conflict';
import type { CollaborationFinalReport } from '../types/CollaborationSession';
import { Award, AlertTriangle, FileText } from 'lucide-react';

interface ConsensusCardProps {
  consensus: Consensus[];
  conflicts: Conflict[];
  report?: CollaborationFinalReport;
}

export const ConsensusCard: React.FC<ConsensusCardProps> = ({ consensus, conflicts, report }) => {
  return (
    <div className="space-y-4 text-xs">
      {report && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#4F46E5]" />
            Final Report
          </h3>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-extrabold text-slate-900">{report.title}</p>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Confidence {report.confidenceScore}%
            </span>
          </div>
          <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {report.executiveSummary}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="font-extrabold text-slate-800 mb-1">Key findings</p>
              <ul className="space-y-1">
                {report.keyFindings.map((f, i) => (
                  <li key={i} className="text-slate-600 font-medium">
                    • {f}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-extrabold text-slate-800 mb-1">Recommendations</p>
              <ul className="space-y-1">
                {report.recommendations.map((r, i) => (
                  <li key={i} className="text-slate-600 font-medium">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {report.risks.length > 0 && (
            <div>
              <p className="font-extrabold text-slate-800 mb-1">Risks</p>
              <ul className="space-y-1">
                {report.risks.map((r, i) => (
                  <li key={i} className="text-amber-800 font-medium">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-600" />
            Consensus
          </h3>
          {consensus.length === 0 ? (
            <p className="text-slate-500 font-semibold">No consensus yet.</p>
          ) : (
            consensus.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <p className="font-extrabold text-emerald-900">{c.topic}</p>
                <p className="text-slate-700 font-medium mt-1">{c.winningPosition}</p>
                <p className="text-slate-400 font-semibold mt-1">
                  Confidence {c.confidenceScore}% · {c.votes.length} votes
                </p>
              </div>
            ))
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Conflicts
          </h3>
          {conflicts.length === 0 ? (
            <p className="text-slate-500 font-semibold">No conflicts recorded.</p>
          ) : (
            conflicts.map((c) => (
              <div key={c.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-amber-900">{c.topic}</p>
                  <span className="text-[10px] font-extrabold uppercase">{c.status}</span>
                </div>
                <p className="text-slate-600 font-medium mt-1">{c.description}</p>
                {c.resolution && (
                  <p className="text-slate-500 font-semibold mt-1">Resolution: {c.resolution}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
