import type { Conflict } from '../types/Conflict';
import type { Consensus, ConsensusVote } from '../types/Consensus';
import type { AgentContribution } from '../types/AgentContribution';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { CollaborationLogger } from './CollaborationLogger';
import { AgentMessenger } from './AgentMessenger';

/**
 * Builds consensus from contributions and resolved conflicts.
 */
export class ConsensusEngine {
  private repo = CollaborationRepository.getInstance();
  private logger = CollaborationLogger.getInstance();
  private messenger = new AgentMessenger();

  public buildFromConflict(conflict: Conflict): Consensus {
    const votes: ConsensusVote[] = conflict.opinions.map((o) => ({
      agentId: o.agentId,
      agentName: o.agentName,
      position: o.position,
      confidence: o.confidence,
      weight: o.confidence / 100,
    }));

    const ranked = [...votes].sort((a, b) => b.confidence * b.weight - a.confidence * a.weight);
    const winner = ranked[0];
    const confidenceScore = Math.round(
      votes.reduce((s, v) => s + v.confidence * v.weight, 0) /
        Math.max(
          0.01,
          votes.reduce((s, v) => s + v.weight, 0)
        )
    );

    const consensus: Consensus = {
      id: `consensus-${Date.now()}-${Math.random().toString(36).slice(2, 4)}`,
      sessionId: conflict.sessionId,
      topic: conflict.topic,
      votes,
      winningPosition:
        conflict.recommendedPosition || winner?.position || 'Proceed with balanced plan',
      confidenceScore,
      dissent: ranked.slice(1).map((v) => `${v.agentName}: ${v.position}`),
      rationale:
        conflict.resolution ||
        'Weighted by agent confidence; highest confidence opinion selected as recommendation.',
      createdAt: new Date().toISOString(),
    };

    this.repo.saveConsensus(consensus);
    this.messenger.send({
      sessionId: conflict.sessionId,
      fromAgentId: 'system',
      fromAgentName: 'Consensus Engine',
      type: 'consensus',
      subject: `Consensus: ${consensus.topic}`,
      body: consensus.winningPosition,
      payload: { consensusId: consensus.id, confidence: consensus.confidenceScore },
    });

    this.logger.success(`Consensus formed on "${consensus.topic}"`, conflict.sessionId);
    return consensus;
  }

  public buildOverall(
    sessionId: string,
    contributions: AgentContribution[],
    conflicts: Conflict[]
  ): Consensus {
    const votes: ConsensusVote[] = contributions.map((c) => ({
      agentId: c.agentId,
      agentName: c.agentName,
      position: c.summary,
      confidence: c.confidence,
      weight: c.kind === 'recommendation' ? 1.2 : c.kind === 'risk' ? 1.1 : 1,
    }));

    const avg =
      votes.length === 0
        ? 0
        : Math.round(
            votes.reduce((s, v) => s + v.confidence * v.weight, 0) /
              votes.reduce((s, v) => s + v.weight, 0)
          );

    const topRecs = contributions
      .filter((c) => c.kind === 'recommendation' || c.kind === 'strategy' || c.kind === 'finding')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map((c) => c.title);

    const consensus: Consensus = {
      id: `consensus-overall-${Date.now()}`,
      sessionId,
      topic: 'Overall collaboration recommendation',
      votes,
      winningPosition:
        topRecs.length > 0
          ? `Proceed with: ${topRecs.join(' → ')}`
          : 'Proceed with multi-agent plan under executive oversight.',
      confidenceScore: avg,
      dissent: conflicts
        .filter((c) => c.status === 'resolved')
        .flatMap((c) =>
          c.opinions
            .slice(1)
            .map((o) => `${o.agentName} dissent on ${c.topic}`)
        ),
      rationale:
        'Combined contribution confidences with light weighting for recommendations and risks.',
      createdAt: new Date().toISOString(),
    };

    this.repo.saveConsensus(consensus);
    this.messenger.send({
      sessionId,
      fromAgentId: 'system',
      fromAgentName: 'Consensus Engine',
      type: 'consensus',
      subject: 'Overall consensus',
      body: consensus.winningPosition,
      payload: { consensusId: consensus.id },
    });

    return consensus;
  }

  public formAll(sessionId: string, contributions: AgentContribution[]): Consensus[] {
    const conflicts = this.repo.listConflicts(sessionId);
    const fromConflicts = conflicts.map((c) => this.buildFromConflict(c));
    const overall = this.buildOverall(sessionId, contributions, conflicts);
    return [...fromConflicts, overall];
  }
}
