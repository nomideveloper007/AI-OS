import type { TaskExecutionRecord, TaskLogEntry } from './Task';
import type { TaskStatus } from './TaskStatus';

export type { TaskExecutionRecord, TaskLogEntry };

export interface TaskExecutionState {
  taskId: string;
  status: TaskStatus;
  execution?: TaskExecutionRecord;
  progressPercent: number;
}
