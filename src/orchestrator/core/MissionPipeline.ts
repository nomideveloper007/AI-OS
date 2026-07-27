import type { Mission } from '../types/Mission';
import type { MissionStageId } from '../types/MissionStage';
import type { MissionResult } from '../types/MissionResult';
import { MissionContext } from './MissionContext';
import { MissionLogger } from './MissionLogger';
import { WebsiteScanner } from '../../scanner/core/WebsiteScanner';
import { ScanRepository } from '../../scanner/repositories/ScanRepository';
import { WebsiteIntelligenceEngine } from '../../intelligence/core/WebsiteIntelligenceEngine';
import { CEOAgent } from '../../agents/ceo/CEOAgent';
import { TaskEngine } from '../../task-engine/core/TaskEngine';
import { CollaborationEngine } from '../../collaboration/core/CollaborationEngine';
import { AgentRuntime } from '../../agent-runtime/core/AgentRuntime';
import { MemoryManager } from '../../memory/core/MemoryManager';

export interface StageOutcome {
  ok: boolean;
  summary: string;
  artifactIds?: string[];
  errorMessage?: string;
  patch?: Partial<Mission['artifacts']>;
  progressPatch?: Partial<Mission['progress']>;
  resultPatch?: Partial<MissionResult>;
}

/**
 * Executes a single mission stage by calling existing public APIs only.
 * Performs no AI reasoning of its own.
 */
export class MissionPipeline {
  private logger = MissionLogger.getInstance();
  private scanner = WebsiteScanner.getInstance();
  private scanRepo = ScanRepository.getInstance();
  private intelligence = WebsiteIntelligenceEngine.getInstance();
  private ceo = CEOAgent.getInstance();
  private tasks = TaskEngine.getInstance();
  private collaboration = CollaborationEngine.getInstance();
  private runtime = AgentRuntime.getInstance();
  private memory = MemoryManager.getInstance();

  public async runStage(mission: Mission, stage: MissionStageId): Promise<StageOutcome> {
    this.logger.info(`Pipeline stage: ${stage}`, mission.id, stage);
    switch (stage) {
      case 'website_added':
        return this.stageWebsiteAdded(mission);
      case 'scanning':
        return this.stageScanning(mission);
      case 'website_intelligence':
        return this.stageIntelligence(mission);
      case 'ceo_planning':
        return this.stageCeoPlanning(mission);
      case 'task_creation':
        return this.stageTaskCreation(mission);
      case 'collaboration':
        return this.stageCollaboration(mission);
      case 'execution':
        return this.stageExecution(mission);
      case 'aggregation':
        return this.stageAggregation(mission);
      case 'memory_update':
        return this.stageMemoryUpdate(mission);
      case 'report_generation':
        return this.stageReportGeneration(mission);
      case 'completed':
        return { ok: true, summary: 'Mission completed.' };
      default:
        return { ok: false, summary: 'Unknown stage', errorMessage: `Unknown stage: ${stage}` };
    }
  }

  private stageWebsiteAdded(mission: Mission): StageOutcome {
    const w = mission.website;
    if (!w?.id || !w.domain || !w.url) {
      return {
        ok: false,
        summary: 'Website missing',
        errorMessage: 'Mission requires a valid website id, domain, and url.',
      };
    }
    return {
      ok: true,
      summary: `Website ready: ${w.name} (${w.domain})`,
      artifactIds: [w.id],
    };
  }

  private async stageScanning(mission: Mission): Promise<StageOutcome> {
    const website = MissionContext.toWebsiteItem(mission.website);
    const scan = await this.scanner.scan(website);
    if (scan.status !== 'completed') {
      return {
        ok: false,
        summary: 'Scan failed',
        errorMessage: scan.error_message || `Scan status: ${scan.status}`,
        artifactIds: [scan.id],
        patch: { scanId: scan.id },
      };
    }
    return {
      ok: true,
      summary: `Scan completed (${scan.id})`,
      artifactIds: [scan.id],
      patch: { scanId: scan.id },
    };
  }

