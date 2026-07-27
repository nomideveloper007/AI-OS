export interface ConsensusVote {
  agentId: string;
  agentName: string;
  position: string;
  confidence: number;
  weight: number;
}

export interface Consensus {
  id: string;
  sessionId: string;
  topic: string;
  votes: ConsensusVote[];
  winningPosition: string;
  confidenceScore: number;
  dissent: string[];
  rationale: string;
  createdAt: string;
}
