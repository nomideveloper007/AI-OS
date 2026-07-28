import React from 'react';
import { RepositoryCommit } from '../types/RepositoryCommit';
import { GitCommit, User, Calendar } from 'lucide-react';

interface CommitHistoryViewProps {
  commits: RepositoryCommit[];
}

export const CommitHistoryView: React.FC<CommitHistoryViewProps> = ({ commits }) => {
  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-[#4F46E5]" />
          Commit History ({commits.length})
        </h3>
        <span className="text-[11px] font-bold text-slate-400">Read-Only Index</span>
      </div>

      <div className="space-y-2">
        {commits.map((commit) => (
          <div key={commit.sha} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-extrabold text-slate-900 text-xs leading-snug">
                {commit.message}
              </span>
              <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-100">
                {commit.sha.substring(0, 7)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
              <div className="flex items-center gap-2">
                <img
                  src={commit.authorAvatarUrl}
                  alt={commit.authorName}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-slate-800 font-bold">{commit.authorName}</span>
              </div>
              <span className="font-mono text-slate-400">
                {new Date(commit.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
