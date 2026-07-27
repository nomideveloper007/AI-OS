import { AIEngine } from '../../../ai/core/AIEngine';
import { AIConfig } from '../../../ai/config/AIConfig';
import { DEFAULT_MODEL_ID } from '../../../ai/config/constants';
import { ResponseParser } from '../../../ai/utils/ResponseParser';
import { BusinessAnalyzer } from './BusinessAnalyzer';
import { OpportunityPlanner } from './OpportunityPlanner';
import { RiskPlanner } from './RiskPlanner';
import { PriorityEngine } from './PriorityEngine';
import { GoalPlanner } from './GoalPlanner';
import { TaskPlanner } from './TaskPlanner';
import { RoadmapGenerator } from './RoadmapGenerator';
import { DecisionEngine } from './DecisionEngine';
import { ExecutiveSummaryBuilder } from './ExecutiveSummary';
import { PlanningHistory } from './PlanningHistory';
import { PlanningLogger } from './PlanningLogger';
import type {
  PlannedTask,
  PlanningInputBundle,
  RoadmapItem,
  StrategicGoal,
  StrategicPlan,
  StrategicPriority,
} from './planTypes';

export const CEO_PLAN_PROMPT_VERSION = 'ceo-strategic-v1';

const SYSTEM_PROMPT = `You are the CEO Strategic Planner inside AI OS.
Think like a CEO: business health, opportunities, risks, prioritization, impact, and multi-horizon roadmaps.
You NEVER execute work. You only plan. Output ONE JSON object only (no markdown fences).
Required keys:
executiveSummary (string),
businessHealthScore (0-100 number),
healthBreakdown { overall, website, seo, performance, security, content, growth, operations },
strategicGoals [{ id, title, description, horizon, priority, successMetric, ownerEmployee }],
topPriorities [{ id, rank, title, rationale, priority, estimatedImpact, relatedGoalIds }],
immediateActions [string],
longTermStrategy [string],
recommendedEmployees [string],
estimatedImpact (string),
risks [{ id, title, severity, description, mitigation }],
opportunities [{ id, title, potentialGrowth, description, actionPlan }],
roadmap { daily:[{id,title,horizon,periodLabel,items,priority}], weekly:[...], monthly:[...], quarterly:[...] },
plannedTasks [{ id, title, description, priority, category, estimatedImpact, suggestedAgent, horizon, reason }]
priority values: Critical|High|Medium|Low
horizon values: daily|weekly|monthly|quarterly
category values: SEO|Security|Performance|Content|UX|Architecture|Growth
Use ONLY the provided context. Do not invent scanner metrics that are not present.`;

/**
 * Facade: CEO strategic brain. Plans only — never executes tasks.
 */
export class StrategicPlanner {
  private static instance: StrategicPlanner;

  private ai = AIEngine.getInstance();
  private logger = PlanningLogger.getInstance();
  private history = PlanningHistory.getInstance();
  private business = new BusinessAnalyzer();
  private opportunities = new OpportunityPlanner();
  private risks = new RiskPlanner();
  private priorities = new PriorityEngine();
  private goals = new GoalPlanner();
  private tasks = new TaskPlanner();
  private roadmap = new RoadmapGenerator();
  private decisions = new DecisionEngine();
  private summary = new ExecutiveSummaryBuilder();

  public static getInstance(): StrategicPlanner {
    if (!StrategicPlanner.instance) StrategicPlanner.instance = new StrategicPlanner();
    return StrategicPlanner.instance;
  }

  public getLatestPlan(domain?: string): StrategicPlan | undefined {
    return this.history.latest(domain);
  }

  public listPlans(domain?: string): StrategicPlan[] {
    return this.history.list(domain);
  }

