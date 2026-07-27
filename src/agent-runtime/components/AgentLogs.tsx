import React from 'react';
import type { AgentRuntimeLogEntry } from '../core/AgentLogger';
import { ScrollText } from 'lucide-react';

interface Props {
  logs: AgentRuntimeLogEntry[];
}

const levelColor: Record<string, string> = {
  INFO: 'text-indigo-700',
  WARN: 'text-amber-700',
  ERROR: 'text-rose-700',
  DEBUG: 'text-slate-500',
};

export const AgentLogs: React.FC<Props> = ({ logs }) => {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <ScrollText className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Logs</h3>
        <span className="ml-auto text-[10px] font-bold text-slate-400">{logs.length}</span>
      </div>

      {logs.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-6">No runtime logs yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 font-mono">
          {logs.slice(0, 60).map((log) => (
            <div
              key={log.id}
              className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[10px]"
            >
              <span className={`font-bold ${levelColor[log.level] || 'text-slate-600'}`}>
                [{log.level}]
              </span>{' '}
              <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>{' '}
              <span className="text-slate-500">{log.source}</span>
              <p className="text-slate-700 font-medium mt-0.5 whitespace-pre-wrap break-words">
                {log.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
