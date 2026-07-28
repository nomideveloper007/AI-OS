import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Download, 
  Search, 
  Gauge, 
  TrendingUp, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { website, showToast } = useApp();

  const handleExport = () => {
    showToast('Exported AI OS Executive Audit PDF Report!');
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Analytics & Executive Reports</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Detailed performance, SEO, traffic trends, and audit scores for {website.domain}.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          Export PDF Report
        </button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Website Health */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Website Health</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{website.healthScore}/100</p>
          <p className="text-xs text-emerald-600 font-bold">↑ +4 points from last week</p>
        </div>

        {/* Traffic */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Traffic</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">2,485</p>
          <p className="text-xs text-emerald-600 font-bold">↑ +18.6% growth rate</p>
        </div>

        {/* SEO Score */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">SEO Score</span>
            <Search className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{website.metrics.seo}/100</p>
          <p className="text-xs text-blue-600 font-bold">42 indexed pages optimized</p>
        </div>

        {/* Performance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Performance</span>
            <Gauge className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{website.metrics.performance}/100</p>
          <p className="text-xs text-purple-600 font-bold">0.8s LCP • 98% TTFB score</p>
        </div>
      </div>

      {/* Chart Panels (2 Grid Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Placeholder Chart 1: Traffic Trend */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Traffic & Visitor Growth</h3>
            <span className="text-xs text-slate-400 font-bold">Last 30 Days</span>
          </div>

          <div className="h-48 border border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <BarChart3 className="w-8 h-8 text-[#4F46E5] animate-pulse" />
            <p className="text-xs font-extrabold text-slate-800">
              Traffic Data Visualization Area
            </p>
            <p className="text-[11px] text-slate-400 font-medium max-w-xs">
              Autonomous AI Agents are collecting live analytics signals. Full historical charts will load here.
            </p>
          </div>
        </div>

        {/* Placeholder Chart 2: SEO & Speed Audit Breakdown */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">PageSpeed & Core Web Vitals</h3>
            <span className="text-xs text-slate-400 font-bold">LCP / FID / CLS</span>
          </div>

          <div className="h-48 border border-dashed border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Layers className="w-8 h-8 text-blue-500 animate-pulse" />
            <p className="text-xs font-extrabold text-slate-800">
              Core Web Vitals Audit Graph
            </p>
            <p className="text-[11px] text-slate-400 font-medium max-w-xs">
              Detailed DOM rendering speeds and mobile accessibility graphs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
