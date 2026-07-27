import React from 'react';
import { WorkflowStep } from '../types/WorkflowStep';
import { Layers, Bot, Clock, RotateCcw, ShieldCheck } from 'lucide-react';

interface WorkflowStepsProps {
  steps: WorkflowStep[];
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ steps }) => {
  return (
    <div className="space-y-4 text-xs">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-900">Ordered Workflow Pipeline Steps</h3>
        <span className="text-xs font-bold text-slate-400">{steps.length} Steps</span>
      </div>

      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div key={step.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-[#4F46E5] font-extrabold flex items-center justify-center text-[11px]">
                  {idx + 1}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">{step.name}</span>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                step.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-700'
              }`}>
                {step.status}
              </span>
            </div>

            <p className="text-slate-600 font-medium">{step.description}</p>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1 text-slate-700">
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                Assigned: {step.assignedAgent || 'Unassigned'}
              </span>

              <span className="px-2 py-0.5 bg-white border border-slate-200 text-indigo-700 font-mono rounded">
                Action: {step.action}
              </span>

              {step.condition && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 font-mono rounded">
                  Condition: {step.condition}
                </span>
              )}

              <span>Est: {step.estimatedDuration}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
