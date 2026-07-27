import React, { useState } from 'react';
import { WebsiteItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Play, X, ShieldAlert, WifiOff, Clock, Lock, Server } from 'lucide-react';

interface ScanErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  website: WebsiteItem;
}

export const ScanErrorModal: React.FC<ScanErrorModalProps> = ({ isOpen, onClose, website }) => {
  const { startWebsiteScan } = useApp();
  const [selectedError, setSelectedError] = useState<string>('none');

  if (!isOpen) return null;

  const handleRunScan = () => {
    startWebsiteScan(website.id, selectedError);
    onClose();
  };

  const errorOptions = [
    { id: 'none', label: 'Normal Clean Scan (200 OK)', desc: 'Full success response with all pages & metadata.', icon: Play, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'offline', label: 'Website Offline', desc: 'Target server is unreachable or host down.', icon: WifiOff, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'timeout', label: 'Connection Timeout', desc: 'Server request timed out after 30,000ms.', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'ssl_error', label: 'Invalid SSL Certificate', desc: 'Hostname mismatch or expired TLS certificate.', icon: Lock, color: 'text-red-600 bg-red-50 border-red-200' },
    { id: 'dns_error', label: 'DNS Resolution Failure', desc: 'Domain name cannot be resolved (ENOTFOUND).', icon: AlertTriangle, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { id: 'blocked', label: 'Blocked Request (WAF / 403)', desc: 'Cloudflare WAF or firewall blocked scanner payload.', icon: ShieldAlert, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { id: 'http_500', label: 'Internal Server Error (500)', desc: 'Target website returned 500 error page.', icon: Server, color: 'text-slate-700 bg-slate-100 border-slate-300' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Play className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Run Website Scanner</h3>
              <p className="text-xs text-slate-500 font-medium">Target: {website.domain}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Select Execution Mode</label>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {errorOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedError === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedError(opt.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected ? 'border-[#4F46E5] bg-indigo-50/40 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{opt.label}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{opt.desc}</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="scanOption"
                    checked={isSelected}
                    onChange={() => setSelectedError(opt.id)}
                    className="w-4 h-4 text-[#4F46E5]"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleRunScan}
            className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start Scan
          </button>
        </div>
      </div>
    </div>
  );
};
