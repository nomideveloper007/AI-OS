import { AgentManager } from '../../agents/core/AgentManager';
import { AgentRegistry } from '../../agents/core/AgentRegistry';
import { MemoryEngine } from '../../memory/core/MemoryEngine';
import { WebsiteIntelligenceEngine } from '../../intelligence/core/WebsiteIntelligenceEngine';
import { WebsiteContextRepository } from '../../intelligence/repositories/WebsiteContextRepository';
import { TaskEngine } from '../../task-engine/core/TaskEngine';
import type { CollaborationTask, CollaborationPriority } from '../types/CollaborationTask';
import type { CollaborationSession } from '../types/CollaborationSession';
import type { SharedContext } from '../types/SharedContext';
import { SessionRepository } from '../repositories/SessionRepository';
import { CollaborationSessionHandle } from './CollaborationSession';
import { DependencyResolver } from './DependencyResolver';
import { AgentCoordinator } from './AgentCoordinator';
import { AgentMessenger } from './AgentMessenger';
import { ConflictResolver } from './ConflictResolver';
import { ConsensusEngine } from './ConsensusEngine';
import { ResultAggregator } from './ResultAggregator';
import { CollaborationLogger } from './CollaborationLogger';
import { CollaborationRepository } from '../repositories/CollaborationRepository';

export type CreateCollaborationInput = {
  title: string;
  objective: string;
  domain?: string;
  websiteId?: string;
  requestedBy?: string;
  priority?: CollaborationPriority;
  sourceTaskEngineId?: string;
  preferredRoles?: string[];
  requiredCapabilities?: string[];
  /** Optional explicit agent IDs from registry; otherwise auto-select. */
  agentIds?: string[];
};

/**
 * Manages collaboration session lifecycle and orchestration steps.
 */
export class CollaborationManager {
  private static instance: CollaborationManager;

  private agentManager = AgentManager.getInstance();
  private registry = AgentRegistry.getInstance();
  private memory = MemoryEngine.getInstance();
  private intelligence = WebsiteIntelligenceEngine.getInstance();
  private contextRepo = WebsiteContextRepository.getInstance();
  private tasks = TaskEngine.getInstance();
  private sessions = SessionRepository.getInstance();
  private repo = CollaborationRepository.getInstance();

  private dependencies = new DependencyResolver();
  private coordinator = new AgentCoordinator();
  private messenger = new AgentMessenger();
  private conflicts = new ConflictResolver();
  private consensus = new ConsensusEngine();
  private aggregator = new ResultAggregator();
  private logger = CollaborationLogger.getInstance();

  public static getInstance(): CollaborationManager {
    if (!CollaborationManager.instance) {
      CollaborationManager.instance = new CollaborationManager();
    }
    return CollaborationManager.instance;
  }

  public createSession(input: CreateCollaborationInput): CollaborationSession {
    // Ensure Agent Registry is seeded so future agents can also register later
    this.agentManager.listAgents();

    const now = new Date().toISOString();
    const task: CollaborationTask = {
      id: `ctask-${Date.now()}`,
      title: input.title,
      objective: input.objective,
      priority: input.priority || 'high',
      domain: input.domain,
      websiteId: input.websiteId,
      requestedBy: input.requestedBy || 'CEO / Operator',
      sourceTaskEngineId: input.sourceTaskEngineId,
      requiredCapabilities: input.requiredCapabilities,
      preferredRoles: input.preferredRoles,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    };

    const session: CollaborationSession = {
      id: `csess-${Date.now()}`,
      title: input.title,
      objective: input.objective,
      status: 'created',
      task,
      participants: [],
      contributionIds: [],
      messageIds: [],
      conflictIds: [],
      consensusIds: [],
      createdAt: now,
      updatedAt: now,
    };

    this.sessions.save(session);
    this.messenger.broadcastSystem(
      session.id,
      'Session created',
      `Collaboration started for objective: ${input.objective}`
    );
    this.logger.success(`Session ${session.id} created`, session.id);
    return session;
  }

  public buildSharedContext(session: CollaborationSession): SharedContext {
    const domain = session.task.domain;
    const websiteContextEntity = domain
      ? this.contextRepo.getLatestForDomain(domain) || this.contextRepo.listAll()[0]
      : this.contextRepo.listAll()[0];

    const websiteContext = websiteContextEntity
      ? this.intelligence.buildAgentContext(websiteContextEntity)
      : undefined;

    const memoryHits = domain
      ? [
          ...this.memory.searchMemories({ query: domain, category: 'Reports' }).slice(0, 5),
          ...this.memory.searchMemories({ query: domain }).slice(0, 5),
        ]
      : this.memory.searchMemories({ query: session.objective }).slice(0, 8);

    const uniqueMem = new Map(memoryHits.map((m) => [m.id, m]));
    const memorySnippets = Array.from(uniqueMem.values())
      .slice(0, 10)
      .map((m) => ({
        id: m.id,
        title: m.title,
        snippet: (m.content || m.description || '').slice(0, 200),
        category: m.category,
      }));

    const priorReports = memorySnippets
      .filter((m) => m.category === 'Reports')
      .map((m) => ({ id: m.id, title: m.title, snippet: m.snippet }));

    const taskHints = this.tasks
      .listTasks()
      .filter((t) => !domain || t.websiteDomain === domain)
      .slice(0, 12)
      .map((t) => ({ id: t.id, title: t.title, status: t.status }));

    const ctx: SharedContext = {
      sessionId: session.id,
      domain: websiteContextEntity?.domain || domain,
      websiteId: websiteContextEntity?.websiteId || session.task.websiteId,
      objective: session.objective,
      businessGoals: [session.objective],
      memorySnippets,
      websiteContext,
      websiteSummary: websiteContextEntity?.summary?.overview
        ? websiteContextEntity.summary.overview.slice(0, 280)
        : undefined,
      priorReports,
      taskHints,
      builtAt: new Date().toISOString(),
      sourceNotes: {
        memoryLoaded: memorySnippets.length,
        websiteIntelligenceLoaded: Boolean(websiteContext),
        reportsLoaded: priorReports.length,
        tasksLoaded: taskHints.length,
      },
    };

    this.logger.info(
      `Shared context built (memory=${ctx.sourceNotes.memoryLoaded}, wi=${ctx.sourceNotes.websiteIntelligenceLoaded})`,
      session.id
    );
    return ctx;
  }

