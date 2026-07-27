import type { BaseAgent } from '../../agents/core/BaseAgent';
import type { CollaborationParticipant } from '../types/CollaborationSession';
import type { SharedContext } from '../types/SharedContext';
import type { AgentContribution, ContributionKind } from '../types/AgentContribution';
import { CollaborationRepository } from '../repositories/CollaborationRepository';
import { AgentMessenger } from './AgentMessenger';
import { CollaborationLogger } from './CollaborationLogger';
import { AIEngine } from '../../ai/core/AIEngine';
import { AIConfig } from '../../ai/config/AIConfig';
import { DEFAULT_MODEL_ID } from '../../ai/config/constants';
import { ResponseParser } from '../../ai/utils/ResponseParser';

type ContributionDraft = Pick<
  AgentContribution,
  'kind' | 'title' | 'summary' | 'details' | 'confidence' | 'evidenceRefs'
>;

/**
 * Coordinates participating agents for a session.
 * Each employee contribution is produced via AI Engine (OmniRoute API).
 * Shared context is passed in — Memory/WI are not re-fetched per agent.
 */
export class AgentCoordinator {
  private repo = CollaborationRepository.getInstance();
  private messenger = new AgentMessenger();
  private logger = CollaborationLogger.getInstance();
  private ai = AIEngine.getInstance();

  public buildParticipants(agents: BaseAgent[], orderedIds: string[]): CollaborationParticipant[] {
    return orderedIds
      .map((id, index) => {
        const agent = agents.find((a) => a.id === id);
        if (!agent) return null;
        return {
          agentId: agent.id,
          agentName: agent.name,
          agentRole: String(agent.role),
          capabilities: agent.capabilities.map(String),
          status: 'assigned' as const,
          order: index + 1,
          contributionIds: [],
        };
      })
      .filter(Boolean) as CollaborationParticipant[];
  }

