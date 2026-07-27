export type CollaborationTaskStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'aggregating'
  | 'resolved'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type CollaborationPriority = 'critical' | 'high' | 'medium' | 'low';

/**
 * Objective handed to the Collaboration Engine (often from CEO / Task Engine).
 * The engine coordinates employees — it does not perform AI reasoning.
 */
export interface CollaborationTask {
  id: string;
  title: string;
  objective: string;
  priority: CollaborationPriority;
  domain?: string;
  websiteId?: string;
  requestedBy: string;
  sourceTaskEngineId?: string;
  requiredCapabilities?: string[];
  preferredRoles?: string[];
  status: CollaborationTaskStatus;
  createdAt: string;
  updatedAt: string;
}
