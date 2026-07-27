import React from 'react';
import { BaseAgent } from '../core/BaseAgent';

interface AgentLogsProps {
  agent: BaseAgent;
}

export const AgentLogs: React.FC<AgentLogsProps> = ({ agent }) => {
  const logs = agent.getLogs();

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Agent System Execution Logs</h3>
        <span className="text-xs font-bold text-slate-400">{logs.length} Log Entries</span>
      </div>

      <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic">No logs recorded for this agent.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="leading-tight space-x-2">
              <span className="text-slate-500">{log.timestamp}</span>
              <span className={`font-bold ${
                log.level === 'error' ? 'text-rose-400' : log.level === 'warn' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-slate-200">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
