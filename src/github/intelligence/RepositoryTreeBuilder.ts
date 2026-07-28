import { RepositoryTreeNode } from '../types/RepositoryTree';

export class RepositoryTreeBuilder {
  public static buildNestedTree(flatNodes: RepositoryTreeNode[]): RepositoryTreeNode[] {
    const rootMap: Map<string, RepositoryTreeNode> = new Map();
    const roots: RepositoryTreeNode[] = [];

    // Helper to get or create parent folder nodes dynamically if missing
    const getOrCreateFolder = (path: string): RepositoryTreeNode => {
      let existing = rootMap.get(path);
      if (!existing) {
        const name = path.split('/').pop() || path;
        existing = {
          name,
          path,
          type: 'directory',
          sha: `folder-${path}`,
          children: []
        };
        rootMap.set(path, existing);

        const parts = path.split('/');
        if (parts.length > 1) {
          const parentPath = parts.slice(0, parts.length - 1).join('/');
          const parent = getOrCreateFolder(parentPath);
          if (!parent.children) parent.children = [];
          if (!parent.children.some((c) => c.path === path)) {
            parent.children.push(existing);
          }
        } else {
          if (!roots.some((r) => r.path === path)) {
            roots.push(existing);
          }
        }
      }
      return existing;
    };

    flatNodes.forEach((node) => {
      const copy: RepositoryTreeNode = {
        ...node,
        children: node.type === 'directory' ? (node.children || []) : undefined
      };
      rootMap.set(node.path, copy);

      const parts = node.path.split('/');
      if (parts.length === 1) {
        if (!roots.some((r) => r.path === node.path)) {
          roots.push(copy);
        }
      } else {
        const parentPath = parts.slice(0, parts.length - 1).join('/');
        const parentFolder = getOrCreateFolder(parentPath);
        if (!parentFolder.children) parentFolder.children = [];
        if (!parentFolder.children.some((c) => c.path === node.path)) {
          parentFolder.children.push(copy);
        }
      }
    });

    return roots;
  }
}
