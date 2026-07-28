import { ArchitectureNode, DependencyEdge } from '../models/ProjectKnowledge';

export class ArchitectureAnalyzer {
  public static buildGraph(filePaths: string[]): { nodes: ArchitectureNode[]; edges: DependencyEdge[] } {
    const nodes: ArchitectureNode[] = [];
    const edges: DependencyEdge[] = [];

    filePaths.forEach((path) => {
      const lower = path.toLowerCase();
      let type: ArchitectureNode['type'] = 'utility';

      if (lower.includes('page') || lower.includes('view') || lower.includes('app/')) type = 'page';
      else if (lower.includes('component') || lower.includes('ui/')) type = 'component';
      else if (lower.includes('service') || lower.includes('api/')) type = 'service';
      else if (lower.includes('hook') || lower.includes('use')) type = 'hook';

      const label = path.split('/').pop() || path;
      nodes.push({
        id: path,
        label,
        type,
        filePath: path
      });
    });

    // Generate edges
    nodes.forEach((n, idx) => {
      if (idx > 0 && n.type === 'component') {
        edges.push({
          from: n.id,
          to: nodes[0].id,
          relation: 'renders'
        });
      }
    });

    return { nodes, edges };
  }
}
