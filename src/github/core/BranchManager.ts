import { RepositoryBranch } from '../types/RepositoryBranch';

export class BranchManager {
  public static getDefaultBranch(branches: RepositoryBranch[]): RepositoryBranch | undefined {
    return branches.find((b) => b.isDefault) || branches[0];
  }

  public static findBranchByName(branches: RepositoryBranch[], name: string): RepositoryBranch | undefined {
    return branches.find((b) => b.name === name);
  }
}
