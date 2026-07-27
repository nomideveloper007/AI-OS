import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MissionOrchestrator } from '../core/MissionOrchestrator';
import type { Mission } from '../types/Mission';
import { MissionProgressCard } from './MissionProgressCard';
import { MissionTimeline } from './MissionTimeline';
import { MissionHistory } from './MissionHistory';
import { MissionLogs } from './MissionLogs';
import {
  Rocket,
  Play,
  Pause,
  RotateCcw,
  Ban,
  RefreshCw,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const MissionControlView: React.FC = () => {
  const { websites, selectedWebsiteId, showToast } = useApp();
  const orchestrator = useMemo(() => MissionOrchestrator.getInstance(), []);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [goal, setGoal] = useState('Increase organic traffic by 50% in the next 6 months.');

  const website =
    websites.find((w) => w.id === selectedWebsiteId) || websites[0] || null;

  const refresh = useCallback(() => {
    const list = orchestrator.listMissions();
    setMissions(list);
    setSelectedId((prev) => {
      if (prev && list.some((m) => m.id === prev)) return prev;
      return list[0]?.id ?? null;
    });
  }, [orchestrator]);

  useEffect(() => {
    refresh();
    const unsub = orchestrator.subscribe(() => refresh());
    const timer = setInterval(refresh, 1500);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [orchestrator, refresh]);

  const selected = missions.find((m) => m.id === selectedId) || null;
  const running = missions.filter((m) => m.status === 'running' || m.status === 'paused');
  const completed = missions.filter((m) => m.status === 'completed');
  const metrics = orchestrator.getMetrics();
  const logs = orchestrator.getLogs(selectedId || undefined);
  const history = orchestrator.getHistory();

  const startAiCompany = async () => {
    if (!website) {
      showToast('Add a website first.');
      return;
    }
    setBusy(true);
    showToast('Starting AI Company mission…');
    try {
      const mission = await orchestrator.startAiCompany({
        title: `AI Company — ${website.domain}`,
        goal,
        website: {
          id: website.id,
          name: website.name,
          url: website.url,
          domain: website.domain,
          framework: website.framework,
          category: website.category,
          status: website.status,
          favorite: website.favorite,
          created_at: website.created_at,
          updated_at: website.updated_at,
        },
      });
      setSelectedId(mission.id);
      refresh();
      if (mission.status === 'failed') {
        showToast(mission.lastError || 'Mission failed');
      } else if (mission.status === 'paused') {
        showToast('Mission paused after a stage failure — state preserved. Resume when ready.');
      } else if (mission.status === 'completed') {
        showToast('AI Company mission completed. Memory & Reports updated.');
      } else {
        showToast(`Mission status: ${mission.status}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Mission failed');
    } finally {
      setBusy(false);
      refresh();
    }
  };

  const wrap = async (fn: () => Promise<unknown>, ok?: string) => {
    setBusy(true);
    try {
      await fn();
      if (ok) showToast(ok);
      refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">Mission Control</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Orchestrator Only
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              One button runs Scanner → Intelligence → CEO → Tasks → Collaboration → Runtime → Memory →
              Reports.
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: metrics.total },
          { label: 'Running', value: metrics.running },
          { label: 'Paused', value: metrics.paused },
          { label: 'Completed', value: metrics.completed },
          { label: 'Success %', value: `${metrics.successRate}%` },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[10px] font-extrabold text-slate-400 uppercase">{m.label}</p>
            <p className="text-lg font-extrabold text-slate-900 mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Rocket className="w-4 h-4 text-[#4F46E5]" />
            Start AI Company
          </h3>
          <p className="text-slate-500 font-semibold">
            Website:{' '}
            <span className="text-slate-800">{website ? `${website.name} (${website.domain})` : 'None'}</span>
          </p>
          <div>
            <label className="font-extrabold text-slate-600 text-[10px] uppercase">Business Goal</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              rows={3}
              className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold text-slate-800"
            />
          </div>
          <button
            onClick={startAiCompany}
            disabled={busy || !website || !goal.trim()}
            className="w-full px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
            {busy ? 'Running AI Company…' : 'Start AI Company'}
          </button>

          {selected && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              <button
                disabled={busy || selected.status !== 'running'}
                onClick={() => {
                  orchestrator.pauseMission(selected.id);
                  showToast('Pause requested');
                  refresh();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-100 font-bold cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
              <button
                disabled={busy || selected.status !== 'paused'}
                onClick={() => wrap(() => orchestrator.resumeMission(selected.id), 'Resumed')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-100 font-bold cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
              <button
                disabled={busy || selected.status === 'completed'}
                onClick={() => {
                  orchestrator.cancelMission(selected.id);
                  showToast('Cancel requested');
                  refresh();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-100 font-bold cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <Ban className="w-3.5 h-3.5" /> Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => wrap(() => orchestrator.restartMission(selected.id), 'Restarted')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-bold cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Running Missions ({running.length})
            </h3>
            {running.length === 0 ? (
              <p className="text-slate-500 font-semibold">No active missions.</p>
            ) : (
              running.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left p-3 rounded-xl border cursor-pointer ${
                    selectedId === m.id
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <p className="font-extrabold text-slate-900">{m.title}</p>
                  <p className="text-slate-500 font-medium">
                    {m.progress.currentStageLabel} · {m.progress.overallPercent}%
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Completed Missions ({completed.length})
            </h3>
            {completed.length === 0 ? (
              <p className="text-slate-500 font-semibold">No completed missions yet.</p>
            ) : (
              completed.slice(0, 6).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className="w-full text-left p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 cursor-pointer"
                >
                  <p className="font-extrabold text-slate-900">{m.title}</p>
                  <p className="text-slate-500 font-medium line-clamp-2">
                    {m.result?.executiveSummary || m.goal}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <MissionProgressCard mission={selected} />
            <MissionHistory entries={history} onSelect={(id) => setSelectedId(id)} />
          </div>
          <div className="lg:col-span-7 space-y-6">
            <MissionTimeline mission={selected} />
            <MissionLogs logs={logs} />
          </div>
        </div>
      )}
    </div>
  );
};
