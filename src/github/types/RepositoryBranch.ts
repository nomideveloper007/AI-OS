export interface RepositoryBranch {
  name: string;
  isDefault: boolean;
  latestCommitSha: string;
  protected: boolean;
}