  /**
   * Collect one agent contribution — calls AI Engine (stream → OmniRoute).
   */
  public async collectContribution(
    sessionId: string,
    participant: CollaborationParticipant,
    context: SharedContext,
    objective: string
  ): Promise<AgentContribution> {
    this.logger.info(
      `Requesting AI contribution from ${participant.agentName}`,
      sessionId,
      { agentId: participant.agentId, role: participant.agentRole }
    );

    let draft: ContributionDraft;
    try {
      draft = await this.requestAiContribution(participant, context, objective, sessionId);
    } catch (err) {
      this.logger.warn(
        `AI contribution failed for ${participant.agentName}, using role fallback: ${
          err instanceof Error ? err.message : String(err)
        }`,
        sessionId
      );
      draft = this.synthesizeFromRole(participant, context, objective);
    }

    const contribution: AgentContribution = {
      id: `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      sessionId,
      agentId: participant.agentId,
      agentName: participant.agentName,
      agentRole: participant.agentRole,
      kind: draft.kind,
      title: draft.title,
      summary: draft.summary,
      details: draft.details,
      confidence: draft.confidence,
      evidenceRefs: draft.evidenceRefs,
      relatedMessageIds: [],
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.repo.saveContribution(contribution);

    const msg = this.messenger.send({
      sessionId,
      fromAgentId: participant.agentId,
      fromAgentName: participant.agentName,
      type: 'share_finding',
      subject: contribution.title,
      body: contribution.summary,
      relatedContributionId: contribution.id,
      payload: { kind: contribution.kind, confidence: contribution.confidence },
    });

    contribution.relatedMessageIds = [msg.id];
    this.repo.saveContribution(contribution);

    this.messenger.send({
      sessionId,
      fromAgentId: participant.agentId,
      fromAgentName: participant.agentName,
      type: 'report_completion',
      subject: `Completed: ${contribution.title}`,
      body: `${participant.agentName} finished contribution for objective "${objective}".`,
      relatedContributionId: contribution.id,
    });

    this.logger.success(
      `Contribution from ${participant.agentName}: ${contribution.title}`,
      sessionId,
      { agentId: participant.agentId, contributionId: contribution.id }
    );

    return contribution;
  }

  private async requestAiContribution(
    participant: CollaborationParticipant,
    context: SharedContext,
    objective: string,
    sessionId: string
  ): Promise<ContributionDraft> {
    const cfg = AIConfig.getInstance().getConfig();
    const modelId =
      cfg.defaultModelId && cfg.defaultModelId !== 'mock' && !cfg.defaultModelId.startsWith('mock-')
        ? cfg.defaultModelId
        : DEFAULT_MODEL_ID;

    const systemPrompt = `You are ${participant.agentName}, role: ${participant.agentRole}.
You are an AI employee in a multi-agent collaboration session.
Use ONLY the shared context provided. Do not invent scanner metrics that are absent.
Return ONE JSON object only (no markdown) with keys:
kind ("finding"|"recommendation"|"risk"|"strategy"|"status"|"clarification"),
title (string), summary (string), details (string), confidence (0-100 number).
Stay in your role. Be concrete and actionable for the business objective.`;

    const userPayload = {
      objective,
      agent: {
        id: participant.agentId,
        name: participant.agentName,
        role: participant.agentRole,
        capabilities: participant.capabilities,
        order: participant.order,
      },
      sharedContext: {
        domain: context.domain,
        websiteId: context.websiteId,
        websiteSummary: context.websiteSummary,
        websiteContext: context.websiteContext,
        memorySnippets: context.memorySnippets.slice(0, 6),
        priorReports: context.priorReports.slice(0, 3),
        taskHints: context.taskHints.slice(0, 6),
        sourceNotes: context.sourceNotes,
      },
    };

    this.logger.info(
      `Calling AI Engine stream for ${participant.agentName} (model=${modelId})`,
      sessionId,
      { modelId, chars: JSON.stringify(userPayload).length }
    );

    // Stream required — non-stream often empty on felo-chat / OmniRoute upstreams
    const response = await this.ai.stream(
      {
        modelId,
        messages: [
          {
            id: `collab-sys-${Date.now()}`,
            role: 'system',
            content: systemPrompt,
            timestamp: new Date().toISOString(),
          },
          {
            id: `collab-usr-${Date.now()}`,
            role: 'user',
            content: JSON.stringify(userPayload),
            timestamp: new Date().toISOString(),
          },
        ],
        temperature: 0.2,
        maxTokens: Math.max(cfg.maxTokens, 2048),
        stream: true,
        metadata: {
          taskType: 'general_chat',
          agent: 'collaboration',
          agentId: participant.agentId,
          agentName: participant.agentName,
          sessionId,
          domain: context.domain,
        },
      },
      () => undefined
    );

    if (response.providerId === 'mock') {
      throw new Error(
        'Collaboration routed to Mock Provider. Configure OmniRoute (auto/best-chat) in AI settings.'
      );
    }

    const content = (response.choices?.[0]?.message?.content || '').replace(/^\uFEFF/, '').trim();
    const parsed =
      ResponseParser.extractJSON<Record<string, unknown>>(content) ||
      this.extractJsonObject(content);

    if (!parsed || typeof parsed.summary !== 'string' || !parsed.summary.trim()) {
      throw new Error(
        `Unusable AI contribution JSON from ${participant.agentName} (chars=${content.length}, model=${response.modelId})`
      );
    }

    const evidence = [
      ...context.memorySnippets.slice(0, 2).map((m) => `memory:${m.id}`),
      context.sourceNotes.websiteIntelligenceLoaded ? 'website_intelligence' : 'no_wi',
      `ai:${response.modelId || modelId}`,
    ];

    return {
      kind: this.normalizeKind(parsed.kind),
      title:
        typeof parsed.title === 'string' && parsed.title.trim()
          ? parsed.title.trim()
          : `${participant.agentName} contribution`,
      summary: parsed.summary.trim(),
      details:
        typeof parsed.details === 'string' && parsed.details.trim()
          ? parsed.details.trim()
          : parsed.summary.trim(),
      confidence: this.clampConfidence(parsed.confidence),
      evidenceRefs: evidence,
    };
  }

  private normalizeKind(v: unknown): ContributionKind {
    const s = String(v || 'finding').toLowerCase();
    if (s.includes('recommend')) return 'recommendation';
    if (s.includes('risk')) return 'risk';
    if (s.includes('strateg')) return 'strategy';
    if (s.includes('status')) return 'status';
    if (s.includes('clarif')) return 'clarification';
    return 'finding';
  }

  private clampConfidence(v: unknown): number {
    const n = typeof v === 'number' ? v : Number(v);
    if (!Number.isFinite(n)) return 70;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  private extractJsonObject(text: string): Record<string, unknown> | null {
    if (!text) return null;
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private synthesizeFromRole(
    participant: CollaborationParticipant,
    context: SharedContext,
    objective: string
  ): ContributionDraft {
    const role = participant.agentRole.toLowerCase();
    const caps = participant.capabilities.map((c) => c.toLowerCase()).join(' ');
    const wi = context.websiteContext || {};
    const scores = (wi.scores || {}) as Record<string, number>;
    const evidence = [
      ...context.memorySnippets.slice(0, 2).map((m) => `memory:${m.id}`),
      context.sourceNotes.websiteIntelligenceLoaded ? 'website_intelligence' : 'no_wi',
      'fallback:local',
    ];

    if (role.includes('seo') || caps.includes('website scan')) {
      const seo = scores.seo ?? 55;
      return {
        kind: 'finding',
        title: 'SEO issue scan for organic growth',
        summary: `SEO health ~${seo}/100 relative to goal "${objective}". Prioritize titles, ALT text, sitemap, and content gaps.`,
        details: [
          `Objective: ${objective}`,
          `Domain: ${context.domain || 'n/a'}`,
          `SEO score signal: ${seo}`,
          `Recommended focus: meta titles, missing ALT, FAQ/schema, sitemap coverage, 3 supporting articles.`,
          context.websiteSummary ? `WI summary: ${String(context.websiteSummary).slice(0, 240)}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
        confidence: Math.min(95, 55 + Math.round(seo / 5)),
        evidenceRefs: evidence,
      };
    }

