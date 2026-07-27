import React from 'react';
import { useApp } from '../../context/AppContext';
import { Monitor, Globe, ClipboardList, Hourglass } from 'lucide-react';

export const StatusCardRow: React.FC = () => {
  const { website, setActiveTab } = useApp();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. AI System Status */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4 transition-all hover:shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED] flex-shrink-0">
          <Monitor className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-slate-500">AI System Status</p>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 truncate">All Systems</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[#10B981] font-bold text-xs">
            <span>Operational</span>
            <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
          </div>
          <p className="text-[11px] text-slate-400 pt-0.5">Last checked 2 min ago</p>
        </div>
      </div>

      {/* 2. Connected Website */}
      <div 
        onClick={() => setActiveTab('websites')}
        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4 cursor-pointer transition-all hover:shadow-xs group"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] flex-shrink-0 group-hover:bg-blue-100 transition-colors">
          <Globe className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Connected Website</p>
          <h3 className="text-base font-bold text-slate-900">1 Website</h3>
          <p className="text-xs font-semibold text-[#2563EB] truncate hover:underline">
            {website.domain}
          </p>
          <p className="text-[11px] text-slate-400 pt-0.5">Last scan {website.lastScan}</p>
        </div>
      </div>

      {/* 3. Running Tasks */}
      <div 
        onClick={() => setActiveTab('tasks')}
        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4 cursor-pointer transition-all hover:shadow-xs group"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] flex items-center justify-center text-[#059669] flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
          <ClipboardList className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Running Tasks</p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">12</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#059669]">5 Running</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-[#D97706]">7 Pending</span>
          </div>
        </div>
      </div>

      {/* 4. Pending Approvals */}
      <div 
        onClick={() => setActiveTab('approvals')}
        className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-4 cursor-pointer transition-all hover:shadow-xs group"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#FFFBEB] flex items-center justify-center text-[#D97706] flex-shrink-0 group-hover:bg-amber-100 transition-colors">
          <Hourglass className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">8</h3>
          <p className="text-xs font-semibold text-[#EA580C]">
            Needs your review
          </p>
        </div>
      </div>
    </div>
  );
};

