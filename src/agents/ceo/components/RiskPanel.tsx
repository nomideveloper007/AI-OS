import React from 'react';
import { CEORiskItem } from '../CEOContext';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskPanelProps {
  risks: CEORiskItem[];
}

export const RiskPanel: React.FC<RiskPanelProps> = ({ risks }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          Critical Risk Audit
        </h3>
        <span className="text-xs font-bold text-slate-400">{risks.length} Risks Identified</span>
      </div>

      <div className="space-y-3">
        {risks.map((risk) => (
          <div key={risk.id} className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-rose-950 text-sm">{risk.title}</span>
              <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-rose-100 text-rose-800 border border-rose-200">
                {risk.severity} Severity
              </span>
            </div>
            <p className="text-rose-900 font-medium">{risk.description}</p>
            <p className="text-[11px] font-bold text-rose-700">Mitigation: {risk.mitigationStrategy}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
