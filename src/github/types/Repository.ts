import { RepositoryBranch } from './RepositoryBranch';
import { RepositoryMetricsData } from './RepositoryMetrics';
import { RepositoryLanguage } from './RepositoryLanguage';
import { RepositoryFramework } from './RepositoryFramework';

export interface RepositoryObject {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  description: string;
  isPrivate: boolean;
  defaultBranch: string;
  htmlUrl: string;
  cloneUrl: string;
  starsCount: number;
  forksCount: number;
  openIssuesCount: number;
  primaryLanguage: RepositoryLanguage;
  framework: RepositoryFramework;
  metrics: RepositoryMetricsData;
  branches: RepositoryBranch[];
  readmeContent?: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
}
