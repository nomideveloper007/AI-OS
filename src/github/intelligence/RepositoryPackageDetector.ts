export type PackageManagerType = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'composer' | 'pip' | 'cargo' | 'go' | 'unknown';

export class RepositoryPackageDetector {
  public static detect(filePaths: string[]): PackageManagerType {
    const fileSet = new Set(filePaths.map((f) => f.toLowerCase()));

    if (fileSet.has('bun.lockb')) return 'bun';
    if (fileSet.has('pnpm-lock.yaml')) return 'pnpm';
    if (fileSet.has('yarn.lock')) return 'yarn';
    if (fileSet.has('package-lock.json') || fileSet.has('package.json')) return 'npm';
    if (fileSet.has('composer.lock') || fileSet.has('composer.json')) return 'composer';
    if (fileSet.has('cargo.lock') || fileSet.has('cargo.toml')) return 'cargo';
    if (fileSet.has('go.mod')) return 'go';
    if (fileSet.has('requirements.txt') || fileSet.has('pipfile')) return 'pip';

    return 'npm';
  }
}
