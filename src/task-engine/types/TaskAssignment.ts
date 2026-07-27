import type { TaskCategory } from './TaskCategory';
import type { TaskPriority } from './TaskPriority';

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  reason: string;
  assignedAt: string;
  category: TaskCategory;
  priority: TaskPriority;
}
