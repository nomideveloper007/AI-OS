import { AIEngine } from '../../../ai/core/AIEngine';
import { AIConfig } from '../../../ai/config/AIConfig';
import { DEFAULT_MODEL_ID } from '../../../ai/config/constants';
import { ResponseParser } from '../../../ai/utils/ResponseParser';
import { MemoryEngine } from '../../../memory/core/MemoryEngine';
import { WebsiteIntelligenceEngine } from '../../../intelligence/core/WebsiteIntelligenceEngine';
import { WebsiteContextRepository } from '../../../intelligence/repositories/WebsiteContextRepository';
import type { WebsiteContext } from '../../../intelligence/types/WebsiteContext';
import type { SEOAuditInput, SEOAuditContextSnapshot } from '../types/SEOAudit';
import type { SEOReport } from '../types/SEOReport';
import { SEORepository } from '../repositories/SEORepository';
import { SEOLogger } from './SEOLogger';
import {
  SEO_PROMPT_VERSION,
  SEO_SYSTEM_PROMPT,
  buildSEOAuditUserMessage,
  buildSEOAuditRetryMessage,
} from '../prompts/seoAuditPrompt';

export interface SEOAIAnalysisResult {
  raw: Record<string, unknown>;
  modelId?: string;
  providerId?: string;
  promptVersion: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  userMessageJson: string;
  /** Raw assistant text from the model (for UI verification). */
  rawAiContent: string;
  source: 'ai_engine';
}

/**
 * Gathers Website Intelligence + Memory context and calls AI Engine with structured JSON only.
 * Never talks to OmniRoute directly.
 */
export class SEOAnalyzer {
  private ai = AIEngine.getInstance();
  private memory = MemoryEngine.getInstance();
  private intelligence = WebsiteIntelligenceEngine.getInstance();
  private contextRepo = WebsiteContextRepository.getInstance();
  private seoRepo = SEORepository.getInstance();
  private logger = SEOLogger.getInstance();

  public resolveWebsiteContext(input: SEOAuditInput): WebsiteContext | undefined {
    if (input.websiteId) {
      const byId = this.intelligence.getLatestContext(input.websiteId);
      if (byId) return byId;
    }
    if (input.domain) {
      return this.contextRepo.getLatestForDomain(input.domain);
    }
    // Fallback: newest intelligence snapshot available (still not hardcoded)
    return this.contextRepo.listAll()[0];
  }

  public gatherContext(
    input: SEOAuditInput,
    websiteContext: WebsiteContext | undefined,
    auditId?: string
  ): SEOAuditContextSnapshot {
    const domain = websiteContext?.domain || input.domain || '';
    const seoPayload = websiteContext
      ? this.intelligence.buildSeoContext(websiteContext)
      : undefined;

    const memories = this.memory
      .searchMemories({
        query: domain || input.taskTitle || 'SEO',
        category: 'SEO',
      })
      .slice(0, 8);

    // Also pull report-tagged memories
    const reportMemories = this.memory
      .searchMemories({ query: domain, category: 'Reports' })
      .slice(0, 5);

    const memoryItems = [...memories, ...reportMemories];
    const previous = this.seoRepo.listReports(domain || undefined).slice(0, 3);

    this.logger.info(
      `Context gathered — website=${Boolean(websiteContext)} memory=${memoryItems.length} previous=${previous.length}`,
      auditId
    );

    return {
      websiteContextLoaded: Boolean(websiteContext),
      memoryItemsLoaded: memoryItems.length,
      previousReportsLoaded: previous.length,
      seoIntelligencePayload: seoPayload,
      memorySnippets: memoryItems.map(
        (m) => `${m.title}: ${(m.content || m.description || '').slice(0, 200)}`
      ),
    };
  }

