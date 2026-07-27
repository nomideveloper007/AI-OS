import { CollaborationManager, type CreateCollaborationInput } from './CollaborationManager';
import { CollaborationLogger } from './CollaborationLogger';
import type { CollaborationSession, CollaborationSessionBundle } from '../types/CollaborationSession';
import type { AgentMessage } from '../types/AgentMessage';
import { AgentMessenger } from './AgentMessenger';
import { SessionRepository } from '../repositories/SessionRepository';
import { TaskEngine } from '../../task-engine/core/TaskEngine';

/**
 * Collaboration Engine facade.
 * Coordinates multi-agent work on one objective.
 * Engine does not invent strategy itself — each employee contribution goes through AI Engine;
 * this layer merges, resolves conflicts, and publishes one report.
 *
 * Architecture: CEO → Task Engine → Collaboration Engine → Agent Runtime → Employees → Memory → Reports
 */
export class CollaborationEngine {
  private static instance: CollaborationEngine;

  private manager = CollaborationManager.getInstance();
  private logger = CollaborationLogger.getInstance();
  private messenger = new AgentMessenger();
  private sessions = SessionRepository.getInstance();
  private taskEngine = TaskEngine.getInstance();

  private constructor() {
    this.logger.info('Collaboration Engine ready');
  }

  public static getInstance(): CollaborationEngine {
    if (!CollaborationEngine.instance) {
      CollaborationEngine.instance = new CollaborationEngine();
    }
    return CollaborationEngine.instance;
  }

  /** Create a collaboration session (optionally mirrored as a Task Engine ticket). */
  public createSession(input: CreateCollaborationInput): CollaborationSession {
    let sourceTaskEngineId = input.sourceTaskEngineId;

    if (!sourceTaskEngineId) {
      try {
        const task = this.taskEngine.createTask({
          title: `Collaboration: ${input.title}`,
          description: input.objective,
          priority: input.priority === 'critical' ? 'critical' : input.priority || 'high',
          category: 'Business',
          websiteDomain: input.domain,
          websiteId: input.websiteId,
          requestedBy: input.requestedBy || 'Collaboration Engine',
          approvalRequired: false,
          payload: {
            source: 'collaboration_engine',
            planOnlyCoordination: true,
          },
        });
        sourceTaskEngineId = task.id;
      } catch (err) {
        this.logger.warn(
          `Task Engine mirror skipped: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    return this.manager.createSession({
      ...input,
      sourceTaskEngineId,
    });
  }

  /** Create session, assign agents from registry, build context, run pipeline. */
  public async startCollaboration(input: CreateCollaborationInput): Promise<CollaborationSession> {
    const session = this.createSession(input);
    this.manager.assignAgents(session, input.agentIds);
    return this.manager.runSession(session.id);
  }

  public async runSession(sessionId: string): Promise<CollaborationSession> {
    return this.manager.runSession(sessionId);
  }

  public assignAgents(sessionId: string, agentIds?: string[]): CollaborationSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session not found: ${sessionId}`);
    return this.manager.assignAgents(session, agentIds);
  }

  public listSessions(): CollaborationSession[] {
    return this.manager.listSessions();
  }

  public listActiveSessions(): CollaborationSession[] {
    return this.sessions.listActive();
  }

  public getSession(id: string): CollaborationSession | undefined {
    return this.manager.getSession(id);
  }

  public getBundle(id: string): CollaborationSessionBundle | undefined {
    return this.manager.getBundle(id);
  }

  public getMessages(sessionId: string): AgentMessage[] {
    return this.messenger.list(sessionId);
  }

  public getLogs(sessionId?: string) {
    return this.manager.getLogs(sessionId);
  }

  public getLogger(): CollaborationLogger {
    return this.logger;
  }
}
