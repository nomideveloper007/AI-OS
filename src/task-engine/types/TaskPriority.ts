export type TaskPriority = 'critical' | 'high' | 'medium' | 'low' | 'support';

export const TASK_PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  critical: 100,
  high: 80,
  medium: 50,
  low: 25,
  support: 10,
};
