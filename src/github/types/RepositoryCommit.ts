export interface RepositoryCommit {
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  authorAvatarUrl: string;
  date: string;
  branch: string;
}
