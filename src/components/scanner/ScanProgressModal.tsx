import React from 'react';
import { useApp } from '../../context/AppContext';
import { SCAN_STEPS } from '../../data/scannerEngine';
import { Loader2, CheckCircle2, Circle, Globe, X } from 'lucide-react';

export const ScanProgressModal: React.FC = () => {
  const { activeScanningWebsite, scanningStepIndex, cancelScan } = useApp();

  if (!activeScanningWebsite) return null;

  const totalSteps = SCAN_STEPS.length;
  const currentStepLabel = SCAN_STEPS[scanningStepIndex] || 'Processing...';
  const progressPercent = Math.min(100, Math.round(((scanningStepIndex + 1) / totalSteps) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Loader2 className="w-6 h-6 animate-spin stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Scanning Website
              </h3>
              <p className="text-xs font-bold text-[#4F46E5] flex items-center gap-1 mt-0.5">
                <Globe className="w-3.5 h-3.5" />
                {activeScanningWebsite.domain}
              </p>
            </div>
          </div>

          <button
            onClick={cancelScan}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Cancel scan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar & Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span className="text-slate-700">{currentStepLabel}</span>
            <span className="text-[#4F46E5]">{progressPercent}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-[#4F46E5] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Animated Steps Checklist */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
          {SCAN_STEPS.map((stepText, idx) => {
            const isDone = idx < scanningStepIndex;
            const isCurrent = idx === scanningStepIndex;
            return (
              <div 
                key={stepText} 
                className={`flex items-center justify-between text-xs font-bold transition-colors ${
                  isDone 
                    ? 'text-emerald-700 font-bold' 
                    : isCurrent 
                    ? 'text-[#4F46E5]' 
                    : 'text-slate-400 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#4F46E5] animate-spin flex-shrink-0 stroke-[2.5]" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300 flex-shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>

                {isDone && <span className="text-[10px] text-emerald-600 font-mono">DONE</span>}
                {isCurrent && <span className="text-[10px] text-[#4F46E5] font-mono animate-pulse">RUNNING</span>}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-slate-400 font-medium text-center">
          Collecting technical headers, meta tags, assets, and page structures...
        </p>
      </div>
    </div>
  );
};
