export type ContributionKind =
  | 'finding'
  | 'recommendation'
  | 'risk'
  | 'strategy'
  | 'status'
  | 'clarification';

export type ContributionStatus = 'pending' | 'submitted' | 'accepted' | 'superseded' | 'rejected';

export interface AgentContribution {
  id: string;
  sessionId: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  kind: ContributionKind;
  title: string;
  summary: string;
  details: string;
  confidence: number;
  evidenceRefs: string[];
  relatedMessageIds: string[];
  status: ContributionStatus;
  createdAt: string;
  updatedAt: string;
}