  public assignAgents(
    session: CollaborationSession,
    agentIds?: string[]
  ): CollaborationSession {
    const all = this.registry.getAll();
    let ordered = agentIds?.length
      ? this.dependencies.orderAgents(all.filter((a) => agentIds.includes(a.id)))
      : this.dependencies.resolveOrder(all, session.task);

    if (ordered.length === 0) {
      ordered = this.dependencies.orderAgents(all).slice(0, 4);
    }

    const handle = new CollaborationSessionHandle(session);
    const participants = this.coordinator.buildParticipants(
      ordered,
      ordered.map((a) => a.id)
    );
    const updated = handle.setParticipants(participants);

    this.messenger.broadcastSystem(
      session.id,
      'Agents assigned',
      `Participating: ${participants.map((p) => p.agentName).join(', ')}`
    );

    // Request info from first specialist to seed conversation
    if (participants[0]) {
      this.messenger.send({
        sessionId: session.id,
        fromAgentId: participants[0].agentId,
        fromAgentName: participants[0].agentName,
        type: 'request_info',
        subject: 'Request shared context',
        body: 'Please use the single shared collaboration context — do not re-query Memory or Website Intelligence.',
      });
    }

    this.logger.info(`Assigned ${participants.length} agents`, session.id);
    return updated;
  }

  /**
   * Runs full collaboration pipeline.
   * Engine coordinates; each employee contribution calls AI Engine (OmniRoute).
   */
  public async runSession(sessionId: string): Promise<CollaborationSession> {
    const existing = this.sessions.get(sessionId);
    if (!existing) throw new Error(`Session not found: ${sessionId}`);

    const handle = new CollaborationSessionHandle(existing);

    try {
      handle.touch('collaborating');
      const ctx = this.buildSharedContext(handle.raw);
      handle.setSharedContext(ctx);

      let session = handle.raw;
      if (session.participants.length === 0) {
        session = this.assignAgents(session);
        handle.reload();
      }

      session = handle.raw;
      if (!session.sharedContext) throw new Error('Shared context missing');

      this.messenger.broadcastSystem(
        session.id,
        'AI contributions starting',
        `Calling AI Engine for ${session.participants.length} agent(s) via OmniRoute…`
      );

      for (const participant of session.participants) {
        // Clarification message before contribution
        this.messenger.send({
          sessionId: session.id,
          fromAgentId: participant.agentId,
          fromAgentName: participant.agentName,
          type: 'ask_clarification',
          subject: `Clarifying role for ${participant.agentRole}`,
          body: `Confirming assignment order #${participant.order} for objective: ${session.objective}`,
        });

        const contribution = await this.coordinator.collectContribution(
          session.id,
          participant,
          session.sharedContext,
          session.objective
        );
        handle.addContribution(contribution);
      }

      session = handle.reload() || handle.raw;
      const contributions = this.repo.listContributions(session.id);

      handle.touch('resolving_conflicts');
      const detected = this.conflicts.detectConflicts(session.id, contributions);
      handle.addConflictIds(detected.map((c) => c.id));
      const resolved = this.conflicts.resolveAll(session.id);

      handle.touch('aggregating');
      const consensusList = this.consensus.formAll(session.id, contributions);
      handle.addConsensusIds(consensusList.map((c) => c.id));

      const report = this.aggregator.aggregate({
        session: handle.raw,
        contributions,
        conflicts: resolved,
        consensus: consensusList,
        persistToMemory: true,
      });

      const completed = handle.complete(report);
      this.messenger.broadcastSystem(
        completed.id,
        'Final report ready',
        report.executiveSummary.slice(0, 280)
      );
      this.logger.success(`Session ${completed.id} completed`, completed.id);
      return completed;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(message, sessionId);
      return handle.fail(message);
    }
  }

  public listSessions(): CollaborationSession[] {
    return this.sessions.list();
  }

  public getSession(id: string): CollaborationSession | undefined {
    return this.sessions.get(id);
  }

  public getBundle(id: string) {
    return this.repo.getBundle(id);
  }

  public getLogs(sessionId?: string) {
    return this.logger.getLogs(sessionId);
  }
}
