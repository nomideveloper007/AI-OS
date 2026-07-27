import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CollaborationEngine } from '../core/CollaborationEngine';
import { AgentManager } from '../../agents/core/AgentManager';
import type { CollaborationSession, CollaborationSessionBundle } from '../types/CollaborationSession';
import { SessionView } from './SessionView';
import {
  Network,
  Play,
  RefreshCw,
  Users,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export const CollaborationView: React.FC = () => {
  const { websites, selectedWebsiteId, showToast } = useApp();
  const engine = useMemo(() => CollaborationEngine.getInstance(), []);
  const agentManager = useMemo(() => AgentManager.getInstance(), []);

  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [bundle, setBundle] = useState<CollaborationSessionBundle | null>(null);
  const [busy, setBusy] = useState(false);
  const [objective, setObjective] = useState('Increase organic traffic');
  const [title, setTitle] = useState('Organic Growth Collaboration');

  const domain =
    websites.find((w) => w.id === selectedWebsiteId)?.domain ||
    websites[0]?.domain ||
    'tasktomoney.com';

  const registryAgents = agentManager.listAgents();

  const refresh = useCallback(() => {
    const list = engine.listSessions();
    setSessions(list);
    if (selectedId) {
      setBundle(engine.getBundle(selectedId) || null);
    }
  }, [engine, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startCollaboration = async () => {
    setBusy(true);
    showToast('Starting multi-agent collaboration — calling AI Engine for each employee…');
    try {
      const session = await engine.startCollaboration({
        title,
        objective,
        domain,
        requestedBy: 'CEO / Operator',
        priority: 'high',
      });
      if (session.status === 'failed') {
        throw new Error(session.errorMessage || 'Collaboration session failed');
      }
      setSelectedId(session.id);
      setBundle(engine.getBundle(session.id) || null);
      refresh();
      showToast(
        `Collaboration completed (${session.participants.length} AI employee calls). Final report ready.`
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Collaboration failed');
    } finally {
      setBusy(false);
    }
  };

  if (selectedId && bundle) {
    return (
      <SessionView
        bundle={bundle}
        onBack={() => {
          setSelectedId(null);
          setBundle(null);
          refresh();
        }}
      />
    );
  }

  const active = sessions.filter(
    (s) => s.status !== 'completed' && s.status !== 'failed' && s.status !== 'cancelled'
  );
  const completed = sessions.filter((s) => s.status === 'completed');

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">Multi-Agent Collaboration</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Engine Coordinates · Employees Call AI
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Each employee contribution calls AI Engine (OmniRoute). Shared context is built once; results are
              merged into one executive report.
            </p>
          </div>
        </div>

        <button
          onClick={refresh}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer flex items-center gap-2 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            Start Collaboration
          </h3>
          <div className="space-y-3">
            <div>
              <label className="font-extrabold text-slate-600 text-[10px] uppercase">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="font-extrabold text-slate-600 text-[10px] uppercase">CEO / Business Goal</label>
              <textarea
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={3}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
              />
            </div>
            <p className="text-slate-500 font-semibold">Domain: {domain}</p>
            <button
              onClick={startCollaboration}
              disabled={busy || !objective.trim()}
              className="w-full px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
              {busy ? 'Calling AI for each agent…' : 'Run Multi-Agent Collaboration'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4F46E5]" />
            Agent Registry ({registryAgents.length}) — auto-eligible
          </h3>
          <p className="text-slate-500 font-medium">
            Agents are read from Agent Registry. Future employees participate automatically by role /
            capability match — no hardcoded IDs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {registryAgents.map((a) => (
              <div key={a.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="font-extrabold text-slate-900">{a.name}</p>
                <p className="text-slate-500 font-semibold">{String(a.role)}</p>
                <p className="text-slate-400 font-medium mt-1 truncate">
                  {a.capabilities.map(String).slice(0, 3).join(' · ')}
                </p>
              </div>
            ))}
            {registryAgents.length === 0 && (
              <p className="text-slate-500 font-semibold col-span-2">No agents registered yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Active Sessions ({active.length})
          </h3>
          {active.length === 0 ? (
            <p className="text-slate-500 font-semibold">No active sessions.</p>
          ) : (
            active.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id);
                  setBundle(engine.getBundle(s.id) || null);
                }}
                className="w-full text-left p-3 rounded-xl bg-amber-50/50 border border-amber-100 hover:border-amber-200 cursor-pointer"
              >
                <p className="font-extrabold text-slate-900">{s.title}</p>
                <p className="text-slate-500 font-medium">{s.objective}</p>
                <p className="text-[10px] font-extrabold uppercase text-amber-700 mt-1">{s.status}</p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Completed Sessions ({completed.length})
          </h3>
          {completed.length === 0 ? (
            <p className="text-slate-500 font-semibold">No completed collaborations yet.</p>
          ) : (
            completed.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedId(s.id);
                  setBundle(engine.getBundle(s.id) || null);
                }}
                className="w-full text-left p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 hover:border-emerald-200 cursor-pointer"
              >
                <p className="font-extrabold text-slate-900">{s.title}</p>
                <p className="text-slate-500 font-medium line-clamp-2">
                  {s.finalReport?.executiveSummary || s.objective}
                </p>
                <p className="text-[10px] font-extrabold text-emerald-700 mt-1">
                  {s.participants.length} agents · confidence{' '}
                  {s.finalReport?.confidenceScore ?? '—'}%
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
