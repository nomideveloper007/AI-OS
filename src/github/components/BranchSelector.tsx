import React from 'react';
import { RepositoryBranch } from '../types/RepositoryBranch';
import { GitBranch, ShieldCheck } from 'lucide-react';

interface BranchSelectorProps {
  branches: RepositoryBranch[];
  selectedBranch: string;
  onSelectBranch: (name: string) => void;
}

export const BranchSelector: React.FC<BranchSelectorProps> = ({
  branches,
  selectedBranch,
  onSelectBranch
}) => {
  return (
    <div className="flex items-center gap-2 text-xs">
      <GitBranch className="w-4 h-4 text-slate-400" />
      <span className="font-extrabold text-slate-700">Branch:</span>
      <select
        value={selectedBranch}
        onChange={(e) => onSelectBranch(e.target.value)}
        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-extrabold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
      >
        {branches.map((b) => (
          <option key={b.name} value={b.name}>
            {b.name} {b.isDefault ? '(default)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
