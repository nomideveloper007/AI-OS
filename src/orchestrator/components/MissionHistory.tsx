import React from 'react';
import type { MissionHistoryEntry } from '../repositories/MissionHistoryRepository';
import { History } from 'lucide-react';

interface MissionHistoryProps {
  entries: MissionHistoryEntry[];
  onSelect?: (missionId: string) => void;
}

export const MissionHistoryView: React.FC<MissionHistoryProps> = ({ entries, onSelect }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
        <History className="w-4 h-4 text-[#4F46E5]" />
        Mission History ({entries.length})
      </h3>
      {entries.length === 0 ? (
        <p className="text-slate-500 font-semibold">No finished missions yet.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
          {entries.map((e) => (
            <button
              key={e.id}
              type="button"
              onClick={() => onSelect?.(e.missionId)}
              className="w-full text-left p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-extrabold text-slate-900">{e.title}</p>
                <span className="text-[10px] font-extrabold uppercase text-slate-500">{e.status}</span>
              </div>
              <p className="text-slate-500 font-medium mt-0.5">{e.domain}</p>
              <p className="text-slate-600 font-medium mt-1 line-clamp-2">{e.summary}</p>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">
                {new Date(e.completedAt).toLocaleString()}
                {e.confidenceScore != null ? ` · confidence ${e.confidenceScore}%` : ''}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/** Alias matching requested MissionHistory.tsx export usage */
export { MissionHistoryView as MissionHistory };
