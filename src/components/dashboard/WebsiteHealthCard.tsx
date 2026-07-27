import React from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Gauge, Search, ShieldCheck, Accessibility } from 'lucide-react';

export const WebsiteHealthCard: React.FC = () => {
  const { website, setActiveTab } = useApp();
  const { healthScore, metrics } = website;

  // Calculate SVG arc parameters for circular progress
  const radius = 48;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base">
          Website Health Overview
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto">
        {/* Left Circular Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center p-2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-slate-100"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
              />
              {/* Colored Progress Ring */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="text-[#10B981] transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 leading-none">
                {healthScore}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5">
                /100
              </span>
            </div>
          </div>
          <span className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669]">
            Good
          </span>
        </div>

        {/* Right Metrics Progress Bars */}
        <div className="sm:col-span-7 space-y-3.5 pl-0 sm:pl-2">
          {/* Performance */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                  <Gauge className="w-3 h-3" />
                </span>
                Performance
              </span>
              <span className="text-slate-900 font-bold">{metrics.performance}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#10B981] h-full rounded-full transition-all duration-700" 
                style={{ width: `${metrics.performance}%` }}
              ></div>
            </div>
          </div>

          {/* SEO */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center text-[10px]">
                  <Search className="w-3 h-3" />
                </span>
                SEO
              </span>
              <span className="text-slate-900 font-bold">{metrics.seo}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#3B82F6] h-full rounded-full transition-all duration-700" 
                style={{ width: `${metrics.seo}%` }}
              ></div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center text-[10px]">
                  <ShieldCheck className="w-3 h-3" />
                </span>
                Security
              </span>
              <span className="text-slate-900 font-bold">{metrics.security}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#8B5CF6] h-full rounded-full transition-all duration-700" 
                style={{ width: `${metrics.security}%` }}
              ></div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]">
                  <Accessibility className="w-3 h-3" />
                </span>
                Accessibility
              </span>
              <span className="text-slate-900 font-bold">{metrics.accessibility}/100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#F97316] h-full rounded-full transition-all duration-700" 
                style={{ width: `${metrics.accessibility}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <button 
        onClick={() => setActiveTab('reports')}
        className="w-full py-2.5 px-3 rounded-xl bg-[#EEF2FF] hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        View Full Report <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

