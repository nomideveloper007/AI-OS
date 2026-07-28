import { RepositoryCommit } from '../types/RepositoryCommit';

export class CommitHistoryManager {
  public static filterByBranch(commits: RepositoryCommit[], branch: string): RepositoryCommit[] {
    return commits.filter((c) => c.branch === branch || branch === 'main');
  }

  public static getLatestCommit(commits: RepositoryCommit[]): RepositoryCommit | undefined {
    return commits[0];
  }
}