    if (role.includes('content') || caps.includes('write content')) {
      return {
        kind: 'strategy',
        title: 'Content strategy for organic traffic',
        summary: `Content plan aligned to "${objective}": FAQ hub + 3 intent-led posts + internal linking.`,
        details: [
          'Pillars: educational how-to, product/problem FAQ, comparison/intent pages.',
          'Cadence: 3 posts this month, FAQ page this week.',
          'Reuse memory insights to avoid duplicate topics.',
          `Memory items available: ${context.sourceNotes.memoryLoaded}`,
        ].join('\n'),
        confidence: 78,
        evidenceRefs: evidence,
      };
    }

    if (role.includes('growth') || role.includes('marketing')) {
      return {
        kind: 'strategy',
        title: 'Promotion strategy for organic acquisition',
        summary: `Growth playbook for "${objective}": distribute content, reinforce CTAs, measure organic funnel.`,
        details: [
          'Channels: organic search landing, newsletter teaser, social snippets from blog posts.',
          'Metrics: impressions, CTR, assisted conversions.',
          'Coordinate with SEO findings before promotion spend.',
        ].join('\n'),
        confidence: 74,
        evidenceRefs: evidence,
      };
    }

    if (role.includes('security') || caps.includes('security')) {
      const security = scores.security ?? 70;
      return {
        kind: 'risk',
        title: 'Security risk check for growth initiatives',
        summary: `Security posture ~${security}/100. Flag risks that could block or reverse traffic gains.`,
        details: [
          `Security score signal: ${security}`,
          'Ensure HTTPS, headers, and form surfaces stay healthy while shipping SEO/content changes.',
          'Do not ship growth experiments that weaken trust signals.',
        ].join('\n'),
        confidence: Math.min(92, 50 + Math.round(security / 4)),
        evidenceRefs: evidence,
      };
    }

    if (role.includes('website') || role.includes('auditor')) {
      const perf = scores.performance ?? scores.overall ?? 60;
      return {
        kind: 'finding',
        title: 'Website health constraints for traffic growth',
        summary: `Site health/performance ~${perf}/100 — Core Web Vitals and crawlability gate organic gains.`,
        details: [
          `Performance/overall signal: ${perf}`,
          'Check broken links, CWV, mobile readiness before content scale-up.',
        ].join('\n'),
        confidence: 80,
        evidenceRefs: evidence,
      };
    }

    if (role.includes('executive') || role.includes('director')) {
      return {
        kind: 'recommendation',
        title: 'Executive framing of collaboration objective',
        summary: `Frame "${objective}" as a multi-agent program: SEO diagnose → content ship → growth promote → security gate.`,
        details: [
          'Sequence employees by dependency order.',
          'Merge into one executive report; avoid parallel contradictory roadmaps.',
          `Shared context built once (${context.sourceNotes.memoryLoaded} memory, WI=${context.sourceNotes.websiteIntelligenceLoaded}).`,
        ].join('\n'),
        confidence: 88,
        evidenceRefs: evidence,
      };
    }

    return {
      kind: 'finding',
      title: `${participant.agentName} contribution`,
      summary: `${participant.agentName} (${participant.agentRole}) contributes to "${objective}" using shared collaboration context.`,
      details: `Capabilities: ${participant.capabilities.join(', ') || 'general'}. Domain: ${context.domain || 'n/a'}.`,
      confidence: 70,
      evidenceRefs: evidence,
    };
  }
}
