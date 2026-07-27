import React from 'react';
import type { AgentContribution } from '../types/AgentContribution';
import { GitCommitHorizontal } from 'lucide-react';

interface ContributionTimelineProps {
  contributions: AgentContribution[];
}

export const ContributionTimeline: React.FC<ContributionTimelineProps> = ({ contributions }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
        <GitCommitHorizontal className="w-4 h-4 text-[#4F46E5]" />
        Contribution Timeline ({contributions.length})
      </h3>
      {contributions.length === 0 ? (
        <p className="text-slate-500 font-semibold">No contributions yet.</p>
      ) : (
        <ol className="relative border-l border-slate-200 ml-2 space-y-4">
          {contributions.map((c) => (
            <li key={c.id} className="ml-4">
              <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-[#4F46E5] border-2 border-white" />
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-extrabold text-slate-900">{c.title}</p>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {c.kind} · {c.confidence}%
                  </span>
                </div>
                <p className="text-slate-600 font-medium mt-1">{c.summary}</p>
                <p className="text-slate-400 font-semibold mt-1">
                  {c.agentName} ({c.agentRole}) · {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
