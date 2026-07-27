export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ConflictStatus = 'open' | 'resolved' | 'deferred';

export interface ConflictOpinion {
  agentId: string;
  agentName: string;
  position: string;
  confidence: number;
  contributionId?: string;
}

export interface Conflict {
  id: string;
  sessionId: string;
  topic: string;
  description: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  opinions: ConflictOpinion[];
  resolution?: string;
  recommendedPosition?: string;
  confidenceScore?: number;
  createdAt: string;
  resolvedAt?: string;
}
