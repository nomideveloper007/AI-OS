import { RepositoryTree, RepositoryTreeNode } from '../types/RepositoryTree';

export class RepositoryIndexer {
  public static indexTree(tree: RepositoryTree): { totalFiles: number; totalDirectories: number } {
    let files = 0;
    let dirs = 0;

    const traverse = (nodes: RepositoryTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.type === 'file') {
          files++;
        } else {
          dirs++;
          if (node.children) traverse(node.children);
        }
      });
    };

    traverse(tree.rootNodes);
    return { totalFiles: files, totalDirectories: dirs };
  }
}
