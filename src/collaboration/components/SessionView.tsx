import React from 'react';
import type { CollaborationSessionBundle } from '../types/CollaborationSession';
import { AgentConversation } from './AgentConversation';
import { ContributionTimeline } from './ContributionTimeline';
import { ConsensusCard } from './ConsensusCard';
import { Users, Database, Globe2, ArrowLeft } from 'lucide-react';

interface SessionViewProps {
  bundle: CollaborationSessionBundle;
  onBack: () => void;
}

export const SessionView: React.FC<SessionViewProps> = ({ bundle, onBack }) => {
  const { session, contributions, messages, conflicts, consensus } = bundle;
  const ctx = session.sharedContext;

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to sessions
        </button>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
          {session.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
        <h2 className="text-base font-extrabold text-slate-900">{session.title}</h2>
        <p className="text-slate-600 font-medium">{session.objective}</p>
        <p className="text-slate-400 font-semibold">
          Requested by {session.task.requestedBy}
          {session.task.domain ? ` · ${session.task.domain}` : ''}
          {session.task.sourceTaskEngineId ? ` · Task ${session.task.sourceTaskEngineId}` : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F46E5]" />
            Participating Agents
          </h3>
          <div className="space-y-2">
            {session.participants.map((p) => (
              <div key={p.agentId} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-slate-900">
                    #{p.order} {p.agentName}
                  </p>
                  <span className="text-[10px] font-extrabold uppercase text-slate-500">{p.status}</span>
                </div>
                <p className="text-slate-500 font-semibold mt-0.5">{p.agentRole}</p>
                <p className="text-slate-400 font-medium mt-1">
                  {p.capabilities.slice(0, 3).join(' · ') || 'General'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#4F46E5]" />
            Shared Context
          </h3>
          {!ctx ? (
            <p className="text-slate-500 font-semibold">Context not built yet.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                  <Globe2 className="w-3 h-3" />
                  {ctx.domain || 'no domain'}
                </span>
                <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-600 border border-slate-100">
                  Memory {ctx.sourceNotes.memoryLoaded}
                </span>
                <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-600 border border-slate-100">
                  WI {ctx.sourceNotes.websiteIntelligenceLoaded ? 'yes' : 'no'}
                </span>
                <span className="px-2 py-1 rounded-full text-[10px] font-extrabold bg-slate-50 text-slate-600 border border-slate-100">
                  Tasks {ctx.sourceNotes.tasksLoaded}
                </span>
              </div>
              <p className="text-slate-700 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                {ctx.websiteSummary || ctx.objective}
              </p>
              {ctx.memorySnippets.length > 0 && (
                <div className="space-y-1">
                  <p className="font-extrabold text-slate-800">Memory snippets (shared once)</p>
                  {ctx.memorySnippets.slice(0, 4).map((m) => (
                    <p key={m.id} className="text-slate-500 font-medium">
                      • {m.title}: {m.snippet.slice(0, 100)}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <AgentConversation messages={messages} />
        </div>
        <div className="lg:col-span-6">
          <ContributionTimeline contributions={contributions} />
        </div>
      </div>

      <ConsensusCard consensus={consensus} conflicts={conflicts} report={session.finalReport} />
    </div>
  );
};
