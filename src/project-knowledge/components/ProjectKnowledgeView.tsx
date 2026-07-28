import React, { useState } from 'react';
import { useGitHub } from '../../github/hooks/useGitHub';
import { ProjectKnowledgeEngine } from '../core/ProjectKnowledgeEngine';
import { ImpactAnalysisEngine } from '../analyzers/ImpactAnalysisEngine';
import {
  Brain,
  Cpu,
  Layers,
  GitFork,
  ShieldCheck,
  Zap,
  Search,
  Lock,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Database,
  Route as RouteIcon,
  Code2,
  Box,
  FolderTree,
  Activity,
  ShieldAlert,
  Server
} from 'lucide-react';

export const ProjectKnowledgeView: React.FC = () => {
  const { selectedRepo, tree } = useGitHub();
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'architecture'
    | 'summary'
    | 'tech'
    | 'folders'
    | 'components'
    | 'routes'
    | 'apis'
    | 'database'
    | 'functions'
    | 'graph'
    | 'impact'
    | 'safe_zones'
    | 'search'
  >('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [impactTargetFile, setImpactTargetFile] = useState('src/App.tsx');

  const filePaths: string[] = [];
  if (tree?.rootNodes) {
    const traverse = (nodes: any[]) => {
      nodes.forEach((n) => {
        filePaths.push(n.path);
        if (n.children) traverse(n.children);
      });
    };
    traverse(tree.rootNodes);
  }

  const defaultPaths =
    filePaths.length > 0
      ? filePaths
      : [
          'src/App.tsx',
          'src/main.tsx',
          'src/components/Sidebar.tsx',
          'src/components/DashboardView.tsx',
          'src/agents/ceo/CEODashboard.tsx',
          'src/github/components/GitHubView.tsx',
          'package.json',
          'vite.config.ts',
          'README.md'
        ];

  const repoId = selectedRepo ? selectedRepo.fullName : 'nomideveloper007/AI-OS';
  const engine = ProjectKnowledgeEngine.getInstance();
  const graph = engine.buildProjectKnowledge(repoId, defaultPaths);
  const impactResult = ImpactAnalysisEngine.analyzeFileImpact(impactTargetFile, graph);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Brain },
    { id: 'architecture', label: 'Architecture', icon: Cpu },
    { id: 'summary', label: 'Project Summary', icon: Activity },
    { id: 'tech', label: 'Tech Stack', icon: Box },
    { id: 'folders', label: 'Folder Structure', icon: FolderTree },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'routes', label: 'Routes', icon: RouteIcon },
    { id: 'apis', label: 'APIs', icon: Server },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'functions', label: 'Functions', icon: Code2 },
    { id: 'graph', label: 'Dependency Graph', icon: GitFork },
    { id: 'impact', label: 'Impact Analysis', icon: Flame },
    { id: 'safe_zones', label: 'Safe Edit Zones', icon: ShieldAlert },
    { id: 'search', label: 'Knowledge Search', icon: Search }
  ];

  return (
    <div className="space-y-6 text-xs animate-fade-in p-6">
      {/* Top Banner & Brain Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900">Project Knowledge Builder</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  Digital Brain Single Source of Truth
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Read-Only Inspection
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                CEO, Developer, SEO, QA & Security agents consume this stored knowledge instead of rescanning GitHub.
              </p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Views */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Framework</span>
              <p className="font-extrabold text-slate-900 text-sm">{graph.framework}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Files Indexed</span>
              <p className="font-extrabold text-indigo-700 text-xl">{graph.metrics.totalFiles}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Protected Files</span>
              <p className="font-extrabold text-amber-700 text-xl">{graph.metrics.protectedFilesCount}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase">Brain Status</span>
              <p className="font-extrabold text-emerald-700 text-xl">Active & Synced</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              AI OS Digital Brain Architecture
            </h3>
            <p className="text-slate-600 font-medium">
              Project knowledge graph is stored inside Memory. Every AI employee (CEO Agent, Developer Agent, SEO Agent, QA Agent, Security Agent, Content Agent) reads this structured graph for autonomous code reasoning.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            System Architecture Overview
          </h3>
          <p className="font-extrabold text-indigo-700 text-sm">{graph.architecture}</p>
          <p className="text-slate-600 font-medium">Primary Language: <strong>{graph.primaryLanguage}</strong> | Package Manager: <strong>{graph.packageManager}</strong></p>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Project Summary Object
          </h3>
          <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify({
              framework: graph.framework,
              architecture: graph.architecture,
              primaryLanguage: graph.primaryLanguage,
              packageManager: graph.packageManager,
              entryPoints: graph.entryPoints,
              technologyStack: graph.technologyStack
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'tech' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Detected Technology Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {graph.technologyStack.map((tech) => (
              <span key={tech} className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'folders' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Root Directory Folder Structure
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
            {graph.folderStructure.map((f) => (
              <div key={f} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-800 font-bold">
                📁 {f}/
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Component Knowledge
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {graph.components.map((c) => (
              <div key={c.name} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900 text-sm">{c.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700">
                    Reusable: {c.reusableScore}%
                  </span>
                </div>
                <p className="text-slate-600">{c.purpose}</p>
                <p className="text-[10px] font-mono text-slate-400">{c.filePath}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Application Routes
          </h3>
          <div className="space-y-2 font-mono">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between">
              <span className="font-bold text-slate-900">/dashboard</span>
              <span className="text-slate-400 text-[10px]">src/components/dashboard/DashboardView.tsx</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between">
              <span className="font-bold text-slate-900">/github</span>
              <span className="text-slate-400 text-[10px]">src/github/components/GitHubView.tsx</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'apis' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            API Endpoints Knowledge
          </h3>
          <div className="space-y-2 font-mono">
            {graph.apis.map((a) => (
              <div key={a.endpoint} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="font-extrabold text-slate-900">{a.endpoint}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700">
                  {a.method}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'database' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Database Knowledge
          </h3>
          <p className="font-bold text-slate-800">Database Name: {graph.database.databaseName}</p>
          <div className="flex flex-wrap gap-2 pt-2">
            {graph.database.tables.map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                📊 {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'functions' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Functions Knowledge
          </h3>
          <div className="space-y-2 font-mono">
            {graph.functions.map((f) => (
              <div key={f.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between">
                <div>
                  <span className="font-extrabold text-slate-900">{f.name}</span>
                  <p className="text-[10px] text-slate-500 font-sans">{f.purpose}</p>
                </div>
                <span className="text-[10px] text-indigo-700 font-bold">{f.returnType}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'graph' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
            Full Dependency Graph
          </h3>
          <div className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto">
            <pre>{JSON.stringify({
              componentsCount: graph.components.length,
              functionsCount: graph.functions.length,
              fileNodesCount: Object.keys(graph.fileKnowledgeMap).length
            }, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'impact' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-600" />
            Impact Analysis Engine
          </h3>
          <div className="space-y-2">
            <label className="font-bold text-slate-700">Select File to Calculate Change Impact:</label>
            <select
              value={impactTargetFile}
              onChange={(e) => setImpactTargetFile(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs font-semibold"
            >
              {Object.keys(graph.fileKnowledgeMap).map((path) => (
                <option key={path} value={path}>{path}</option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <p className="font-bold text-slate-900">Target File: <code className="font-mono text-indigo-700">{impactResult.targetFile}</code></p>
            <p className="font-bold text-slate-900">Estimated Change Risk: <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-amber-100 text-amber-800">{impactResult.estimatedRisk}</span></p>
            <p className="text-slate-600 font-medium">Files Affected: <strong>{impactResult.filesAffected.length}</strong> | Components Affected: <strong>{impactResult.componentsAffected.length}</strong></p>
          </div>
        </div>
      )}

      {activeTab === 'safe_zones' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Safe Edit Zones Classification
          </h3>
          <div className="space-y-2">
            {Object.entries(graph.safeEditZones).map(([path, zone]) => (
              <div key={path} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <span className="font-mono font-extrabold text-slate-900">{path}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  zone === 'Safe'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : zone === 'Review Required'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {zone}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search components, files, functions, routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
          </div>

          <div className="space-y-2">
            {engine.searchKnowledge(repoId, searchQuery).map((res, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between">
                <span className="font-extrabold text-slate-900 font-mono">{res.name} ({res.type})</span>
                <span className="text-slate-400 font-mono text-[10px]">{res.filePath}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
