import React, { useCallback, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskEngine } from '../core/TaskEngine';
import type { Task } from '../types/Task';
import type { TaskCategory } from '../types/TaskCategory';
import type { TaskPriority } from '../types/TaskPriority';
import { TASK_CATEGORIES } from '../types/TaskCategory';
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
} from 'lucide-react';

export const TaskBoard: React.FC = () => {
  const { websites } = useApp();
  const engine = useMemo(() => TaskEngine.getInstance(), []);

  const [tasks, setTasks] = useState<Task[]>(() => engine.listTasks());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState('Improve Meta Title');
  const [description, setDescription] = useState('Rewrite homepage meta title for SEO clarity.');
  const [category, setCategory] = useState<TaskCategory>('SEO');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [websiteDomain, setWebsiteDomain] = useState(websites[0]?.domain || 'tasktomoney.com');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [dependsOn, setDependsOn] = useState('');

  const refresh = useCallback(() => {
    setTasks(engine.listTasks());
  }, [engine]);

  const metrics = useMemo(() => engine.getMetrics(), [tasks, engine]);
  const queue = useMemo(() => engine.getQueue(), [tasks, engine]);
  const agents = useMemo(() => engine.getRoutableAgents(), [engine, tasks]);
  const selected = tasks.find((t) => t.id === selectedId) || null;
  const timeline = selectedId ? engine.getTimeline(selectedId) : engine.getEvents().slice(0, 30).map((e) => ({
    id: e.id,
    kind: 'event',
    timestamp: e.timestamp,
    title: e.type.replace(/_/g, ' '),
    detail: e.message,
  }));

  const running = tasks.filter((t) => t.status === 'running');
  const completed = tasks.filter((t) => t.status === 'completed');
  const failed = tasks.filter((t) => t.status === 'failed');

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
          : 'No runnable tasks (check queue / dependencies / concurrency).'
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
      await engine.processQueue();
      setMessage('Demo pipeline seeded (Scan → Analyze → Report) + FAQ content task.');
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
    <div className="space-y-6 animate-fade-in">
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Network className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900">Task Engine</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dispatcher Active
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Routes CEO tasks to AI employees via Agent Registry. Tracks queue, priority, dependencies, and execution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSeedDemo}
            disabled={busy}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer disabled:opacity-50"
          >
            Seed Demo Pipeline
          </button>
          <button
            type="button"
            onClick={handleProcessQueue}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {busy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            Process Queue
          </button>
        </div>
      </div>

      {message && (
        <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800">
          {message}
        </div>
      )}

      <TaskMetricsCard metrics={metrics} />

      {/* Create task */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <Plus className="w-4 h-4 text-[#4F46E5]" />
          <h3 className="font-extrabold text-slate-900 text-sm">Create Task</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
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
        <div className="flex flex-wrap items-center gap-4 text-xs">
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
            placeholder="Dependencies (comma-separated task IDs)"
            className="flex-1 min-w-[220px] px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-700 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <TaskQueueView queue={queue} selectedId={selectedId || undefined} onSelect={setSelectedId} />
          <AgentAssignments metrics={metrics} agents={agents} />
        </div>

        <div className="lg:col-span-8 space-y-6">
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

          {/* Status boards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Running', list: running, color: 'text-indigo-700' },
              { title: 'Completed', list: completed, color: 'text-emerald-700' },
              { title: 'Failed', list: failed, color: 'text-rose-700' },
            ].map((col) => (
              <div key={col.title} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                <h4 className={`text-xs font-extrabold ${col.color}`}>{col.title} ({col.list.length})</h4>
                {col.list.length === 0 ? (
                  <p className="text-[11px] text-slate-400 font-medium">None</p>
                ) : (
                  col.list.slice(0, 6).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedId(t.id)}
                      className="w-full text-left p-2 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer truncate"
                    >
                      {t.title}
                    </button>
                  ))
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
