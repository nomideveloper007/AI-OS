import { RepositoryTreeNode } from '../types/RepositoryTree';

export interface SearchFilterOptions {
  query?: string;
  extension?: string;
  folder?: string;
}

export class RepositorySearch {
  public static search(nodes: RepositoryTreeNode[], filter: SearchFilterOptions): RepositoryTreeNode[] {
    const results: RepositoryTreeNode[] = [];
    const q = filter.query?.toLowerCase() || '';
    const extFilter = filter.extension?.toLowerCase().replace('.', '') || '';
    const folderFilter = filter.folder?.toLowerCase() || '';

    const traverse = (list: RepositoryTreeNode[]) => {
      list.forEach((node) => {
        if (node.type === 'file') {
          const nameMatch = !q || node.name.toLowerCase().includes(q) || node.path.toLowerCase().includes(q);
          const ext = node.name.split('.').pop()?.toLowerCase() || '';
          const extMatch = !extFilter || ext === extFilter;
          const folderMatch = !folderFilter || node.path.toLowerCase().includes(folderFilter);

          if (nameMatch && extMatch && folderMatch) {
            results.push(node);
          }
        }

        if (node.children) {
          traverse(node.children);
        }
      });
    };

    traverse(nodes);
    return results;
  }
}
