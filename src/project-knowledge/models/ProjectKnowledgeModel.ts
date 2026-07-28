export type SafeEditZoneLevel = 'Safe' | 'Review Required' | 'Protected' | 'Core System';

export interface FileKnowledge {
  filePath: string;
  fileName: string;
  purpose: string;
  description: string;
  exports: string[];
  imports: string[];
  dependencies: string[];
  dependents: string[];
  functions: string[];
  classes: string[];
  interfaces: string[];
  types: string[];
  usedBy: string[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  complexityScore: number;
  safeToModify: boolean;
  zoneLevel: SafeEditZoneLevel;
  ownerModule: string;
}

export interface ComponentKnowledgeItem {
  name: string;
  purpose: string;
  filePath: string;
  props: string[];
  children: string[];
  parents: string[];
  hooks: string[];
  routes: string[];
  dependencies: string[];
  reusableScore: number;
}

export interface FunctionKnowledgeItem {
  name: string;
  purpose: string;
  filePath: string;
  arguments: string[];
  returnType: string;
  sideEffects: boolean;
  dependencies: string[];
  calls: string[];
  calledBy: string[];
}

export interface APIKnowledgeItem {
  endpoint: string;
  method: string;
  filePath: string;
  parameters: string[];
  authenticationRequired: boolean;
  responseSchema: string;
  dependencies: string[];
}

export interface DatabaseKnowledgeItem {
  databaseName: string;
  tables: string[];
  orm: string;
  queriesCount: number;
  relations: string[];
}

export interface ImpactAnalysisResult {
  targetFile: string;
  filesAffected: string[];
  componentsAffected: string[];
  routesAffected: string[];
  apisAffected: string[];
  databaseAffected: boolean;
  estimatedRisk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface FullProjectKnowledgeGraph {
  repositoryId: string;
  builtAt: string;
  framework: string;
  architecture: string;
  primaryLanguage: string;
  packageManager: string;
  entryPoints: string[];
  folderStructure: string[];
  technologyStack: string[];
  envVarNames: string[];
  configFiles: string[];
  fileKnowledgeMap: Record<string, FileKnowledge>;
  components: ComponentKnowledgeItem[];
  functions: FunctionKnowledgeItem[];
  apis: APIKnowledgeItem[];
  database: DatabaseKnowledgeItem;
  safeEditZones: Record<string, SafeEditZoneLevel>;
  metrics: {
    totalFiles: number;
    totalComponents: number;
    totalPages: number;
    totalApis: number;
    totalFunctions: number;
    protectedFilesCount: number;
  };
}
