import { RepositoryTreeNode } from '../types/RepositoryTree';

export class RepositoryExplorerCore {
  public static getNodeByPath(rootNodes: RepositoryTreeNode[], path: string): RepositoryTreeNode | undefined {
    const parts = path.split('/').filter(Boolean);
    let currentNodes = rootNodes;
    let found: RepositoryTreeNode | undefined = undefined;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      found = currentNodes.find((n) => n.name === part);
      if (!found) return undefined;
      if (i < parts.length - 1) {
        if (found.children) {
          currentNodes = found.children;
        } else {
          return undefined;
        }
      }
    }

    return found;
  }
}
