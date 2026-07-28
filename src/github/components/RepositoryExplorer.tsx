import React, { useState } from 'react';
import { RepositoryTree, RepositoryTreeNode } from '../types/RepositoryTree';
import { RepositoryFile } from '../types/RepositoryFile';
import { RepositoryFileReader } from '../intelligence/RepositoryFileReader';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  ChevronRight,
  ChevronDown,
  Eye,
  ShieldCheck,
  Search,
  Code2,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';

interface RepositoryExplorerProps {
  tree?: RepositoryTree;
  activeFile?: RepositoryFile;
  activeFilePath: string | null;
  onSelectFile: (path: string) => void;
  onExpandFolder?: (path: string) => void;
}

export const RepositoryExplorer: React.FC<RepositoryExplorerProps> = ({
  tree,
  activeFile,
  activeFilePath,
  onSelectFile,
  onExpandFolder
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    components: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  const toggleFolder = (node: RepositoryTreeNode) => {
    const isExpanding = !expandedFolders[node.path];
    setExpandedFolders((prev) => ({ ...prev, [node.path]: isExpanding }));
    if (isExpanding && onExpandFolder && (!node.children || node.children.length === 0)) {
      onExpandFolder(node.path);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'json') return <FileJson className="w-4 h-4 text-amber-500 flex-shrink-0" />;
    if (ext === 'md' || ext === 'txt') return <FileText className="w-4 h-4 text-purple-500 flex-shrink-0" />;
    if (ext === 'css' || ext === 'scss') return <FileSpreadsheet className="w-4 h-4 text-sky-500 flex-shrink-0" />;
    return <FileCode className="w-4 h-4 text-indigo-500 flex-shrink-0" />;
  };

  const sortNodes = (nodes: RepositoryTreeNode[]): RepositoryTreeNode[] => {
    return [...nodes].sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'directory' ? -1 : 1;
    });
  };

  const renderNodes = (nodes: RepositoryTreeNode[], depth: number = 0) => {
    const sorted = sortNodes(nodes);

    return sorted.map((node) => {
      const isFile = node.type === 'file';
      const isExpanded = !!expandedFolders[node.path];
      const isSelected = activeFilePath === node.path;

      // Search Filter
      if (searchQuery) {
        const matches =
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.path.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matches && isFile) return null;
      }

      return (
        <div key={node.sha} className="space-y-0.5">
          <div
            onClick={() => {
              if (isFile) {
                onSelectFile(node.path);
              } else {
                toggleFolder(node);
              }
            }}
            style={{ paddingLeft: `${depth * 14 + 10}px` }}
            className={`flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              isSelected
                ? 'bg-[#EEF2FF] text-[#4F46E5] font-extrabold shadow-2xs border-l-2 border-[#4F46E5]'
                : 'text-slate-700 hover:bg-slate-100/90'
            }`}
          >
            {!isFile ? (
              <span className="text-slate-400">
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : (
              <span className="w-3.5 h-3.5" />
            )}

            {isFile ? (
              getFileIcon(node.name)
            ) : isExpanded ? (
              <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
            )}

            <span className="truncate flex-1 font-medium">{node.name}</span>

            {isFile && node.sizeBytes ? (
              <span className="text-[10px] font-mono text-slate-400">
                {(node.sizeBytes / 1024).toFixed(1)} KB
              </span>
            ) : null}
          </div>

          {!isFile && isExpanded && node.children && node.children.length > 0 && (
            <div>{renderNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const syntaxLang = activeFile ? RepositoryFileReader.getSyntaxLanguage(activeFile.extension) : 'plaintext';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
      {/* File Tree Side Panel */}
      <div className="lg:col-span-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col h-[740px] min-h-[740px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Folder className="w-4 h-4 text-amber-500" />
            File Tree Explorer
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
            Recursive Directory
          </span>
        </div>

        {/* Tree Search Box */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search files by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
          />
        </div>

        {/* Scrollable Tree Items Container */}
        <div className="space-y-0.5 overflow-y-auto flex-1 custom-scrollbar pr-1">
          {tree?.rootNodes && tree.rootNodes.length > 0 ? (
            renderNodes(tree.rootNodes)
          ) : (
            <div className="p-8 text-center text-slate-400 font-medium space-y-2">
              <Folder className="w-8 h-8 text-amber-400/50 mx-auto" />
              <p>Loading or empty tree nodes...</p>
            </div>
          )}
        </div>
      </div>

      {/* File Content Viewer */}
      <div className="lg:col-span-8 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col h-[740px] min-h-[740px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#4F46E5]" />
            <span className="font-extrabold text-slate-900 text-xs font-mono">
              {activeFilePath || 'Select a file to inspect'}
            </span>
            {activeFile && (
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                {syntaxLang}
              </span>
            )}
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Read-Only Inspection
          </span>
        </div>

        {activeFile ? (
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-slate-100 text-xs overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            <pre className="leading-relaxed">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 font-semibold flex-1 flex flex-col items-center justify-center space-y-2">
            <Code2 className="w-8 h-8 text-slate-300" />
            <p>Click any file in the tree to read its content.</p>
          </div>
        )}
      </div>
    </div>
  );
};
