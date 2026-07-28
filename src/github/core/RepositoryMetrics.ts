import { RepositoryObject } from '../types/Repository';
import { RepositoryMetricsData } from '../types/RepositoryMetrics';

export class RepositoryMetricsCalculator {
  public static calculate(repo: RepositoryObject): RepositoryMetricsData {
    return {
      sizeKb: repo.metrics.sizeKb,
      filesCount: repo.metrics.filesCount,
      directoriesCount: repo.metrics.directoriesCount,
      languages: repo.metrics.languages,
      framework: repo.framework,
      defaultBranch: repo.defaultBranch,
      lastCommitDate: repo.pushedAt,
      contributorsCount: repo.metrics.contributorsCount
    };
  }
}