  public async plan(
    input: PlanningInputBundle,
    options?: { registerTasks?: boolean }
  ): Promise<StrategicPlan> {
    this.logger.info('Strategic planning started', input.domain);

    const baseHealth = this.business.analyze(input);
    let aiRaw: Record<string, unknown> | null = null;
    let modelId: string | undefined;
    let providerId: string | undefined;

    try {
      const aiResult = await this.callAi(input);
      aiRaw = aiResult.parsed;
      modelId = aiResult.modelId;
      providerId = aiResult.providerId;
      this.logger.success('AI strategic JSON accepted', input.domain, {
        modelId,
        providerId,
      });
    } catch (err) {
      this.logger.warn(
        `AI planning fallback engaged: ${err instanceof Error ? err.message : String(err)}`,
        input.domain
      );
    }

    const health = this.business.mergeAiScores(
      baseHealth,
      aiRaw
        ? {
            businessHealthScore: aiRaw.businessHealthScore as number | undefined,
            ...(typeof aiRaw.healthBreakdown === 'object' && aiRaw.healthBreakdown
              ? (aiRaw.healthBreakdown as Record<string, number>)
              : {}),
          }
        : undefined
    );

    const strategicGoals = this.goals.plan(
      input,
      health.businessHealthScore,
      this.asArray<StrategicGoal>(aiRaw?.strategicGoals)
    );
    const opportunities = this.opportunities.plan(
      input,
      this.asArray(aiRaw?.opportunities)
    );
    const risks = this.risks.plan(input, this.asArray(aiRaw?.risks));
    const topPriorities = this.priorities.buildPriorities({
      domain: input.domain,
      goals: strategicGoals,
      risks,
      opportunities,
      aiPriorities: this.asArray<StrategicPriority>(aiRaw?.topPriorities),
    });

    const plannedTasks = this.tasks.plan({
      input,
      priorities: topPriorities,
      risks,
      opportunities,
      aiTasks: this.asArray<PlannedTask>(aiRaw?.plannedTasks),
      registerInTaskEngine: options?.registerTasks !== false,
    });

    const roadmap = this.roadmap.generate({
      domain: input.domain,
      goals: strategicGoals,
      priorities: topPriorities,
      plannedTaskTitles: plannedTasks.map((t) => t.title),
      aiRoadmap: aiRaw?.roadmap as
        | {
            daily?: RoadmapItem[];
            weekly?: RoadmapItem[];
            monthly?: RoadmapItem[];
            quarterly?: RoadmapItem[];
          }
        | undefined,
    });

    const decision = this.decisions.decide({
      domain: input.domain,
      priorities: topPriorities,
      plannedTasks,
      risks,
      opportunities,
      ai: {
        recommendedEmployees: this.asStringArray(aiRaw?.recommendedEmployees),
        estimatedImpact:
          typeof aiRaw?.estimatedImpact === 'string' ? aiRaw.estimatedImpact : undefined,
        immediateActions: this.asStringArray(aiRaw?.immediateActions),
        longTermStrategy: this.asStringArray(aiRaw?.longTermStrategy),
      },
    });

    const executiveSummary = this.summary.build({
      input,
      health,
      goals: strategicGoals,
      priorities: topPriorities,
      decision,
      aiSummary: typeof aiRaw?.executiveSummary === 'string' ? aiRaw.executiveSummary : undefined,
    });

    const completed = input.completedTasks.length;
    const failed = input.failedTasks.length;
    const open = input.openTasks.length;
    const denom = completed + failed;
    const completionRate = denom === 0 ? 0 : Math.round((completed / denom) * 100);

    const plan: StrategicPlan = {
      id: `strat-${Date.now()}`,
      domain: input.domain,
      websiteId: input.websiteId,
      createdAt: new Date().toISOString(),
      promptVersion: CEO_PLAN_PROMPT_VERSION,
      modelId,
      providerId,
      executiveSummary,
      businessHealthScore: health.businessHealthScore,
      healthBreakdown: health.healthBreakdown,
      strategicGoals,
      topPriorities,
      immediateActions: decision.immediateActions,
      longTermStrategy: decision.longTermStrategy,
      recommendedEmployees: decision.recommendedEmployees,
      estimatedImpact: decision.estimatedImpact,
      risks,
      opportunities,
      roadmap,
      plannedTasks,
      progress: {
        completedTasks: completed,
        failedTasks: failed,
        openTasks: open,
        completionRate,
      },
      sourceNotes: {
        websiteIntelligenceLoaded: Boolean(input.websiteIntelligence),
        memoryItemsLoaded: input.memorySnippets.length,
        historicalReportsLoaded: input.historicalReports.length,
        taskHistoryLoaded: completed + failed + open,
      },
    };

    this.history.record(plan);
    this.logger.success(
      `Strategic plan ${plan.id} ready (health=${plan.businessHealthScore}, tasks=${plan.plannedTasks.length})`,
      input.domain
    );
    return plan;
  }