  private stageIntelligence(mission: Mission): StageOutcome {
    const website = MissionContext.toWebsiteItem(mission.website);
    const scanId = mission.artifacts.scanId;
    if (!scanId) {
      return {
        ok: false,
        summary: 'No scan artifact',
        errorMessage: 'Website Intelligence requires a completed scan artifact.',
      };
    }

    const scans = this.scanRepo.listProcessed(website.id);
    const scan = scans.find((s) => s.id === scanId) || scans[0];
    if (!scan) {
      return {
        ok: false,
        summary: 'Scan not found for intelligence',
        errorMessage: `Could not load scan ${scanId} for Website Intelligence.`,
      };
    }

    const context = this.intelligence.analyzeScan(scan, website);
    return {
      ok: true,
      summary: `Intelligence context ${context.id} (score ${context.scores.overall})`,
      artifactIds: [context.id],
      patch: { intelligenceContextId: context.id },
    };
  }

  private async stageCeoPlanning(mission: Mission): Promise<StageOutcome> {
    const report = await this.ceo.runExecutiveAnalysis(mission.website.domain);
    const taskIds = (report.tasks || [])
      .map((t) => t.taskEngineId)
      .filter((id): id is string => Boolean(id));

    return {
      ok: true,
      summary: `CEO plan ${report.id} (health ${report.healthScores.overall}/100, ${report.tasks.length} tasks)`,
      artifactIds: [report.id, ...taskIds],
      patch: {
        ceoReportId: report.id,
        taskIds: [...new Set([...(mission.artifacts.taskIds || []), ...taskIds])],
      },
      progressPatch: {
        completedTasks: taskIds.length,
      },
    };
  }

  private stageTaskCreation(mission: Mission): StageOutcome {
    // CEO planning already creates Task Engine tickets; ensure mission tracking task exists.
    const existing = this.tasks
      .listTasks()
      .filter(
        (t) =>
          t.websiteDomain === mission.website.domain ||
          (mission.artifacts.taskIds || []).includes(t.id)
      );

    let createdId: string | undefined;
    if (existing.length === 0) {
      const created = this.tasks.createTask({
        title: `Mission: ${mission.goal.slice(0, 80)}`,
        description: `Orchestrated mission ${mission.id} for ${mission.website.domain}`,
        priority: 'high',
        category: 'Business',
        websiteDomain: mission.website.domain,
        websiteId: mission.website.id,
        requestedBy: 'Mission Orchestrator',
        approvalRequired: false,
        payload: { source: 'mission_orchestrator', missionId: mission.id },
      });
      createdId = created.id;
    }

    const allIds = [
      ...new Set([
        ...(mission.artifacts.taskIds || []),
        ...existing.map((t) => t.id),
        ...(createdId ? [createdId] : []),
      ]),
    ];

    return {
      ok: true,
      summary: `Task inventory ready (${allIds.length} tasks)`,
      artifactIds: allIds,
      patch: { taskIds: allIds },
      progressPatch: {
        completedTasks: this.tasks.listTasks().filter((t) => t.status === 'completed').length,
        failedTasks: this.tasks.listTasks().filter((t) => t.status === 'failed').length,
      },
    };
  }

  private async stageCollaboration(mission: Mission): Promise<StageOutcome> {
    const session = await this.collaboration.startCollaboration({
      title: `Mission Collaboration: ${mission.title}`,
      objective: mission.goal,
      domain: mission.website.domain,
      websiteId: mission.website.id,
      requestedBy: 'Mission Orchestrator',
      priority: 'high',
    });

    if (session.status === 'failed') {
      return {
        ok: false,
        summary: 'Collaboration failed',
        errorMessage: session.errorMessage || 'Collaboration session failed',
        artifactIds: [session.id],
        patch: { collaborationSessionId: session.id },
      };
    }

    const agents = session.participants.map((p) => p.agentName);
    return {
      ok: true,
      summary: `Collaboration ${session.id} completed (${session.participants.length} agents)`,
      artifactIds: [session.id, session.finalReport?.id].filter(Boolean) as string[],
      patch: { collaborationSessionId: session.id },
      progressPatch: { runningAgents: agents },
      resultPatch: {
        collaborationSessionId: session.id,
        collaborationReportId: session.finalReport?.id,
        keyFindings: session.finalReport?.keyFindings || [],
        recommendations: session.finalReport?.recommendations || [],
        confidenceScore: session.finalReport?.confidenceScore || 0,
      },
    };
  }

