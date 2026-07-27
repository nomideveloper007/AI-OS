import React from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { Activity, Clock } from 'lucide-react';

export const WorkflowTimeline: React.FC = () => {
  const { engine } = useWorkflow();
  const executions = engine.logger.getAllLogs();

  return (
    <div className="space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Execution Audit Log Timeline</h3>
        <span className="text-xs font-bold text-slate-400">{executions.length} Events</span>
      </div>

      <div className="space-y-3">
        {executions.length === 0 ? (
          <p className="text-slate-400 font-semibold text-center py-6">No execution timeline events logged.</p>
        ) : (
          executions.map((evt) => (
            <div key={evt.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Workflow Log Event</span>
                  <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-slate-600 font-medium mt-0.5">{evt.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
