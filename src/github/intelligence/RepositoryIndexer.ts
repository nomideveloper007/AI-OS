import { RepositoryTreeNode } from '../types/RepositoryTree';

export class RepositoryIndexerIntelligence {
  private fileIndex: Map<string, RepositoryTreeNode> = new Map();

  public indexNodes(nodes: RepositoryTreeNode[]): void {
    this.fileIndex.clear();

    const traverse = (list: RepositoryTreeNode[]) => {
      list.forEach((node) => {
        this.fileIndex.set(node.path, node);
        if (node.children) traverse(node.children);
      });
    };

    traverse(nodes);
  }

  public getByPath(path: string): RepositoryTreeNode | undefined {
    return this.fileIndex.get(path);
  }

  public getAllPaths(): string[] {
    return Array.from(this.fileIndex.keys());
  }
}
