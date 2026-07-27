export type TaskLifecycleStatus =
  | 'draft'
  | 'created'
  | 'waiting_assignment'
  | 'assigned'
  | 'queued'
  | 'running'
  | 'waiting_approval'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'paused';

export type TaskStatus = TaskLifecycleStatus;
