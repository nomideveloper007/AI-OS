import type { CreateTaskInput, Task } from '../types/Task';
import type { TaskCategory } from '../types/TaskCategory';
import type { TaskPriority } from '../types/TaskPriority';
import { TaskRepository } from '../repositories/TaskRepository';
import { ExecutionRepository } from '../repositories/ExecutionRepository';
import { QueueRepository } from '../repositories/QueueRepository';
import { TaskRouter } from './TaskRouter';
import { TaskQueue } from './TaskQueue';
import { TaskScheduler } from './TaskScheduler';
import { TaskExecutor } from './TaskExecutor';
import { TaskMonitor } from './TaskMonitor';
import { TaskValidator } from './TaskValidator';
import { TaskLifecycle } from './TaskLifecycle';
import { TaskEvents } from './TaskEvents';
import { TaskLogger } from './TaskLogger';
import { TaskMetrics } from './TaskMetrics';

/**
 * Routes, tracks, prioritizes, and monitors tasks.
 * Never performs domain work itself — agents do via TaskExecutor → Agent Registry.
 */
export class TaskDispatcher {
  private tasks = TaskRepository.getInstance();
  private executions = ExecutionRepository.getInstance();
  private queueRepo = QueueRepository.getInstance();
  private router = new TaskRouter();
  private queue = new TaskQueue();
  private scheduler = new TaskScheduler();
  private executor = new TaskExecutor();
  private monitor = new TaskMonitor();
  private events = TaskEvents.getInstance();
  private logger = TaskLogger.getInstance();
  private maxConcurrent = 2;
  private processing = false;

  constructor() {
    this.rebuildQueueFromStore();
  }

  public createTask(input: CreateTaskInput): Task {
    TaskValidator.assertCreate(input);
    const now = new Date().toISOString();
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: input.title.trim(),
      description: (input.description || '').trim(),
      priority: (input.priority || 'medium') as TaskPriority,
      category: (input.category || this.inferCategory(input.title, input.description || '')) as TaskCategory,
      websiteId: input.websiteId,
      websiteDomain: input.websiteDomain,
      requestedBy: input.requestedBy || 'CEO Agent',
      assignedAgentId: input.assignedAgentId,
      status: 'created',
      dependencies: input.dependencies || [],
      estimatedDurationMs: input.estimatedDurationMs ?? 1200,
      retryCount: 0,
      maxRetries: 2,
      approvalRequired: input.approvalRequired ?? false,
      executionHistory: [],
      logs: [],
      createdAt: now,
      updatedAt: now,
      payload: input.payload,
    };

    this.appendTaskLog(task, 'info', 'Task created');
    this.tasks.save(task);
    this.events.emit('task_created', task.id, `Created: ${task.title}`);

