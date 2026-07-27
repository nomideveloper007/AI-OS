import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Play,
  RefreshCw,
  Server,
  Sparkles,
} from 'lucide-react';
import { AgentRuntime } from '../core/AgentRuntime';
import type { RuntimeAgent } from '../types/Agent';
import type { AgentExecution } from '../types/AgentExecution';
import type { AgentRuntimeMetricsSnapshot } from '../core/AgentMetrics';
import type { AgentRuntimeEvent } from '../core/AgentEvents';
import type { AgentRuntimeLogEntry } from '../core/AgentLogger';
import type { AgentHealthSnapshot } from '../types/AgentHealthStatus';
import { AgentStatusCard } from './AgentStatusCard';
import { AgentHealthCard } from './AgentHealthCard';
import { AgentExecutionPanel } from './AgentExecutionPanel';
import { AgentTimeline } from './AgentTimeline';
import { AgentLogs } from './AgentLogs';

export const AgentRuntimeView: React.FC = () => {
  const runtime = useMemo(() => AgentRuntime.getInstance(), []);
  const [agents, setAgents] = useState<RuntimeAgent[]>([]);
  const [metrics, setMetrics] = useState<AgentRuntimeMetricsSnapshot | null>(null);
  const [executions, setExecutions] = useState<AgentExecution[]>([]);
  const [events, setEvents] = useState<AgentRuntimeEvent[]>([]);
  const [logs, setLogs] = useState<AgentRuntimeLogEntry[]>([]);
  const [healthItems, setHealthItems] = useState<
    Array<{ agent: RuntimeAgent; health: AgentHealthSnapshot }>
  >([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [selectedExecId, setSelectedExecId] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const refresh = useCallback(() => {
    const list = runtime.listAgents();
    setAgents(list);
    setMetrics(runtime.getMetrics());
    setExecutions(runtime.getExecutions());
    setEvents(runtime.getEvents());
    setLogs(runtime.getLogs());
    setHealthItems(runtime.getHealth() as Array<{ agent: RuntimeAgent; health: AgentHealthSnapshot }>);
    if (!selectedAgentId && list[0]) setSelectedAgentId(list[0].id);
  }, [runtime, selectedAgentId]);

  useEffect(() => {
    runtime.bootstrap();
    refresh();
    const unsub = runtime.subscribe(() => refresh());
    const timer = setInterval(refresh, 2000);
    return () => {
      unsub();
      clearInterval(timer);
    };
  }, [runtime, refresh]);

  const wrap = async (fn: () => Promise<unknown>, okMsg?: string) => {
    setBusy(true);
    setMessage('');
    try {
      await fn();
      if (okMsg) setMessage(okMsg);
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const running = agents.filter((a) => a.status === 'Busy' || a.status === 'Starting');
  const idle = agents.filter((a) => a.status === 'Idle' || a.status === 'Waiting');
  const selectedExec = executions.find((e) => e.id === selectedExecId) || executions[0];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0">
            <Server className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold text-slate-900">Agent Runtime</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                OS Layer Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Start · stop · heartbeat · execute · recover AI employees
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              wrap(() => runtime.startAll(), `Started ${agents.length} runtime workers`)
            }
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            Start All
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              wrap(async () => {
                const result = await runtime.seedDemo();
                setMessage(
                  `Demo complete — ${result.executions} executions on ${result.agents} agents`
                );
              })
            }
            className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Seed Demo
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => wrap(() => runtime.processQueue(), 'Queue processed')}
            className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {busy ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Process Queue
          </button>
        </div>
      </div>

      {message ? (
        <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800">
          {message}
        </div>
      ) : null}

      {/* Metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Online', value: metrics?.online ?? 0, color: 'text-emerald-700' },
          { label: 'Running', value: metrics?.running ?? 0, color: 'text-indigo-700' },
          { label: 'Idle', value: metrics?.idle ?? 0, color: 'text-slate-700' },
          { label: 'Completed', value: metrics?.completedTasks ?? 0, color: 'text-teal-700' },
          { label: 'Failed', value: metrics?.failedTasks ?? 0, color: 'text-rose-700' },
          {
            label: 'Success %',
            value: metrics?.successRate ?? 100,
            color: 'text-indigo-700',
          },
        ].map((m) => (
          <div
            key={m.label}
            className="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{m.label}</p>
            <p className={`text-xl font-extrabold mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Running Agents ({running.length})
              </h3>
            </div>
            {running.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-3 text-center">None running</p>
            ) : (
              <div className="space-y-2">
                {running.map((a) => (
                  <AgentStatusCard
                    key={a.id}
                    agent={a}
                    selected={selectedAgentId === a.id}
                    onSelect={setSelectedAgentId}
                    busy={busy}
                    onStart={(id) => wrap(() => runtime.startAgent(id))}
                    onStop={(id) => wrap(() => runtime.stopAgent(id))}
                    onPause={(id) => wrap(() => runtime.pauseAgent(id))}
                    onResume={(id) => wrap(() => runtime.resumeAgent(id))}
                    onRestart={(id) => wrap(() => runtime.restartAgent(id))}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Idle Agents ({idle.length})
              </h3>
              <span className="text-[10px] font-bold text-slate-400">{agents.length} total</span>
            </div>
            {idle.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-3 text-center">
                No idle agents — Start All or wait for recovery
              </p>
            ) : (
              <div className="space-y-2">
                {idle.map((a) => (
                  <AgentStatusCard
                    key={a.id}
                    agent={a}
                    selected={selectedAgentId === a.id}
                    onSelect={setSelectedAgentId}
                    busy={busy}
                    onStart={(id) => wrap(() => runtime.startAgent(id))}
                    onStop={(id) => wrap(() => runtime.stopAgent(id))}
                    onPause={(id) => wrap(() => runtime.pauseAgent(id))}
                    onResume={(id) => wrap(() => runtime.resumeAgent(id))}
                    onRestart={(id) => wrap(() => runtime.restartAgent(id))}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Offline / other */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Fleet</h3>
            </div>
            <div className="space-y-2">
              {agents
                .filter((a) => !running.includes(a) && !idle.includes(a))
                .map((a) => (
                  <AgentStatusCard
                    key={a.id}
                    agent={a}
                    selected={selectedAgentId === a.id}
                    onSelect={setSelectedAgentId}
                    busy={busy}
                    onStart={(id) => wrap(() => runtime.startAgent(id))}
                    onStop={(id) => wrap(() => runtime.stopAgent(id))}
                    onPause={(id) => wrap(() => runtime.pauseAgent(id))}
                    onResume={(id) => wrap(() => runtime.resumeAgent(id))}
                    onRestart={(id) => wrap(() => runtime.restartAgent(id))}
                  />
                ))}
              {agents.filter((a) => !running.includes(a) && !idle.includes(a)).length === 0 ? (
                <p className="text-xs text-slate-400 font-medium py-2 text-center">
                  All agents online
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 space-y-4">
          <AgentHealthCard items={healthItems} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AgentExecutionPanel
              executions={executions}
              selectedId={selectedExec?.id}
              onSelect={setSelectedExecId}
            />
            <AgentTimeline events={events} />
          </div>

          {/* Execution detail */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Execution Detail
            </h3>
            {!selectedExec ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">
                Select an execution to inspect prompt, response, and tokens.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                <p className="font-extrabold text-slate-900">{selectedExec.taskTitle}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {selectedExec.agentName} · {selectedExec.status} · {selectedExec.progress}%
                  {selectedExec.notifiedTaskEngine ? ' · Task Engine notified' : ''}
                </p>
                {selectedExec.promptSent ? (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">PROMPT SENT</p>
                    <p className="text-[11px] text-slate-700 font-medium whitespace-pre-wrap line-clamp-6">
                      {selectedExec.promptSent}
                    </p>
                  </div>
                ) : null}
                {selectedExec.responseReceived ? (
                  <div className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-400 mb-1">RESPONSE RECEIVED</p>
                    <p className="text-[11px] text-slate-800 font-medium whitespace-pre-wrap line-clamp-8">
                      {selectedExec.responseReceived}
                    </p>
                  </div>
                ) : null}
                {selectedExec.errorMessage ? (
                  <p className="text-rose-700 font-semibold">{selectedExec.errorMessage}</p>
                ) : null}
              </div>
            )}
          </div>

          <AgentLogs logs={logs} />

          {/* Utilization */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Metrics · Agent Utilization
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(metrics?.agentUtilization || []).map((u) => (
                <div
                  key={u.agentId}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-extrabold text-slate-900 truncate">{u.agentName}</p>
                    <span className="text-[10px] font-bold text-indigo-700">{u.utilizationPct}%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    {u.status} · Done {u.completed} · Fail {u.failed} · Queue {u.queueLength}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4F46E5]"
                      style={{ width: `${Math.min(100, u.utilizationPct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {metrics ? (
              <p className="text-[10px] text-slate-400 font-medium">
                Avg duration {metrics.averageDurationMs}ms · Pending queue{' '}
                {runtime.getPendingCount()}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
