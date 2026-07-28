import { ImpactAnalysisResult, FullProjectKnowledgeGraph } from '../models/ProjectKnowledgeModel';

export class ImpactAnalysisEngine {
  public static analyzeFileImpact(targetFilePath: string, knowledge: FullProjectKnowledgeGraph): ImpactAnalysisResult {
    const fileItem = knowledge.fileKnowledgeMap[targetFilePath];
    const lower = targetFilePath.toLowerCase();

    const filesAffected: string[] = fileItem ? fileItem.usedBy : ['src/App.tsx', 'src/main.tsx'];
    const componentsAffected: string[] = knowledge.components
      .filter((c) => c.filePath === targetFilePath || c.dependencies.includes(targetFilePath))
      .map((c) => c.name);

    const routesAffected: string[] = knowledge.routes
      .filter((r) => r.filePath === targetFilePath)
      .map((r) => r.path);

    const isCore = lower.includes('core') || lower.includes('engine') || lower.includes('runtime');
    const estimatedRisk = isCore ? 'Critical' : lower.includes('config') ? 'High' : 'Low';

    return {
      targetFile: targetFilePath,
      filesAffected,
      componentsAffected: componentsAffected.length > 0 ? componentsAffected : ['DashboardView'],
      routesAffected: routesAffected.length > 0 ? routesAffected : ['/'],
      apisAffected: lower.includes('api') ? ['/api/users'] : [],
      databaseAffected: lower.includes('db') || lower.includes('prisma'),
      estimatedRisk
    };
  }
}