  private async callAi(input: PlanningInputBundle): Promise<{
    parsed: Record<string, unknown>;
    modelId?: string;
    providerId?: string;
  }> {
    const cfg = AIConfig.getInstance().getConfig();
    const modelId =
      cfg.defaultModelId && cfg.defaultModelId !== 'mock' && !cfg.defaultModelId.startsWith('mock-')
        ? cfg.defaultModelId
        : DEFAULT_MODEL_ID;

    const userContent = JSON.stringify(
      {
        role: 'ceo_strategic_planning',
        domain: input.domain,
        websiteId: input.websiteId,
        businessGoals: input.businessGoals,
        websiteIntelligence: input.websiteIntelligence || null,
        memory: input.memorySnippets.slice(0, 8),
        historicalReports: input.historicalReports.slice(0, 5),
        completedTasks: input.completedTasks.slice(0, 10),
        failedTasks: input.failedTasks.slice(0, 10),
        openTasks: input.openTasks.slice(0, 10),
        workflowHistory: input.workflowHistory.slice(0, 8),
        instructions:
          'Return strategic planning JSON only. Prefer concrete tasks like Improve homepage title, Fix missing ALT text, Create FAQ page, Optimize sitemap, Publish 3 blog posts, Improve Core Web Vitals.',
      },
      null,
      0
    );

    // Streaming required — non-stream often empty on felo-chat / OmniRoute upstreams
    const response = await this.ai.stream(
      {
        modelId,
        messages: [
          {
            id: `ceo-sys-${Date.now()}`,
            role: 'system',
            content: SYSTEM_PROMPT,
            timestamp: new Date().toISOString(),
          },
          {
            id: `ceo-usr-${Date.now()}`,
            role: 'user',
            content: userContent,
            timestamp: new Date().toISOString(),
          },
        ],
        temperature: 0.2,
        maxTokens: Math.max(cfg.maxTokens, 4096),
        stream: true,
        metadata: {
          taskType: 'general_chat',
          agent: 'ceo',
          domain: input.domain,
        },
      },
      () => undefined
    );

    if (response.providerId === 'mock') {
      throw new Error(
        'CEO Strategic Planner routed to Mock Provider. Configure OmniRoute (auto/best-chat).'
      );
    }

    const content = (response.choices?.[0]?.message?.content || '').replace(/^\uFEFF/, '').trim();
    const parsed =
      ResponseParser.extractJSON<Record<string, unknown>>(content) ||
      this.extractJsonObject(content);

    if (!parsed || typeof parsed.executiveSummary !== 'string') {
      throw new Error(
        `Unusable CEO planning JSON (model=${response.modelId}, chars=${content.length})`
      );
    }

    return {
      parsed,
      modelId: response.modelId,
      providerId: response.providerId,
    };
  }

  private asArray<T>(v: unknown): T[] | undefined {
    return Array.isArray(v) ? (v as T[]) : undefined;
  }

  private asStringArray(v: unknown): string[] | undefined {
    if (!Array.isArray(v)) return undefined;
    return v.map((x) => String(x)).filter(Boolean);
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
}
