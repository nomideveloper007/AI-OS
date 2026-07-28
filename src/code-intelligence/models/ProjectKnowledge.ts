export interface ComponentIntel {
  id: string;
  name: string;
  filePath: string;
  props: string[];
  hooks: string[];
  childComponents: string[];
  parentComponents: string[];
  reusableScore: number; // 0 - 100
}

export interface FunctionIntel {
  id: string;
  name: string;
  kind: 'function' | 'method' | 'class' | 'interface' | 'type' | 'enum';
  filePath: string;
  isExported: boolean;
  paramCount: number;
}

export interface RouteIntel {
  id: string;
  path: string;
  type: 'page' | 'api' | 'express' | 'react-router';
  filePath: string;
  method?: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  relation: 'imports' | 'renders' | 'calls' | 'uses-service';
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'page' | 'component' | 'service' | 'hook' | 'utility' | 'api';
  filePath: string;
}

export interface CodebaseMetrics {
  totalComponents: number;
  totalPages: number;
  totalRoutes: number;
  totalApis: number;
  totalFunctions: number;
  totalClasses: number;
  totalTypes: number;
  unusedFilesCount: number;
  circularImportsCount: number;
  brokenImportsCount: number;
}

export interface ProjectKnowledgeModel {
  repositoryId: string;
  analyzedAt: string;
  architecturePattern: string;
  entryPoints: string[];
  nodes: ArchitectureNode[];
  edges: DependencyEdge[];
  components: ComponentIntel[];
  functions: FunctionIntel[];
  routes: RouteIntel[];
  envVarNames: string[];
  configFiles: string[];
  metrics: CodebaseMetrics;
}
