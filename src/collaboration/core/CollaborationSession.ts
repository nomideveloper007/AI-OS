import type {
  CollaborationSession,
  CollaborationSessionStatus,
} from '../types/CollaborationSession';
import type { SharedContext } from '../types/SharedContext';
import type { AgentContribution } from '../types/AgentContribution';
import { SessionRepository } from '../repositories/SessionRepository';
import { CollaborationRepository } from '../repositories/CollaborationRepository';

/**
 * Mutable handle around a collaboration session record.
 */
export class CollaborationSessionHandle {
  private sessionRepo = SessionRepository.getInstance();
  private collabRepo = CollaborationRepository.getInstance();

  constructor(private session: CollaborationSession) {}

  public get raw(): CollaborationSession {
    return this.session;
  }

  public touch(status?: CollaborationSessionStatus): CollaborationSession {
    this.session = {
      ...this.session,
      status: status || this.session.status,
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public setSharedContext(ctx: SharedContext): CollaborationSession {
    this.session = {
      ...this.session,
      sharedContext: ctx,
      status: 'context_ready',
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public setParticipants(
    participants: CollaborationSession['participants']
  ): CollaborationSession {
    this.session = {
      ...this.session,
      participants,
      status: 'assigning',
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public addContribution(contribution: AgentContribution): CollaborationSession {
    const participants = this.session.participants.map((p) => {
      if (p.agentId !== contribution.agentId) return p;
      return {
        ...p,
        status: 'completed' as const,
        contributionIds: [...p.contributionIds, contribution.id],
      };
    });

    this.session = {
      ...this.session,
      participants,
      contributionIds: [...this.session.contributionIds, contribution.id],
      status: 'collaborating',
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public addMessageId(messageId: string): CollaborationSession {
    this.session = {
      ...this.session,
      messageIds: [...this.session.messageIds, messageId],
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public addConflictIds(ids: string[]): CollaborationSession {
    this.session = {
      ...this.session,
      conflictIds: [...new Set([...this.session.conflictIds, ...ids])],
      status: 'resolving_conflicts',
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public addConsensusIds(ids: string[]): CollaborationSession {
    this.session = {
      ...this.session,
      consensusIds: [...new Set([...this.session.consensusIds, ...ids])],
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public complete(report: CollaborationSession['finalReport']): CollaborationSession {
    this.session = {
      ...this.session,
      finalReport: report,
      status: 'completed',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public fail(message: string): CollaborationSession {
    this.session = {
      ...this.session,
      status: 'failed',
      errorMessage: message,
      updatedAt: new Date().toISOString(),
    };
    return this.sessionRepo.save(this.session);
  }

  public reload(): CollaborationSession | undefined {
    const fresh = this.sessionRepo.get(this.session.id);
    if (fresh) this.session = fresh;
    return fresh;
  }

  public bundle() {
    return this.collabRepo.getBundle(this.session.id);
  }
}

/** Alias matching requested module name CollaborationSession.ts */
export { CollaborationSessionHandle as CollaborationSession };
