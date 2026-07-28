import React from 'react';
import { RepositoryObject } from '../types/Repository';
import { GitFork, Star, GitBranch, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface RepositoryCardProps {
  repo: RepositoryObject;
  isSelected: boolean;
  onSelect: () => void;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repo, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer space-y-3 shadow-2xs ${
        isSelected
          ? 'border-[#4F46E5] ring-2 ring-indigo-500/20 shadow-xs'
          : 'border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/50'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 text-sm hover:text-[#4F46E5] transition-colors">
            {repo.fullName}
          </span>
          {repo.isPrivate ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Private
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
              Public
            </span>
          )}
        </div>

        <a
          href={repo.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-400 hover:text-indigo-600 p-1"
          title="Open in GitHub"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <p className="text-slate-600 text-xs font-medium line-clamp-2 leading-relaxed">
        {repo.description}
      </p>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-bold text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            {repo.primaryLanguage}
          </span>

          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {repo.framework}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-600">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {repo.starsCount}
          </span>
          <span className="flex items-center gap-1 text-slate-600">
            <GitFork className="w-3.5 h-3.5 text-slate-400" />
            {repo.forksCount}
          </span>
        </div>
      </div>
    </div>
  );
};
