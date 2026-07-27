import type { CollaborationSession } from '../types/CollaborationSession';
import { CollaborationRepository } from './CollaborationRepository';

/**
 * Session-focused repository facade over CollaborationRepository.
 */
export class SessionRepository {
  private static instance: SessionRepository;
  private repo = CollaborationRepository.getInstance();

  private constructor() {}

  public static getInstance(): SessionRepository {
    if (!SessionRepository.instance) SessionRepository.instance = new SessionRepository();
    return SessionRepository.instance;
  }

  public save(session: CollaborationSession): CollaborationSession {
    return this.repo.saveSession(session);
  }

  public get(id: string): CollaborationSession | undefined {
    return this.repo.getSession(id);
  }

  public list(): CollaborationSession[] {
    return this.repo.listSessions();
  }

  public listActive(): CollaborationSession[] {
    return this.list().filter(
      (s) =>
        s.status !== 'completed' &&
        s.status !== 'failed' &&
        s.status !== 'cancelled'
    );
  }

  public listCompleted(): CollaborationSession[] {
    return this.list().filter((s) => s.status === 'completed');
  }
}