  private async stageExecution(mission: Mission): Promise<StageOutcome> {
    this.runtime.bootstrap();
    await this.runtime.startAll();

    const executionIds: string[] = [];
    const taskIds = mission.artifacts.taskIds || [];

    // Dispatch up to 3 pending mission-related tasks through Agent Runtime (public API)
    const pending = this.tasks
      .listTasks()
      .filter(
        (t) =>
          taskIds.includes(t.id) ||
          t.websiteDomain === mission.website.domain ||
          t.payload?.source === 'mission_orchestrator' ||
          t.payload?.source === 'ceo_strategic_planner' ||
          t.payload?.source === 'collaboration_engine'
      )
      .filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
      .slice(0, 3);

    for (const task of pending) {
      try {
        const exec = await this.runtime.receiveTask(
          {
            taskId: task.id,
            title: task.title,
            description: task.description,
            category: task.category,
            priority: task.priority,
            websiteId: task.websiteId || mission.website.id,
            websiteDomain: task.websiteDomain || mission.website.domain,
          },
          task.assignedAgentId
        );
        executionIds.push(exec.id);
      } catch (err) {
        this.logger.warn(
          `Runtime execution skipped for ${task.id}: ${err instanceof Error ? err.message : String(err)}`,
          mission.id,
          'execution'
        );
      }
    }

    // Also advance Task Engine queue using public API (may execute additional ready tasks)
    try {
      await this.tasks.processQueue();
    } catch (err) {
      this.logger.warn(
        `Task Engine processQueue: ${err instanceof Error ? err.message : String(err)}`,
        mission.id,
        'execution'
      );
    }

    const metrics = this.tasks.getMetrics();
    return {
      ok: true,
      summary: `Execution pass done (runtime runs=${executionIds.length}, TE completed=${metrics.completed}, failed=${metrics.failed})`,
      artifactIds: executionIds,
      patch: {
        runtimeExecutionIds: [
          ...new Set([...(mission.artifacts.runtimeExecutionIds || []), ...executionIds]),
        ],
      },
      progressPatch: {
        completedTasks: metrics.completed,
        failedTasks: metrics.failed,
        runningAgents: this.runtime
          .listAgents()
          .filter((a) => a.status === 'Busy' || a.status === 'Idle')
          .map((a) => a.name)
          .slice(0, 8),
      },
    };
  }

