import React from 'react';
import type { AgentMessage } from '../types/AgentMessage';
import { MessageSquare } from 'lucide-react';

interface AgentConversationProps {
  messages: AgentMessage[];
}

const typeClass = (type: AgentMessage['type']) => {
  if (type === 'conflict_notice') return 'bg-rose-50 border-rose-100 text-rose-900';
  if (type === 'consensus') return 'bg-emerald-50 border-emerald-100 text-emerald-900';
  if (type === 'system') return 'bg-slate-50 border-slate-100 text-slate-700';
  if (type === 'share_finding') return 'bg-indigo-50/60 border-indigo-100 text-indigo-900';
  return 'bg-white border-slate-100 text-slate-800';
};

export const AgentConversation: React.FC<AgentConversationProps> = ({ messages }) => {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 text-xs">
      <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-[#4F46E5]" />
        Live Messages ({messages.length})
      </h3>
      {messages.length === 0 ? (
        <p className="text-slate-500 font-semibold">No messages yet.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {messages.map((m) => (
            <div key={m.id} className={`p-3 rounded-xl border ${typeClass(m.type)}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="font-extrabold">
                  {m.fromAgentName}
                  {m.toAgentName ? ` → ${m.toAgentName}` : ''}
                </p>
                <span className="text-[10px] font-extrabold uppercase opacity-70">{m.type.replace(/_/g, ' ')}</span>
              </div>
              <p className="font-bold mt-1">{m.subject}</p>
              <p className="font-medium mt-0.5 opacity-90">{m.body}</p>
              <p className="text-[10px] font-semibold opacity-60 mt-1">
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
