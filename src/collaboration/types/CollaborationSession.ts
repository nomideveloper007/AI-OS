import type { CollaborationTask } from './CollaborationTask';
import type { AgentContribution } from './AgentContribution';
import type { AgentMessage } from './AgentMessage';
import type { SharedContext } from './SharedContext';
import type { Conflict } from './Conflict';
import type { Consensus } from './Consensus';

export type CollaborationSessionStatus =
  | 'created'
  | 'context_ready'
  | 'assigning'
  | 'collaborating'
  | 'resolving_conflicts'
  | 'aggregating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface CollaborationParticipant {
  agentId: string;
  agentName: string;
  agentRole: string;
  capabilities: string[];
  status: 'assigned' | 'working' | 'waiting' | 'completed' | 'blocked';
  order: number;
  contributionIds: string[];
}

export interface CollaborationFinalReport {
  id: string;
  sessionId: string;
  title: string;
  executiveSummary: string;
  objective: string;
  participatingAgents: string[];
  keyFindings: string[];
  recommendations: string[];
  risks: string[];
  consensusHighlights: string[];
  unresolvedConflicts: string[];
  confidenceScore: number;
  createdAt: string;
}

export interface CollaborationSession {
  id: string;
  title: string;
  objective: string;
  status: CollaborationSessionStatus;
  task: CollaborationTask;
  participants: CollaborationParticipant[];
  sharedContext?: SharedContext;
  contributionIds: string[];
  messageIds: string[];
  conflictIds: string[];
  consensusIds: string[];
  finalReport?: CollaborationFinalReport;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  errorMessage?: string;
}

/** Denormalized view for UI / persistence snapshots */
export interface CollaborationSessionBundle {
  session: CollaborationSession;
  contributions: AgentContribution[];
  messages: AgentMessage[];
  conflicts: Conflict[];
  consensus: Consensus[];
}