  public async analyzeWithAI(
    input: SEOAuditInput,
    websiteContext: WebsiteContext,
    context: SEOAuditContextSnapshot,
    previousReports: SEOReport[],
    auditId?: string
  ): Promise<SEOAIAnalysisResult> {
    const websitePayload = {
      ...this.intelligence.buildSeoContext(websiteContext),
      profile: {
        metaTitle: websiteContext.profile.metaTitle,
        metaDescription: websiteContext.profile.metaDescription,
        hasRobots: websiteContext.profile.hasRobots,
        hasSitemap: websiteContext.profile.hasSitemap,
        hasOpenGraph: websiteContext.profile.hasOpenGraph,
        hasStructuredDataHint: websiteContext.profile.hasStructuredDataHint,
        brokenLinks: websiteContext.profile.brokenLinks,
        internalLinks: websiteContext.profile.internalLinks,
        externalLinks: websiteContext.profile.externalLinks,
        imageCount: websiteContext.profile.imageCount,
        imagesMissingAlt: websiteContext.profile.imagesMissingAlt,
        mobileFriendly: websiteContext.profile.mobileFriendly,
        loadingTimeMs: websiteContext.profile.loadingTimeMs,
        pageCount: websiteContext.profile.pageCount,
        httpsEnabled: websiteContext.profile.httpsEnabled,
      },
      scores: websiteContext.scores,
      summary: websiteContext.summary,
      domain: websiteContext.domain,
      websiteId: websiteContext.websiteId,
      name: websiteContext.name,
    };

    const memoryPayload = context.memorySnippets.slice(0, 5).map((s, i) => ({
      index: i,
      snippet: s.slice(0, 160),
    }));

    const previousPayload = previousReports.slice(0, 2).map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      overallSeoScore: r.overallSeoScore,
      priority: r.priority,
      criticalCount: r.criticalIssues.length,
      summary: r.executiveSummary.slice(0, 160),
    }));

    const userMessageJson = buildSEOAuditUserMessage({
      task: {
        taskId: input.taskId,
        title: input.taskTitle,
        description: input.taskDescription,
        requestedBy: input.requestedBy,
      },
      website: websitePayload,
      memory: memoryPayload,
      previousReports: previousPayload,
    });

    const cfg = AIConfig.getInstance().getConfig();
    const modelId =
      cfg.defaultModelId && cfg.defaultModelId !== 'mock' && !cfg.defaultModelId.startsWith('mock-')
        ? cfg.defaultModelId
        : DEFAULT_MODEL_ID;

    this.logger.info('Sending compact JSON prompt to AI Engine (OmniRoute)', auditId, {
      promptVersion: SEO_PROMPT_VERSION,
      chars: userMessageJson.length,
      modelId,
      baseUrl: cfg.omniRouteBaseUrl,
    });

    const started = Date.now();
    let response = await this.callAi(modelId, userMessageJson, cfg, websiteContext.domain, auditId);

    if (response.providerId === 'mock') {
      throw new Error(
        'SEO Agent was routed to Mock Provider. Configure OmniRoute (model auto/best-chat) in AI settings.'
      );
    }

    let content = this.normalizeAiContent(response.choices?.[0]?.message?.content || '');
    let parsed = this.parseSeoJson(content);

    // Empty / garbage replies (e.g. """ with 2 completion tokens) → one compact retry
    if (!parsed || this.isEmptyAiContent(content)) {
      this.logger.warn(
        `First AI reply unusable (chars=${content.length}, completionTokens=${response.usage?.completionTokens ?? 0}) — retrying compact prompt`,
        auditId
      );
      const retryMessage = buildSEOAuditRetryMessage(websitePayload);
      response = await this.callAi(modelId, retryMessage, cfg, websiteContext.domain, auditId);
      content = this.normalizeAiContent(response.choices?.[0]?.message?.content || '');
      parsed = this.parseSeoJson(content);
    }

    if (!parsed || this.isEmptyAiContent(content)) {
      const preview = JSON.stringify(content).slice(0, 120);
      throw new Error(
        `AI Engine returned no usable SEO JSON (model=${response.modelId}, completionTokens=${response.usage?.completionTokens ?? 0}, content=${preview}). Screen data will not be fabricated from Website Intelligence. Re-run or switch model.`
      );
    }

    if (!this.isValidSeoPayload(parsed)) {
      throw new Error(
        `AI JSON is missing required SEO fields (overallSeoScore / scores). Raw preview: ${content.slice(0, 180)}`
      );
    }

    this.logger.info(
      `AI SEO JSON accepted (${response.durationMs ?? Date.now() - started}ms, provider=${response.providerId})`,
      auditId,
      {
        modelId: response.modelId,
        tokens: response.usage?.totalTokens,
        overallSeoScore: parsed.overallSeoScore,
        contentChars: content.length,
      }
    );

    return {
      raw: { ...parsed, _fallback: false, _source: 'ai_engine' },
      modelId: response.modelId,
      providerId: response.providerId,
      promptVersion: SEO_PROMPT_VERSION,
      tokenUsage: {
        promptTokens: response.usage?.promptTokens ?? 0,
        completionTokens: response.usage?.completionTokens ?? 0,
        totalTokens: response.usage?.totalTokens ?? 0,
      },
      durationMs: response.durationMs ?? Date.now() - started,
      userMessageJson,
      rawAiContent: content,
      source: 'ai_engine',
    };
  }

  private async callAi(
    modelId: string,
    userContent: string,
    cfg: ReturnType<AIConfig['getConfig']>,
    domain: string,
    auditId?: string
  ) {
    // felo-chat (and some OmniRoute upstreams) return empty/garbage JSON on
    // non-streaming chat completions. Streaming reliably returns full content.
    this.logger.info('Calling AI Engine via stream (non-stream broken on felo-chat)', auditId, {
      modelId,
    });

    return this.ai.stream(
      {
        modelId,
        messages: [
          {
            id: `seo-sys-${Date.now()}`,
            role: 'system',
            content: SEO_SYSTEM_PROMPT,
            timestamp: new Date().toISOString(),
          },
          {
            id: `seo-usr-${Date.now()}`,
            role: 'user',
            content: userContent,
            timestamp: new Date().toISOString(),
          },
        ],
        temperature: 0.1,
        maxTokens: Math.max(cfg.maxTokens, 4096),
        stream: true,
        metadata: {
          taskType: 'general_chat',
          agent: 'seo',
          domain,
          auditId,
        },
      },
      () => {
        // chunks accumulated by provider; final response has full content
      }
    );
  }

  private normalizeAiContent(content: string): string {
    return content.replace(/^\uFEFF/, '').trim();
  }

  private isEmptyAiContent(content: string): boolean {
    const stripped = content.replace(/["'`\s]/g, '');
    // "{}", "}", """" etc. are not usable SEO payloads
    if (stripped.length < 40) return true;
    if (!content.includes('{') || !content.includes('overallSeoScore')) {
      // allow partial if scores key present
      if (!content.includes('scores') && !content.includes('executiveSummary')) return true;
    }
    return false;
  }

  private parseSeoJson(content: string): Record<string, unknown> | null {
    return (
      ResponseParser.extractJSON<Record<string, unknown>>(content) ||
      this.extractJsonObject(content)
    );
  }

  private isValidSeoPayload(raw: Record<string, unknown>): boolean {
    const hasOverall = typeof raw.overallSeoScore === 'number' || typeof raw.overallSeoScore === 'string';
    const scores = raw.scores;
    const hasScores = scores != null && typeof scores === 'object';
    const hasSummary = typeof raw.executiveSummary === 'string' && raw.executiveSummary.trim().length > 0;
    return Boolean(hasOverall && hasScores && hasSummary);
  }

  /** Best-effort extract of a top-level JSON object from messy model output. */
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
}
