import type { AgentContribution } from '../types/AgentContribution';
import type { Conflict } from '../types/Conflict';
import type { Consensus } from '../types/Consensus';
import type { CollaborationFinalReport, CollaborationSession } from '../types/CollaborationSession';
import { CollaborationLogger } from './CollaborationLogger';
import { MemoryManager } from '../../memory/core/MemoryManager';

/**
 * Merges agent contributions + consensus into one executive collaboration report.
 * Does not perform AI reasoning — aggregation only.
 */
export class ResultAggregator {
  private logger = CollaborationLogger.getInstance();
  private memory = MemoryManager.getInstance();

  public aggregate(args: {
    session: CollaborationSession;
    contributions: AgentContribution[];
    conflicts: Conflict[];
    consensus: Consensus[];
    persistToMemory?: boolean;
  }): CollaborationFinalReport {
    const { session, contributions, conflicts, consensus } = args;

    const findings = contributions
      .filter((c) => c.kind === 'finding' || c.kind === 'status')
      .map((c) => `[${c.agentName}] ${c.summary}`);

    const recommendations = contributions
      .filter((c) => c.kind === 'recommendation' || c.kind === 'strategy')
      .map((c) => `[${c.agentName}] ${c.title}: ${c.summary}`);

    const risks = contributions
      .filter((c) => c.kind === 'risk')
      .map((c) => `[${c.agentName}] ${c.summary}`);

    const overall = consensus.find((c) => c.topic.toLowerCase().includes('overall'));
    const consensusHighlights = consensus.map(
      (c) => `${c.topic}: ${c.winningPosition} (confidence ${c.confidenceScore}%)`
    );

    const unresolved = conflicts
      .filter((c) => c.status === 'open')
      .map((c) => c.topic);

    const confidenceScore =
      overall?.confidenceScore ??
      (contributions.length
        ? Math.round(
            contributions.reduce((s, c) => s + c.confidence, 0) / contributions.length
          )
        : 0);

    const executiveSummary = [
      `Multi-agent collaboration on "${session.objective}".`,
      `${session.participants.length} employees participated.`,
      overall ? `Consensus: ${overall.winningPosition}` : '',
      findings[0] ? `Lead finding: ${findings[0]}` : '',
      recommendations[0] ? `Lead recommendation: ${recommendations[0]}` : '',
      risks[0] ? `Lead risk: ${risks[0]}` : '',
      `Confidence ${confidenceScore}%. Collaboration Engine coordinated only — employees produced findings.`,
    ]
      .filter(Boolean)
      .join(' ');

    const report: CollaborationFinalReport = {
      id: `collab-report-${Date.now()}`,
      sessionId: session.id,
      title: `Collaboration Report: ${session.title}`,
      executiveSummary,
      objective: session.objective,
      participatingAgents: session.participants.map((p) => p.agentName),
      keyFindings: findings.slice(0, 12),
      recommendations: recommendations.slice(0, 12),
      risks: risks.slice(0, 8),
      consensusHighlights,
      unresolvedConflicts: unresolved,
      confidenceScore,
      createdAt: new Date().toISOString(),
    };

    if (args.persistToMemory !== false) {
      try {
        this.memory.createMemoryItem({
          title: report.title,
          description: report.executiveSummary.slice(0, 140) + '...',
          content: [
            report.executiveSummary,
            '',
            'Findings:',
            ...report.keyFindings.map((f) => `- ${f}`),
            '',
            'Recommendations:',
            ...report.recommendations.map((r) => `- ${r}`),
            '',
            'Risks:',
            ...report.risks.map((r) => `- ${r}`),
            '',
            'Consensus:',
            ...report.consensusHighlights.map((c) => `- ${c}`),
          ].join('\n'),
          type: 'Project Memory',
          category: 'Reports',
          priority: 'High',
          visibility: 'Global',
          website: session.task.domain,
          tags: ['Collaboration', 'Multi-Agent', 'Executive Report'],
          source: 'Collaboration Engine',
        });
      } catch (err) {
        this.logger.warn(
          `Memory persist skipped: ${err instanceof Error ? err.message : String(err)}`,
          session.id
        );
      }
    }

    this.logger.success(`Final report ${report.id} aggregated`, session.id);
    return report;
  }
}
