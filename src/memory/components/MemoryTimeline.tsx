import React from 'react';
import { useMemory } from '../hooks/useMemory';
import { Activity, Clock, Database, FileText } from 'lucide-react';

export const MemoryTimeline: React.FC = () => {
  const { memories } = useMemory();

  const allTimelineEvents = memories.flatMap((mem) => 
    mem.timeline.map((t) => ({
      ...t,
      memoryTitle: mem.title,
      memoryType: mem.type,
      category: mem.category
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">Memory History Audit Timeline</h3>
          <p className="text-xs text-slate-400 font-medium">Chronological audit log across all system memories</p>
        </div>
        <span className="text-xs font-bold text-slate-400">{allTimelineEvents.length} Total Audit Records</span>
      </div>

      <div className="space-y-3">
        {allTimelineEvents.length === 0 ? (
          <p className="text-xs font-semibold text-slate-400 text-center py-6">No memory timeline events recorded.</p>
        ) : (
          allTimelineEvents.map((evt) => (
            <div key={evt.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 mt-0.5">
                <Activity className="w-4 h-4 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-900">{evt.event}</span>
                  <span className="text-[10px] font-bold text-slate-400">{evt.timestamp}</span>
                </div>
                <p className="text-slate-700 font-semibold mt-0.5">{evt.memoryTitle}</p>
                <p className="text-slate-500 font-medium mt-0.5">{evt.details}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
