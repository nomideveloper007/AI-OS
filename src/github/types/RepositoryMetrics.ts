import { RepositoryLanguage } from './RepositoryLanguage';
import { RepositoryFramework } from './RepositoryFramework';

export interface RepositoryMetricsData {
  sizeKb: number;
  filesCount: number;
  directoriesCount: number;
  languages: { name: RepositoryLanguage; percentage: number }[];
  framework: RepositoryFramework;
  defaultBranch: string;
  lastCommitDate: string;
  contributorsCount: number;
}
