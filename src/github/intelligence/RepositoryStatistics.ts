import { RepositoryTreeNode } from '../types/RepositoryTree';
import { RepositoryFramework } from '../types/RepositoryFramework';
import { RepositoryPackageDetector, PackageManagerType } from './RepositoryPackageDetector';

export interface RepositoryStats {
  totalFiles: number;
  totalDirectories: number;
  repositorySizeKb: number;
  largestFiles: { path: string; sizeBytes: number }[];
  framework: RepositoryFramework;
  packageManager: PackageManagerType;
}

export class RepositoryStatistics {
  public static computeStats(
    nodes: RepositoryTreeNode[],
    framework: RepositoryFramework,
    sizeKb: number
  ): RepositoryStats {
    let filesCount = 0;
    let dirsCount = 0;
    const fileList: { path: string; sizeBytes: number }[] = [];
    const allPaths: string[] = [];

    const traverse = (list: RepositoryTreeNode[]) => {
      list.forEach((n) => {
        allPaths.push(n.path);
        if (n.type === 'file') {
          filesCount++;
          if (n.sizeBytes) {
            fileList.push({ path: n.path, sizeBytes: n.sizeBytes });
          }
        } else {
          dirsCount++;
          if (n.children) traverse(n.children);
        }
      });
    };

    traverse(nodes);

    fileList.sort((a, b) => b.sizeBytes - a.sizeBytes);
    const largestFiles = fileList.slice(0, 5);

    const packageManager = RepositoryPackageDetector.detect(allPaths);

    return {
      totalFiles: filesCount,
      totalDirectories: dirsCount,
      repositorySizeKb: sizeKb,
      largestFiles,
      framework,
      packageManager
    };
  }
}
