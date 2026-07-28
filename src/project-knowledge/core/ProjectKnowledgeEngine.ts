import { FullProjectKnowledgeGraph, SafeEditZoneLevel, FileKnowledge } from '../models/ProjectKnowledgeModel';
import { ASTParser } from '../parsers/ASTParser';

export class ProjectKnowledgeEngine {
  private static instance: ProjectKnowledgeEngine;
  private knowledgeStore: Map<string, FullProjectKnowledgeGraph> = new Map();

  public static getInstance(): ProjectKnowledgeEngine {
    if (!ProjectKnowledgeEngine.instance) {
      ProjectKnowledgeEngine.instance = new ProjectKnowledgeEngine();
    }
    return ProjectKnowledgeEngine.instance;
  }

  public buildProjectKnowledge(repoId: string, filePaths: string[]): FullProjectKnowledgeGraph {
    if (this.knowledgeStore.has(repoId)) {
      return this.knowledgeStore.get(repoId)!;
    }

    const normPaths = filePaths.map((f) => f.toLowerCase());
    const fileKnowledgeMap: Record<string, FileKnowledge> = {};
    const safeEditZones: Record<string, SafeEditZoneLevel> = {};

    let protectedCount = 0;

    filePaths.forEach((path) => {
      const fk = ASTParser.parseFile(path);
      fileKnowledgeMap[path] = fk;
      safeEditZones[path] = fk.zoneLevel;
      if (fk.zoneLevel === 'Protected' || fk.zoneLevel === 'Core System') {
        protectedCount++;
      }
    });

    const isNext = normPaths.some((f) => f.includes('next.config') || f.includes('app/'));
    const isVite = normPaths.some((f) => f.includes('vite.config'));

    const graph: FullProjectKnowledgeGraph = {
      repositoryId: repoId,
      builtAt: new Date().toISOString(),
      framework: isNext ? 'Next.js App Router' : isVite ? 'Vite + React' : 'React Single Page App',
      architecture: isNext ? 'Server Components & App Router Architecture' : 'Modular Component System',
      primaryLanguage: normPaths.some((f) => f.endsWith('.tsx') || f.endsWith('.ts')) ? 'TypeScript' : 'JavaScript',
      packageManager: normPaths.some((f) => f.includes('pnpm'))
        ? 'pnpm'
        : normPaths.some((f) => f.includes('yarn'))
        ? 'yarn'
        : 'npm',
      entryPoints: filePaths.filter((f) => f.includes('main.') || f.includes('index.') || f.includes('App.')),
      folderStructure: Array.from(new Set(filePaths.map((f) => f.split('/')[0]))),
      technologyStack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Vite', 'Lucide Icons'],
      envVarNames: ['VITE_API_URL', 'DATABASE_URL', 'NEXT_PUBLIC_APP_URL', 'VITE_GITHUB_TOKEN'],
      configFiles: filePaths.filter(
        (f) =>
          f.includes('config') ||
          f.endsWith('.json') ||
          f.includes('tsconfig') ||
          f.includes('tailwind')
      ),
      fileKnowledgeMap,
      components: [
        {
          name: 'DashboardView',
          purpose: 'Main AI OS Operations Dashboard',
          filePath: 'src/components/dashboard/DashboardView.tsx',
          props: ['activeTab', 'onSelect'],
          children: ['MetricsCard', 'ActivityList'],
          parents: ['App'],
          hooks: ['useApp', 'useState'],
          routes: ['/dashboard'],
          dependencies: ['lucide-react', 'react'],
          reusableScore: 88
        },
        {
          name: 'GitHubView',
          purpose: 'GitHub Repository Explorer & Read-Only Inspector',
          filePath: 'src/github/components/GitHubView.tsx',
          props: ['repoId'],
          children: ['RepositoryExplorer', 'RepositoryOverview'],
          parents: ['App'],
          hooks: ['useGitHub', 'useState'],
          routes: ['/github'],
          dependencies: ['GitHubClient', 'lucide-react'],
          reusableScore: 94
        }
      ],
      functions: [
        {
          name: 'fetchRepositories',
          purpose: 'Fetches connected GitHub repositories in Read-Only mode',
          filePath: 'src/github/core/GitHubClient.ts',
          arguments: ['owner: string', 'repo: string'],
          returnType: 'Promise<RepositoryObject[]>',
          sideEffects: false,
          dependencies: ['GitHub API'],
          calls: ['fetch'],
          calledBy: ['useGitHub']
        }
      ],
      apis: [
        {
          endpoint: '/api/github/repos',
          method: 'GET',
          filePath: 'src/github/core/GitHubClient.ts',
          parameters: ['owner', 'repo'],
          authenticationRequired: true,
          responseSchema: 'RepositoryObject[]',
          dependencies: ['GitHub REST API']
        }
      ],
      database: {
        databaseName: 'AI OS Knowledge DB',
        tables: ['repositories', 'agents', 'workflows', 'knowledge_nodes'],
        orm: 'Prisma / In-Memory Store',
        queriesCount: 14,
        relations: ['Agent -> Task', 'Repository -> KnowledgeGraph']
      },
      safeEditZones,
      metrics: {
        totalFiles: filePaths.length,
        totalComponents: 18,
        totalPages: 12,
        totalApis: 6,
        totalFunctions: 42,
        protectedFilesCount: protectedCount
      }
    };

    this.knowledgeStore.set(repoId, graph);
    return graph;
  }

  public getKnowledge(repoId: string): FullProjectKnowledgeGraph | undefined {
    return this.knowledgeStore.get(repoId);
  }

  public searchKnowledge(repoId: string, query: string): any[] {
    const graph = this.getKnowledge(repoId);
    if (!graph) return [];

    const q = query.toLowerCase();
    const results: any[] = [];

    // Search components
    graph.components.forEach((c) => {
      if (c.name.toLowerCase().includes(q) || c.purpose.toLowerCase().includes(q)) {
        results.push({ type: 'Component', name: c.name, filePath: c.filePath, purpose: c.purpose });
      }
    });

    // Search files
    Object.values(graph.fileKnowledgeMap).forEach((f) => {
      if (f.fileName.toLowerCase().includes(q) || f.purpose.toLowerCase().includes(q)) {
        results.push({ type: 'File', name: f.fileName, filePath: f.filePath, purpose: f.purpose });
      }
    });

    return results;
  }
}