  private stageAggregation(mission: Mission): StageOutcome {
    const ceo = mission.artifacts.ceoReportId
      ? this.ceo.history.getReports().find((r) => r.id === mission.artifacts.ceoReportId)
      : this.ceo.getLatestStrategicPlan(mission.website.domain)
        ? this.ceo.history.getLatestReport()
        : this.ceo.history.getLatestReport();

    const collab = mission.artifacts.collaborationSessionId
      ? this.collaboration.getSession(mission.artifacts.collaborationSessionId)
      : undefined;

    const keyFindings = [
      ...(ceo?.recommendedPriorities || []).slice(0, 3),
      ...(collab?.finalReport?.keyFindings || []).slice(0, 3),
    ];
    const recommendations = [
      ...(ceo?.actionPlan || []).slice(0, 3),
      ...(collab?.finalReport?.recommendations || []).slice(0, 3),
    ];

    const confidence = Math.round(
      ((ceo?.confidenceScore || 0) + (collab?.finalReport?.confidenceScore || 0)) /
        (ceo && collab?.finalReport ? 2 : 1) || 70
    );

    const executiveSummary = [
      `Mission "${mission.title}" for ${mission.website.domain}.`,
      `Goal: ${mission.goal}.`,
      ceo ? `CEO health ${ceo.healthScores.overall}/100.` : '',
      collab?.finalReport ? `Collaboration: ${collab.finalReport.executiveSummary.slice(0, 180)}` : '',
      `Artifacts: scan=${mission.artifacts.scanId || 'n/a'}, WI=${mission.artifacts.intelligenceContextId || 'n/a'}, CEO=${mission.artifacts.ceoReportId || 'n/a'}, Collab=${mission.artifacts.collaborationSessionId || 'n/a'}.`,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      ok: true,
      summary: 'Aggregated CEO + Collaboration outputs',
      resultPatch: {
        executiveSummary,
        scanId: mission.artifacts.scanId,
        intelligenceContextId: mission.artifacts.intelligenceContextId,
        ceoReportId: mission.artifacts.ceoReportId,
        collaborationSessionId: mission.artifacts.collaborationSessionId,
        collaborationReportId: collab?.finalReport?.id,
        taskIds: mission.artifacts.taskIds || [],
        memoryItemIds: mission.artifacts.memoryItemIds || [],
        keyFindings,
        recommendations,
        confidenceScore: confidence,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private stageMemoryUpdate(mission: Mission): StageOutcome {
    const summary =
      mission.result?.executiveSummary ||
      `Mission ${mission.id} progress for ${mission.website.domain}: ${mission.goal}`;

    const item = this.memory.createMemoryItem({
      title: `Mission Memory: ${mission.title}`,
      description: summary.slice(0, 140) + '...',
      content: [
        summary,
        '',
        `Goal: ${mission.goal}`,
        `Domain: ${mission.website.domain}`,
        `Stages completed: ${mission.progress.completedStages}/${mission.progress.totalStages}`,
        `CEO: ${mission.artifacts.ceoReportId || 'n/a'}`,
        `Collaboration: ${mission.artifacts.collaborationSessionId || 'n/a'}`,
        `Tasks: ${(mission.artifacts.taskIds || []).join(', ') || 'none'}`,
      ].join('\n'),
      type: 'Project Memory',
      category: 'Reports',
      priority: 'High',
      visibility: 'Global',
      website: mission.website.domain,
      tags: ['Mission', 'Orchestrator', 'Memory Update'],
      source: 'Mission Orchestrator',
    });

    return {
      ok: true,
      summary: `Memory item ${item.id} stored`,
      artifactIds: [item.id],
      patch: {
        memoryItemIds: [...new Set([...(mission.artifacts.memoryItemIds || []), item.id])],
      },
      resultPatch: {
        memoryItemIds: [...new Set([...(mission.result?.memoryItemIds || []), item.id])],
      },
    };
  }

  private stageReportGeneration(mission: Mission): StageOutcome {
    const reportBody = [
      mission.result?.executiveSummary || `Mission report for ${mission.website.domain}`,
      '',
      'Key Findings:',
      ...(mission.result?.keyFindings || []).map((f) => `- ${f}`),
      '',
      'Recommendations:',
      ...(mission.result?.recommendations || []).map((r) => `- ${r}`),
      '',
      `Confidence: ${mission.result?.confidenceScore ?? 0}%`,
      `Scan: ${mission.artifacts.scanId || 'n/a'}`,
      `Intelligence: ${mission.artifacts.intelligenceContextId || 'n/a'}`,
      `CEO Report: ${mission.artifacts.ceoReportId || 'n/a'}`,
      `Collaboration: ${mission.artifacts.collaborationSessionId || 'n/a'}`,
    ].join('\n');

    // Reports surface is Memory category "Reports" in this codebase (no separate Reports engine API)
    const item = this.memory.createMemoryItem({
      title: `AI Company Mission Report (${mission.website.domain})`,
      description: (mission.result?.executiveSummary || mission.goal).slice(0, 140) + '...',
      content: reportBody,
      type: 'Project Memory',
      category: 'Reports',
      priority: 'Critical',
      visibility: 'Global',
      website: mission.website.domain,
      tags: ['Mission Report', 'Executive Report', 'Orchestrator'],
      source: 'Mission Orchestrator',
    });

    return {
      ok: true,
      summary: `Executive report ${item.id} published to Reports/Memory`,
      artifactIds: [item.id],
      patch: {
        memoryItemIds: [...new Set([...(mission.artifacts.memoryItemIds || []), item.id])],
      },
      resultPatch: {
        reportMemoryId: item.id,
        memoryItemIds: [...new Set([...(mission.result?.memoryItemIds || []), item.id])],
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
