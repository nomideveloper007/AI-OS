import React from 'react';
import { RepositoryMetricsData } from '../types/RepositoryMetrics';
import { HardDrive, FileCode2, FolderTree, Users, GitBranch, Clock, Layers } from 'lucide-react';

interface RepositoryMetricsCardProps {
  metrics: RepositoryMetricsData;
}

export const RepositoryMetricsCard: React.FC<RepositoryMetricsCardProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-extrabold uppercase text-[10px]">Repository Size</span>
          <HardDrive className="w-4 h-4 text-indigo-500" />
        </div>
        <p className="text-xl font-extrabold text-slate-900">{(metrics.sizeKb / 1024).toFixed(1)} MB</p>
        <p className="text-[10px] font-semibold text-slate-400">{metrics.sizeKb} KB total payload</p>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-extrabold uppercase text-[10px]">Total Files</span>
          <FileCode2 className="w-4 h-4 text-blue-500" />
        </div>
        <p className="text-xl font-extrabold text-slate-900">{metrics.filesCount}</p>
        <p className="text-[10px] font-semibold text-slate-400">{metrics.directoriesCount} directories</p>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-extrabold uppercase text-[10px]">Detected Framework</span>
          <Layers className="w-4 h-4 text-purple-500" />
        </div>
        <p className="text-xl font-extrabold text-slate-900">{metrics.framework}</p>
        <p className="text-[10px] font-semibold text-slate-400">Primary: {metrics.languages[0]?.name || 'TypeScript'}</p>
      </div>

      <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-extrabold uppercase text-[10px]">Contributors</span>
          <Users className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-xl font-extrabold text-slate-900">{metrics.contributorsCount}</p>
        <p className="text-[10px] font-semibold text-slate-400">Default branch: {metrics.defaultBranch}</p>
      </div>
    </div>
  );
};
