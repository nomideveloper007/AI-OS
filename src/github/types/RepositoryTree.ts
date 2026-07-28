import { RepositoryFile } from './RepositoryFile';
import { RepositoryDirectory } from './RepositoryDirectory';

export interface RepositoryTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  sizeBytes?: number;
  sha: string;
  children?: RepositoryTreeNode[];
}

export interface RepositoryTree {
  repositoryId: string;
  branch: string;
  rootNodes: RepositoryTreeNode[];
}
