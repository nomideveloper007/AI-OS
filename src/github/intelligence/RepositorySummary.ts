import { RepositoryFramework } from '../types/RepositoryFramework';
import { PackageManagerType } from './RepositoryPackageDetector';
import { StructureAnalysis } from './RepositoryStructureAnalyzer';
import { LanguageBreakdown } from './RepositoryLanguageDetector';

export interface ProjectSummaryObject {
  projectName: string;
  framework: RepositoryFramework;
  primaryLanguage: string;
  architecture: string;
  folderStructureSummary: string[];
  detectedTechnologies: string[];
  configurationFiles: string[];
  importantEntryPoints: string[];
  packageManager: PackageManagerType;
  languagesBreakdown: LanguageBreakdown[];
}

export class RepositorySummaryGenerator {
  public static generate(
    projectName: string,
    framework: RepositoryFramework,
    languages: LanguageBreakdown[],
    structure: StructureAnalysis,
    pkgManager: PackageManagerType,
    depsCount: number
  ): ProjectSummaryObject {
    const primary = languages[0]?.language || 'TypeScript';

    const techList: string[] = [framework, primary, pkgManager];
    if (structure.hasSrc) techList.push('src directory pattern');
    if (structure.hasPages) techList.push('Next.js / SSR pages router');
    if (structure.hasApp) techList.push('App router');
    if (structure.hasComponents) techList.push('Modular Component Architecture');
    if (depsCount > 0) techList.push(`${depsCount} npm dependencies`);

    const folderSummary: string[] = [];
    if (structure.hasSrc) folderSummary.push('src/ (Source code root)');
    if (structure.hasApp) folderSummary.push('app/ (App Router layouts & routes)');
    if (structure.hasPages) folderSummary.push('pages/ (Page routes)');
    if (structure.hasComponents) folderSummary.push('components/ (Reusable UI components)');
    if (structure.hasApi) folderSummary.push('api/ (Backend API routes)');
    if (structure.hasPublic) folderSummary.push('public/ (Static public assets)');

    const entryPoints: string[] = [];
    if (structure.entryPoint) entryPoints.push(structure.entryPoint);
    if (structure.readmePath) entryPoints.push(structure.readmePath);

    const architecture = structure.hasApp
      ? 'Modern App Router Architecture'
      : structure.hasPages
      ? 'Pages Router SSR Architecture'
      : structure.hasSrc
      ? 'Standard src/ Component Architecture'
      : 'Monolithic / Single Directory Structure';

    return {
      projectName,
      framework,
      primaryLanguage: primary,
      architecture,
      folderStructureSummary: folderSummary,
      detectedTechnologies: techList,
      configurationFiles: structure.configFiles.slice(0, 8),
      importantEntryPoints: entryPoints,
      packageManager: pkgManager,
      languagesBreakdown: languages
    };
  }
}
