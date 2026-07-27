import React from 'react';
import type { StrategicPlan } from '../planning/planTypes';
import {
  Target,
  Map,
  ListOrdered,
  Users,
  TrendingUp,
  Activity,
  Flag,
} from 'lucide-react';

interface StrategicPlanningPanelProps {
  plan: StrategicPlan;
}

export const StrategicPlanningPanel: React.FC<StrategicPlanningPanelProps> = ({ plan }) => {
  return (
    <div className="space-y-6 text-xs animate-fade-in">
      {/* Executive Summary + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Flag className="w-4 h-4 text-[#4F46E5]" />
            Executive Summary
          </h3>
          <p className="text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {plan.executiveSummary}
          </p>
          <p className="text-slate-500 font-semibold">
            Estimated impact: <span className="text-slate-800">{plan.estimatedImpact}</span>
          </p>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            Business Health
          </h3>
          <div className="text-center py-2">
            <p className="text-4xl font-extrabold text-[#4F46E5]">{plan.businessHealthScore}</p>
            <p className="text-slate-500 font-bold mt-1">/ 100</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(plan.healthBreakdown).map(([k, v]) => (
              <div key={k} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] uppercase font-extrabold text-slate-400">{k}</p>
                <p className="font-extrabold text-slate-800">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Goals + Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-[#4F46E5]" />
            Company Goals
          </h3>
          <div className="space-y-2">
            {plan.strategicGoals.map((g) => (
              <div key={g.id} className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-indigo-900">{g.title}</p>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white border border-indigo-100 text-indigo-700">
                    {g.horizon} · {g.priority}
                  </span>
                </div>
                <p className="text-slate-600 font-medium mt-1">{g.description}</p>
                <p className="text-slate-400 font-semibold mt-1">
                  Metric: {g.successMetric} · Owner: {g.ownerEmployee}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-amber-600" />
            Top Priorities
          </h3>
          <div className="space-y-2">
            {plan.topPriorities.map((p) => (
              <div key={p.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                <p className="font-extrabold text-amber-900">
                  #{p.rank} {p.title}
                </p>
                <p className="text-slate-600 font-medium mt-1">{p.rationale}</p>
                <p className="text-slate-400 font-semibold mt-1">
                  {p.priority} · Impact: {p.estimatedImpact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Roadmap */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
          <Map className="w-4 h-4 text-[#4F46E5]" />
          Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(['daily', 'weekly', 'monthly', 'quarterly'] as const).map((horizon) => (
            <div key={horizon} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <p className="font-extrabold text-slate-800 capitalize">{horizon}</p>
              {(plan.roadmap[horizon] || []).map((item) => (
                <div key={item.id}>
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase">{item.periodLabel}</p>
                  <ul className="mt-1 space-y-1">
                    {item.items.map((line, idx) => (
                      <li key={idx} className="font-medium text-slate-700 flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[#4F46E5] mt-1.5 flex-shrink-0" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended employees + Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F46E5]" />
            Recommended AI Employees
          </h3>
          <div className="flex flex-wrap gap-2">
            {plan.recommendedEmployees.map((e) => (
              <span
                key={e}
                className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {e}
              </span>
            ))}
          </div>
          <div className="pt-2 space-y-1">
            <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Long-term strategy
            </p>
            {plan.longTermStrategy.map((line, i) => (
              <p key={i} className="text-slate-600 font-medium">
                • {line}
              </p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Progress
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase">Completed</p>
              <p className="text-xl font-extrabold text-emerald-800">{plan.progress.completedTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <p className="text-[10px] font-extrabold text-rose-600 uppercase">Failed</p>
              <p className="text-xl font-extrabold text-rose-800">{plan.progress.failedTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase">Open</p>
              <p className="text-xl font-extrabold text-slate-800">{plan.progress.openTasks}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-[10px] font-extrabold text-indigo-600 uppercase">Completion</p>
              <p className="text-xl font-extrabold text-indigo-800">{plan.progress.completionRate}%</p>
            </div>
          </div>
          <p className="text-slate-400 font-semibold">
            Sources — WI: {plan.sourceNotes.websiteIntelligenceLoaded ? 'yes' : 'no'} · Memory:{' '}
            {plan.sourceNotes.memoryItemsLoaded} · Reports: {plan.sourceNotes.historicalReportsLoaded} ·
            Tasks: {plan.sourceNotes.taskHistoryLoaded}
          </p>
        </div>
      </div>
    </div>
  );
};
