import type { Task, TaskExecutionRecord } from '../types/Task';
import type { TaskEvent } from './TaskEvents';

export class TaskHistory {
  public static getExecutionHistory(task: Task): TaskExecutionRecord[] {
    return [...task.executionHistory].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  public static flattenTimeline(task: Task, events: TaskEvent[]): Array<{
    id: string;
    kind: 'event' | 'execution' | 'log';
    timestamp: string;
    title: string;
    detail: string;
  }> {
    const items: Array<{
      id: string;
      kind: 'event' | 'execution' | 'log';
      timestamp: string;
      title: string;
      detail: string;
    }> = [];

    for (const e of events) {
      items.push({
        id: e.id,
        kind: 'event',
        timestamp: e.timestamp,
        title: e.type.replace(/_/g, ' '),
        detail: e.message,
      });
    }

    for (const ex of task.executionHistory) {
      items.push({
        id: ex.id,
        kind: 'execution',
        timestamp: ex.startedAt,
        title: ex.success ? 'execution success' : 'execution failed',
        detail: `${ex.agentName} · ${ex.durationMs ?? 0}ms · ${ex.result || ex.errorMessage || ''}`,
      });
    }

    for (const log of task.logs) {
      items.push({
        id: log.id,
        kind: 'log',
        timestamp: log.timestamp,
        title: log.level,
        detail: log.message,
      });
    }

    return items.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
