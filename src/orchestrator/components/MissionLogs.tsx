import React from 'react';
import type { MissionLogEntry } from '../core/MissionLogger';
import { ScrollText } from 'lucide-react';

interface MissionLogsProps {
  logs: MissionLogEntry[];
}

const levelClass = (level: MissionLogEntry['level']) => {
  if (level === 'ERROR') return 'text-rose-700';
  if (level === 'WARN') return 'text-amber-700';
  if (level === 'SUCCESS') return 'text-emerald-700';
  return 'text-slate-700';
};

export const MissionLogs: React.FC<MissionLogsProps> = ({ logs }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
        <ScrollText className="w-4 h-4 text-[#4F46E5]" />
        Execution Logs ({logs.length})
      </h3>
      {logs.length === 0 ? (
        <p className="text-slate-500 font-semibold">No logs yet.</p>
      ) : (
        <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar font-mono">
          {logs.map((l) => (
            <div key={l.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className={`font-extrabold ${levelClass(l.level)}`}>[{l.level}]</span>{' '}
              <span className="text-slate-400">{new Date(l.timestamp).toLocaleTimeString()}</span>
              {l.stage ? <span className="text-indigo-600"> · {l.stage}</span> : null}
              <p className="text-slate-700 font-medium mt-0.5 whitespace-pre-wrap">{l.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
