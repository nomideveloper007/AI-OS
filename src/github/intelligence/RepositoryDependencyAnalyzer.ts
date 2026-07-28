export interface DependencyAnalysis {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  totalCount: number;
}

export class RepositoryDependencyAnalyzer {
  public static parsePackageJson(packageJsonContent?: string): DependencyAnalysis {
    if (!packageJsonContent) {
      return { dependencies: {}, devDependencies: {}, totalCount: 0 };
    }

    try {
      const pkg = JSON.parse(packageJsonContent);
      const deps = pkg.dependencies || {};
      const devDeps = pkg.devDependencies || {};
      const totalCount = Object.keys(deps).length + Object.keys(devDeps).length;

      return {
        dependencies: deps,
        devDependencies: devDeps,
        totalCount
      };
    } catch (err) {
      return { dependencies: {}, devDependencies: {}, totalCount: 0 };
    }
  }
}
