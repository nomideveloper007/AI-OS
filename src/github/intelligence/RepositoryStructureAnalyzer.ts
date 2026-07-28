export interface StructureAnalysis {
  hasSrc: boolean;
  hasPages: boolean;
  hasApp: boolean;
  hasComponents: boolean;
  hasApi: boolean;
  hasPublic: boolean;
  hasAssets: boolean;
  configFiles: string[];
  envFiles: string[];
  readmePath?: string;
  licensePath?: string;
  entryPoint?: string;
}

export class RepositoryStructureAnalyzer {
  public static analyze(filePaths: string[]): StructureAnalysis {
    const normPaths = filePaths.map((f) => f.toLowerCase());

    const hasSrc = normPaths.some((p) => p.startsWith('src/'));
    const hasPages = normPaths.some((p) => p.includes('pages/'));
    const hasApp = normPaths.some((p) => p.includes('app/'));
    const hasComponents = normPaths.some((p) => p.includes('components/'));
    const hasApi = normPaths.some((p) => p.includes('api/'));
    const hasPublic = normPaths.some((p) => p.includes('public/'));
    const hasAssets = normPaths.some((p) => p.includes('assets/'));

    const configFiles = filePaths.filter((p) => {
      const lower = p.toLowerCase();
      return (
        lower.includes('config.') ||
        lower.endsWith('.json') ||
        lower.includes('tsconfig') ||
        lower.includes('tailwind') ||
        lower.includes('webpack') ||
        lower.includes('docker')
      );
    });

    // Extract env file names ONLY (NEVER secrets)
    const envFiles = filePaths
      .filter((p) => p.toLowerCase().includes('.env'))
      .map((p) => p.split('/').pop() || p);

    const readmePath = filePaths.find((p) => p.toLowerCase().startsWith('readme'));
    const licensePath = filePaths.find((p) => p.toLowerCase().startsWith('license'));

    let entryPoint = filePaths.find((p) => {
      const lower = p.toLowerCase();
      return (
        lower.endsWith('main.tsx') ||
        lower.endsWith('main.js') ||
        lower.endsWith('index.tsx') ||
        lower.endsWith('index.ts') ||
        lower.endsWith('index.js') ||
        lower.endsWith('app.tsx')
      );
    });

    return {
      hasSrc,
      hasPages,
      hasApp,
      hasComponents,
      hasApi,
      hasPublic,
      hasAssets,
      configFiles,
      envFiles,
      readmePath,
      licensePath,
      entryPoint
    };
  }
}
