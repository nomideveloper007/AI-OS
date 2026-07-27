import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineItem {
  id: string;
  kind: string;
  timestamp: string;
  title: string;
  detail: string;
}

interface Props {
  items: TimelineItem[];
}

export const TaskExecutionTimeline: React.FC<Props> = ({ items }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Clock className="w-4 h-4 text-[#4F46E5]" />
        <h3 className="font-extrabold text-slate-900 text-sm">Execution Timeline</h3>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400 font-medium text-center py-6">No timeline events yet.</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#4F46E5] mt-1.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-slate-900 capitalize truncate">{item.title}</p>
                  <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium mt-0.5 break-words">{item.detail}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.kind}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