    // Move into assignment pipeline
    return this.assignTask(task.id);
  }

  public assignTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    TaskLifecycle.assertTransition(task.status, 'waiting_assignment');
    task.status = 'waiting_assignment';
    task.updatedAt = new Date().toISOString();

    const assignment = task.assignedAgentId
      ? {
          taskId: task.id,
          agentId: task.assignedAgentId,
          agentName: task.assignedAgentName || task.assignedAgentId,
          agentRole: 'preassigned',
          reason: 'Explicit agent assignment provided',
          assignedAt: new Date().toISOString(),
          category: task.category,
          priority: task.priority,
        }
      : this.router.route(task);

    TaskLifecycle.assertTransition(task.status, 'assigned');
    task.status = 'assigned';
    task.assignedAgentId = assignment.agentId;
    task.assignedAgentName = assignment.agentName;
    task.updatedAt = new Date().toISOString();
    this.appendTaskLog(task, 'info', `Assigned to ${assignment.agentName}: ${assignment.reason}`);
    this.tasks.save(task);
    this.events.emit('task_assigned', task.id, `Assigned to ${assignment.agentName}`, {
      agentId: assignment.agentId,
      agentName: assignment.agentName,
      metadata: { reason: assignment.reason },
    });

    return this.enqueueTask(task.id);
  }

  public enqueueTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    const all = this.tasks.listAll();

    if (!TaskValidator.dependenciesSatisfied(task, all)) {
      this.appendTaskLog(task, 'info', 'Dependencies not satisfied — held in assigned state');
      this.tasks.save(task);
      return task;
    }

    TaskLifecycle.assertTransition(task.status, 'queued');
    task.status = 'queued';
    task.queuedAt = new Date().toISOString();
    task.updatedAt = task.queuedAt;
    this.queue.enqueue(task);
    this.queueRepo.syncFromTasks(this.tasks.listAll());
    this.appendTaskLog(task, 'info', 'Enqueued');
    this.tasks.save(task);
    this.events.emit('task_queued', task.id, `Queued (${task.priority})`);
    return task;
  }

  public async dispatchNext(): Promise<Task | null> {
    if (this.processing) return null;
    const running = this.tasks.listByStatus('running').length;
    const next = this.scheduler.nextRunnable(this.queue, running, this.maxConcurrent);
    if (!next) return null;

    this.processing = true;
    try {
      this.queue.dequeue();
      return await this.startTask(next.id);
    } finally {
      this.processing = false;
    }
  }

  public async dispatchAllReady(): Promise<Task[]> {
    // Promote assigned → queued when deps complete
    for (const task of this.scheduler.scheduleReady(this.tasks.listAll(), this.queue)) {
      this.enqueueTask(task.id);
    }

    const started: Task[] = [];
    while (true) {
      const t = await this.dispatchNext();
      if (!t) break;
      started.push(t);
    }
    return started;
  }

  public async startTask(taskId: string): Promise<Task> {
    const task = this.requireTask(taskId);
    TaskLifecycle.assertTransition(task.status, 'running');
    task.status = 'running';
    task.startedAt = new Date().toISOString();
    task.updatedAt = task.startedAt;
    this.tasks.save(task);

    try {
      const { task: updated, execution } = await this.executor.execute(task);
      this.executions.save(execution);

      if (updated.approvalRequired) {
        TaskLifecycle.assertTransition('running', 'waiting_approval');
        updated.status = 'waiting_approval';
        updated.updatedAt = new Date().toISOString();
        this.appendTaskLog(updated, 'info', 'Waiting approval');
        this.events.emit('approval_requested', updated.id, 'Approval requested');
        this.tasks.save(updated);
        return updated;
      }

      return this.completeTask(updated.id);
    } catch (err) {
      return this.failTask(taskId, err instanceof Error ? err.message : String(err));
    }
  }

  public completeTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    const from = task.status;
    TaskLifecycle.assertTransition(from === 'waiting_approval' ? 'waiting_approval' : 'running', 'completed');
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    task.updatedAt = task.completedAt;
    this.appendTaskLog(task, 'info', 'Task completed');
    this.tasks.save(task);
    this.events.emit('task_finished', task.id, 'Task completed');
    // Unlock dependents
    void this.dispatchAllReady();
    return task;
  }

  public approveTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    TaskLifecycle.assertTransition(task.status, 'completed');
    this.events.emit('approval_granted', task.id, 'Approval granted');
    return this.completeTask(taskId);
  }

  public failTask(taskId: string, reason: string): Task {
    const task = this.requireTask(taskId);
    TaskLifecycle.assertTransition(task.status === 'queued' ? 'queued' : 'running', 'failed');
    task.status = 'failed';
    task.updatedAt = new Date().toISOString();
    this.appendTaskLog(task, 'error', reason);
    this.tasks.save(task);
    this.events.emit('task_failed', task.id, reason);
    return task;
  }

  public cancelTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    if (TaskLifecycle.isTerminal(task.status)) return task;
    TaskLifecycle.assertTransition(task.status, 'cancelled');
    this.queue.remove(taskId);
    task.status = 'cancelled';
    task.updatedAt = new Date().toISOString();
    this.appendTaskLog(task, 'warn', 'Task cancelled');
    this.tasks.save(task);
    this.queueRepo.syncFromTasks(this.tasks.listAll());
    this.events.emit('task_cancelled', task.id, 'Task cancelled');
    return task;
  }

  public pauseTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    TaskLifecycle.assertTransition(task.status, 'paused');
    this.queue.remove(taskId);
    task.status = 'paused';
    task.updatedAt = new Date().toISOString();
    this.appendTaskLog(task, 'warn', 'Task paused');
    this.tasks.save(task);
    this.queueRepo.syncFromTasks(this.tasks.listAll());
    this.events.emit('task_paused', task.id, 'Task paused');
    return task;
  }

  public resumeTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    TaskLifecycle.assertTransition(task.status, 'queued');
    task.status = 'assigned';
    task.updatedAt = new Date().toISOString();
    this.tasks.save(task);
    this.events.emit('task_resumed', task.id, 'Task resumed');
    return this.enqueueTask(taskId);
  }

  public retryTask(taskId: string): Task {
    const task = this.requireTask(taskId);
    if (task.status !== 'failed') {
      throw new Error('Only failed tasks can be retried.');
    }
    if (task.retryCount >= task.maxRetries) {
      throw new Error('Max retries exceeded.');
    }
    task.retryCount += 1;
    task.status = 'assigned';
    task.updatedAt = new Date().toISOString();
    this.appendTaskLog(task, 'info', `Retry #${task.retryCount}`);
    this.tasks.save(task);
    this.events.emit('task_retried', task.id, `Retry #${task.retryCount}`);
    return this.enqueueTask(taskId);
  }

  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  public listTasks(): Task[] {
    return this.tasks.listAll();
  }

  public getQueue(): Task[] {
    return this.queue.list();
  }

  public getMetrics() {
    return TaskMetrics.compute(this.tasks.listAll());
  }

  public getMonitor(): TaskMonitor {
    return this.monitor;
  }

  public getRouter(): TaskRouter {
    return this.router;
  }

  public getEvents() {
    return this.events;
  }

  private requireTask(taskId: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    return task;
  }

  private appendTaskLog(task: Task, level: 'info' | 'warn' | 'error' | 'debug', message: string): void {
    task.logs.unshift({
      id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      agentId: task.assignedAgentId,
      agentName: task.assignedAgentName,
    });
    this.logger.info(message, 'TaskDispatcher', task.id);
  }

  private rebuildQueueFromStore(): void {
    const queued = this.tasks.listByStatus('queued');
    this.queue.rebalance(queued);
  }

  private inferCategory(title: string, description: string): TaskCategory {
    const text = `${title} ${description}`.toLowerCase();
    if (/seo|meta|sitemap|canonical|keyword/.test(text)) return 'SEO';
    if (/faq|blog|content|write|article/.test(text)) return 'Content';
    if (/security|https|csp|ssl|vulnerability/.test(text)) return 'Security';
    if (/performance|speed|bundle|load time/.test(text)) return 'Performance';
    if (/growth|conversion|funnel/.test(text)) return 'Growth';
    if (/marketing|campaign|social/.test(text)) return 'Marketing';
    if (/analytics|traffic|metric/.test(text)) return 'Analytics';
    if (/website|scan|broken link|domain/.test(text)) return 'Website';
    if (/support|helpdesk/.test(text)) return 'Support';
    if (/code|develop|api|bug/.test(text)) return 'Development';
    if (/business|strategy|revenue/.test(text)) return 'Business';
    return 'General';
  }
}
