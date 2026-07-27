import type { AgentContribution } from '../types/AgentContribution';
import type { Conflict, ConflictOpinion } from '../types/Conflict';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { CollaborationLogger } from './CollaborationLogger';
import { AgentMessenger } from './AgentMessenger';

/**
 * Detects and records disagreements between agent contributions.
 */
export class ConflictResolver {
  private repo = CollaborationRepository.getInstance();
  private logger = CollaborationLogger.getInstance();
  private messenger = new AgentMessenger();

  public detectConflicts(sessionId: string, contributions: AgentContribution[]): Conflict[] {
    const conflicts: Conflict[] = [];
    const byKind = new Map<string, AgentContribution[]>();

    for (const c of contributions) {
      const key = c.kind === 'risk' ? 'risk' : c.kind === 'strategy' ? 'strategy' : 'finding';
      const list = byKind.get(key) || [];
      list.push(c);
      byKind.set(key, list);
    }

    // Strategy disagreements: low vs high confidence opposing growth aggressiveness
    const strategies = byKind.get('strategy') || [];
    const risks = byKind.get('risk') || [];

    if (strategies.length >= 1 && risks.length >= 1) {
      const risk = risks[0];
      const strategy = strategies[0];
      if (risk.confidence >= 70 && strategy.confidence >= 70) {
        const opinions: ConflictOpinion[] = [
          {
            agentId: strategy.agentId,
            agentName: strategy.agentName,
            position: strategy.summary,
            confidence: strategy.confidence,
            contributionId: strategy.id,
          },
          {
            agentId: risk.agentId,
            agentName: risk.agentName,
            position: risk.summary,
            confidence: risk.confidence,
            contributionId: risk.id,
          },
        ];

        const conflict: Conflict = {
          id: `conflict-${Date.now()}-grow-vs-risk`,
          sessionId,
          topic: 'Growth velocity vs security/risk gate',
          description:
            'Strategy and risk contributions pull in different directions on how aggressively to pursue the objective.',
          severity: risk.confidence >= 85 ? 'high' : 'medium',
          status: 'open',
          opinions,
          createdAt: new Date().toISOString(),
        };
        this.repo.saveConflict(conflict);
        conflicts.push(conflict);

        this.messenger.send({
          sessionId,
          fromAgentId: 'system',
          fromAgentName: 'Conflict Resolver',
          type: 'conflict_notice',
          subject: conflict.topic,
          body: conflict.description,
          payload: { conflictId: conflict.id },
        });
      }
    }

    // Finding contradictions: SEO vs Website auditor on priority
    const findings = byKind.get('finding') || [];
    if (findings.length >= 2) {
      const a = findings[0];
      const b = findings[1];
      const seoish = (t: string) => /seo|organic|meta|sitemap/i.test(t);
      const perfish = (t: string) => /performance|vitals|health|broken/i.test(t);
      if (
        (seoish(a.title + a.summary) && perfish(b.title + b.summary)) ||
        (seoish(b.title + b.summary) && perfish(a.title + a.summary))
      ) {
        const conflict: Conflict = {
          id: `conflict-${Date.now()}-seo-vs-perf`,
          sessionId,
          topic: 'SEO fixes vs performance/health first',
          description: 'Agents disagree on whether SEO content work or technical health should lead.',
          severity: 'medium',
          status: 'open',
          opinions: [
            {
              agentId: a.agentId,
              agentName: a.agentName,
              position: a.summary,
              confidence: a.confidence,
              contributionId: a.id,
            },
            {
              agentId: b.agentId,
              agentName: b.agentName,
              position: b.summary,
              confidence: b.confidence,
              contributionId: b.id,
            },
          ],
          createdAt: new Date().toISOString(),
        };
        this.repo.saveConflict(conflict);
        conflicts.push(conflict);
        this.messenger.send({
          sessionId,
          fromAgentId: 'system',
          fromAgentName: 'Conflict Resolver',
          type: 'conflict_notice',
          subject: conflict.topic,
          body: conflict.description,
          payload: { conflictId: conflict.id },
        });
      }
    }

    this.logger.info(`Detected ${conflicts.length} conflict(s)`, sessionId);
    return conflicts;
  }

  public resolve(conflict: Conflict): Conflict {
    const ranked = [...conflict.opinions].sort((x, y) => y.confidence - x.confidence);
    const winner = ranked[0];
    const avg =
      conflict.opinions.reduce((s, o) => s + o.confidence, 0) /
      Math.max(1, conflict.opinions.length);

    const resolved: Conflict = {
      ...conflict,
      status: 'resolved',
      recommendedPosition: winner?.position,
      confidenceScore: Math.round(avg),
      resolution: winner
        ? `Adopt highest-confidence position from ${winner.agentName} (${winner.confidence}%), while recording dissent from other agents.`
        : 'No opinion available.',
      resolvedAt: new Date().toISOString(),
    };

    this.repo.saveConflict(resolved);
    this.logger.success(`Resolved conflict: ${resolved.topic}`, conflict.sessionId);
    return resolved;
  }

  public resolveAll(sessionId: string): Conflict[] {
    return this.repo.listConflicts(sessionId).map((c) =>
      c.status === 'open' ? this.resolve(c) : c
    );
  }
}
