import React from 'react';
import { RepositoryObject } from '../types/Repository';
import { RepositoryTree, RepositoryTreeNode } from '../types/RepositoryTree';
import { RepositoryMetricsCard } from './RepositoryMetricsCard';
import { RepositoryFrameworkDetector } from '../intelligence/RepositoryFrameworkDetector';
import { RepositoryLanguageDetector } from '../intelligence/RepositoryLanguageDetector';
import { RepositoryPackageDetector } from '../intelligence/RepositoryPackageDetector';
import { RepositoryStructureAnalyzer } from '../intelligence/RepositoryStructureAnalyzer';
import { RepositorySummaryGenerator } from '../intelligence/RepositorySummary';
import { BookOpen, Cpu, Code, CheckCircle2, Box } from 'lucide-react';

interface RepositoryOverviewProps {
  repo: RepositoryObject;
  tree?: RepositoryTree;
}

export const RepositoryOverview: React.FC<RepositoryOverviewProps> = ({ repo, tree }) => {
  // Flatten tree to get all real file paths
  const allFilePaths: string[] = [];
  if (tree && tree.rootNodes && tree.rootNodes.length > 0) {
    const traverse = (nodes: RepositoryTreeNode[]) => {
      nodes.forEach((n) => {
        allFilePaths.push(n.path);
        if (n.children) traverse(n.children);
      });
    };
    traverse(tree.rootNodes);
  }

  const filePathsToAnalyze =
    allFilePaths.length > 0
      ? allFilePaths
      : ['src/App.tsx', 'src/main.tsx', 'package.json', 'README.md', 'vite.config.ts', 'tsconfig.json', 'src/index.css'];

  const framework = RepositoryFrameworkDetector.detect(filePathsToAnalyze, repo.readmeContent);
  const languages = RepositoryLanguageDetector.calculateBreakdown(filePathsToAnalyze);
  const pkgManager = RepositoryPackageDetector.detect(filePathsToAnalyze);
  const structure = RepositoryStructureAnalyzer.analyze(filePathsToAnalyze);
  const hasTailwind = RepositoryFrameworkDetector.isTailwindUsed(filePathsToAnalyze);

  const summary = RepositorySummaryGenerator.generate(
    repo.fullName,
    framework,
    languages,
    structure,
    pkgManager,
    repo.metrics.filesCount
  );

  if (hasTailwind && !summary.detectedTechnologies.includes('Tailwind CSS')) {
    summary.detectedTechnologies.push('Tailwind CSS');
  }

  return (
    <div className="space-y-6 text-xs animate-fade-in">
      {/* Metrics Card */}
      <RepositoryMetricsCard metrics={repo.metrics} />

      {/* Language Breakdown Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
          <Code className="w-4 h-4 text-[#4F46E5]" />
          Language Breakdown & Composition
        </h3>

        {/* Visual Bar */}
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
          {languages.map((lang, idx) => (
            <div
              key={lang.language}
              style={{ width: `${lang.percentage}%` }}
              className={`h-full ${
                idx === 0
                  ? 'bg-[#4F46E5]'
                  : idx === 1
                  ? 'bg-blue-500'
                  : idx === 2
                  ? 'bg-purple-500'
                  : 'bg-emerald-500'
              }`}
              title={`${lang.language}: ${lang.percentage}%`}
            />
          ))}
        </div>

        {/* Legend Grid */}
        <div className="flex flex-wrap gap-4 pt-1 text-slate-700 font-semibold">
          {languages.map((lang, idx) => (
            <div key={lang.language} className="flex items-center gap-1.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  idx === 0
                    ? 'bg-[#4F46E5]'
                    : idx === 1
                    ? 'bg-blue-500'
                    : idx === 2
                    ? 'bg-purple-500'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-bold">{lang.language}:</span>
              <span className="text-slate-500 font-mono">{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Project Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Architecture & Tech Summary */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Cpu className="w-4 h-4 text-emerald-600" />
            Project Architecture Summary
          </h3>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Architecture Pattern</span>
              <p className="font-extrabold text-slate-900 text-sm mt-0.5">{summary.architecture}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Detected Framework</span>
              <p className="font-extrabold text-indigo-700 text-sm mt-0.5">{summary.framework}</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Package Manager</span>
              <p className="font-extrabold text-slate-900 text-sm capitalize mt-0.5">{summary.packageManager}</p>
            </div>
          </div>
        </div>

        {/* Technologies & Folders */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Box className="w-4 h-4 text-purple-600" />
            Detected Technologies & Patterns
          </h3>

          <div className="flex flex-wrap gap-2">
            {summary.detectedTechnologies.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                {tech}
              </span>
            ))}
          </div>

          <div className="pt-2 space-y-1">
            <p className="font-extrabold text-slate-800">Folder Structure Indicators:</p>
            {summary.folderStructureSummary.length > 0 ? (
              summary.folderStructureSummary.map((f) => (
                <p key={f} className="text-slate-600 font-medium">
                  • {f}
                </p>
              ))
            ) : (
              <p className="text-slate-400 font-medium">• Root Directory Project Layout</p>
            )}
          </div>
        </div>
      </div>

      {/* README Preview */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4F46E5]" />
            README.md Overview
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600">
            Detected Automatically
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
          {repo.readmeContent || 'No README file detected.'}
        </div>
      </div>
    </div>
  );
};
