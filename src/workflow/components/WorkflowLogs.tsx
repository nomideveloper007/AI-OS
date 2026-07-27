import React from 'react';
import { useWorkflow } from '../hooks/useWorkflow';

interface WorkflowLogsProps {
  workflowId: string;
}

export const WorkflowLogs: React.FC<WorkflowLogsProps> = ({ workflowId }) => {
  const { engine } = useWorkflow();
  const logs = engine.logger.getLogsForWorkflow(workflowId);

  return (
    <div className="space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Workflow Execution Logs</h3>
        <span className="text-xs font-bold text-slate-400">{logs.length} Log Entries</span>
      </div>

      <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-slate-500 italic">No execution logs recorded for this workflow.</p>
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
