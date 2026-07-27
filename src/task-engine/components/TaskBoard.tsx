import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskEngine } from '../core/TaskEngine';
import type { Task } from '../types/Task';
import type { TaskCategory } from '../types/TaskCategory';
import type { TaskPriority } from '../types/TaskPriority';
import { TASK_CATEGORIES } from '../types/TaskCategory';
import { TaskLifecycle } from '../core/TaskLifecycle';
import { TaskMetricsCard } from './TaskMetricsCard';
import { TaskQueueView } from './TaskQueueView';
import { AgentAssignments } from './AgentAssignments';
import { TaskDetailsView } from './TaskDetailsView';
import { TaskExecutionTimeline } from './TaskExecutionTimeline';
import {
  Network,
  Play,
  Plus,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const TaskBoard: React.FC = () => {
  const { websites } = useApp();
  const engine = useMemo(() => TaskEngine.getInstance(), []);

  const [tasks, setTasks] = useState<Task[]>(() => engine.listTasks());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState('Improve Meta Title');
  const [description, setDescription] = useState('Rewrite homepage meta title for SEO clarity.');
  const [category, setCategory] = useState<TaskCategory>('SEO');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [websiteDomain, setWebsiteDomain] = useState(websites[0]?.domain || 'tasktomoney.com');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [dependsOn, setDependsOn] = useState('');

  const refresh = useCallback(() => {
    const list = engine.listTasks();
    setTasks(list);
    setSelectedId((prev) => {
      if (prev && list.some((t) => t.id === prev)) return prev;
      return list[0]?.id ?? null;
    });
  }, [engine]);

  const metrics = useMemo(() => engine.getMetrics(), [tasks, engine]);
  const queue = useMemo(() => engine.getQueue(), [tasks, engine]);
  const agents = useMemo(() => engine.getRoutableAgents(), [engine, tasks]);
  const selected = tasks.find((t) => t.id === selectedId) || null;

  const timeline = selectedId
    ? engine.getTimeline(selectedId)
    : engine.getEvents().slice(0, 40).map((e) => ({
        id: e.id,
        kind: 'event' as const,
        timestamp: e.timestamp,
        title: e.type.replace(/_/g, ' '),
        detail: e.message,
      }));

  const running = tasks.filter((t) => t.status === 'running');
  const completed = tasks.filter((t) => t.status === 'completed');
  const failed = tasks.filter((t) => t.status === 'failed');
  const waiting = tasks.filter(
    (t) =>
      t.status === 'assigned' ||
      t.status === 'waiting_assignment' ||
      t.status === 'waiting_approval' ||
      t.status === 'paused'
  );

  const handleCreate = async () => {
    if (!title.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const task = engine.createTask({
        title,
        description,
        category,
        priority,
        websiteDomain,
        websiteId: websites.find((w) => w.domain === websiteDomain)?.id,
        requestedBy: 'CEO Agent',
        approvalRequired,
        dependencies: dependsOn
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setSelectedId(task.id);
      setMessage(`Created & assigned: ${task.title} → ${task.assignedAgentName}`);
      setShowCreate(false);
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setBusy(false);
    }
  };

  const handleProcessQueue = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const started = await engine.processQueue();
      setMessage(
        started.length
          ? `Dispatched ${started.length} task(s).`
          : queue.length === 0 && tasks.length > 0
            ? 'No runnable tasks right now (waiting on dependencies or already finished).'
            : 'Queue empty — create a task or seed the demo pipeline.'
      );
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Dispatch failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSeedDemo = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const scan = engine.createTask({
        title: 'Scan Website',
        description: 'Run website scanner for baseline health.',
        category: 'Website',
        priority: 'high',
        websiteDomain,
        requestedBy: 'CEO Agent',
      });
      const analyze = engine.createTask({
        title: 'Analyze Website',
        description: 'Structure scanner results into intelligence.',
        category: 'Website',
        priority: 'high',
        websiteDomain,
        requestedBy: 'CEO Agent',
        dependencies: [scan.id],
      });
      engine.createTask({
        title: 'Generate Report',
        description: 'Compile executive report from analysis.',
        category: 'Analytics',
        priority: 'medium',
        websiteDomain,
        requestedBy: 'CEO Agent',
        dependencies: [analyze.id],
        approvalRequired: true,
      });
      engine.createTask({
        title: 'Write FAQ',
        description: 'Draft FAQ page content for trust and SEO.',
        category: 'Content',
        priority: 'medium',
        websiteDomain,
        requestedBy: 'CEO Agent',
      });
      const started = await engine.processQueue();
      setMessage(
        `Demo pipeline ready. Dispatched ${started.length} task(s). Click tasks below to inspect.`
      );
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Seed failed');
    } finally {
      setBusy(false);
    }
  };

  const wrapAction = (fn: (id: string) => void) => (id: string) => {
    try {
      fn(id);
      refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Compact sticky header */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-16 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0">
            <Network className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold text-slate-900">Task Engine</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Dispatcher Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Route · prioritize · monitor AI employee work via Agent Registry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowCreate((v) => !v)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {showCreate ? 'Hide Form' : 'New Task'}
          </button>
          <button
            type="button"
            onClick={handleSeedDemo}
            disabled={busy}
            className="px-3 py-2 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Seed Demo
          </button>
          <button
            type="button"
            onClick={handleProcessQueue}
            disabled={busy}
            className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Process Queue
          </button>
        </div>
      </div>

      {message && (
        <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800">
          {message}
        </div>
      )}

      <TaskMetricsCard metrics={metrics} />

      {showCreate && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm">Create Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="lg:col-span-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
            >
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
            >
              {(['critical', 'high', 'medium', 'low', 'support'] as TaskPriority[]).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <input
              value={websiteDomain}
              onChange={(e) => setWebsiteDomain(e.target.value)}
              placeholder="Website domain"
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={busy || !title.trim()}
              className="px-3 py-2 rounded-xl bg-[#4F46E5] text-white font-bold hover:bg-[#4338CA] cursor-pointer disabled:opacity-50"
            >
              Create & Assign
            </button>
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none resize-none"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) => setApprovalRequired(e.target.checked)}
                className="accent-[#4F46E5]"
              />
              Approval required
            </label>
            <input
              value={dependsOn}
              onChange={(e) => setDependsOn(e.target.value)}
              placeholder="Dependencies (task IDs, comma-separated)"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-700 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Main board */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 space-y-4">
          <TaskQueueView
            queue={queue}
            selectedId={selectedId || undefined}
            onSelect={setSelectedId}
            onSeed={handleSeedDemo}
            busy={busy}
          />

          {/* All tasks — fixes “queue empty but work exists” confusion */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-sm">All Tasks</h3>
              <span className="text-[10px] font-bold text-slate-400">{tasks.length}</span>
            </div>
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3 py-4 text-center space-y-2">
                <p className="text-xs font-semibold text-slate-500">No tasks yet.</p>
                <button
                  type="button"
                  onClick={handleSeedDemo}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F46E5] text-white text-[11px] font-bold hover:bg-[#4338CA] cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Seed Demo Pipeline
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg border text-[11px] cursor-pointer ${
                      selectedId === t.id
                        ? 'bg-indigo-50 border-indigo-200'
                        : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-900 truncate">{t.title}</span>
                      <span className="text-[10px] font-bold text-slate-400 capitalize whitespace-nowrap">
                        {TaskLifecycle.label(t.status)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate">
                      {t.assignedAgentName || 'Unassigned'} · {t.category} · {t.priority}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          <AgentAssignments metrics={metrics} agents={agents} />
        </div>

        <div className="xl:col-span-8 space-y-4">
          <TaskDetailsView
            task={selected}
            onPause={wrapAction((id) => engine.pause(id))}
            onResume={wrapAction((id) => engine.resume(id))}
            onCancel={wrapAction((id) => engine.cancel(id))}
            onRetry={wrapAction((id) => {
              engine.retry(id);
              void engine.processQueue().then(refresh);
            })}
            onApprove={wrapAction((id) => engine.approve(id))}
          />

          <TaskExecutionTimeline items={timeline} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Running', list: running, color: 'text-indigo-700', empty: 'Nothing running' },
              { title: 'Waiting', list: waiting, color: 'text-amber-700', empty: 'Nothing waiting' },
              { title: 'Completed', list: completed, color: 'text-emerald-700', empty: 'No completions yet' },
              { title: 'Failed', list: failed, color: 'text-rose-700', empty: 'No failures' },
            ].map((col) => (
              <div key={col.title} className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 min-h-[120px]">
                <h4 className={`text-xs font-extrabold ${col.color}`}>
                  {col.title} ({col.list.length})
                </h4>
                {col.list.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium pt-2">{col.empty}</p>
                ) : (
                  <div className="space-y-1.5">
                    {col.list.slice(0, 5).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedId(t.id)}
                        className="w-full text-left p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer truncate"
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
