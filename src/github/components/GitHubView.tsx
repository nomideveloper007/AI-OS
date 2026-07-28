import React, { useState } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { RepositoryCard } from './RepositoryCard';
import { RepositoryOverview } from './RepositoryOverview';
import { RepositoryExplorer } from './RepositoryExplorer';
import { CommitHistoryView } from './CommitHistoryView';
import { BranchSelector } from './BranchSelector';
import { useApp } from '../../context/AppContext';
import {
  Github,
  GitBranch,
  ShieldCheck,
  Code,
  GitCommit,
  Layers,
  Search,
  UserCheck,
  Key,
  LogOut,
  RefreshCw,
  Plus,
  ArrowRight,
  Lock,
  Sparkles,
  HelpCircle,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const GitHubView: React.FC = () => {
  const { showToast } = useApp();
  const {
    account,
    repos,
    selectedRepo,
    selectedBranch,
    setSelectedBranch,
    activeFilePath,
    setActiveFilePath,
    activeFile,
    commits,
    tree,
    loading,
    selectRepo,
    connectAccount,
    disconnectAccount,
    expandFolder,
    reload
  } = useGitHub();

  const [activeTab, setActiveTab] = useState<'overview' | 'explorer' | 'commits'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [tokenInput, setTokenInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput) {
      showToast('Please enter your GitHub Username');
      return;
    }

    try {
      await connectAccount(tokenInput, usernameInput);
      setIsAuthModalOpen(false);
      showToast(`Connected GitHub account @${usernameInput}! Repositories loaded.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Connection failed: ${msg}`);
    }
  };

  const filteredRepos = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // UNCONNECTED HERO SCREEN WITH STEP-BY-STEP INSTRUCTIONS
  if (!account && !loading) {
    return (
      <div className="space-y-6 animate-fade-in text-xs max-w-4xl mx-auto py-4">
        {/* Main Onboarding Card */}
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] mx-auto shadow-2xs">
              <Github className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-lg mx-auto">
              <h1 className="text-2xl font-extrabold text-slate-900">
                Connect Your GitHub Account
              </h1>
              <p className="text-slate-500 font-medium leading-relaxed">
                Connect your GitHub account to allow AI OS to inspect repositories, explore file trees, read code, and provide AI code intelligence.
              </p>
            </div>
          </div>

          {/* Form + Step-by-Step Guide */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form */}
            <div className="lg:col-span-6 space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-200/60 pb-2.5 flex items-center gap-2">
                <Key className="w-4 h-4 text-[#4F46E5]" />
                Account Authorization Form
              </h3>

              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">1. GitHub Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. your-github-username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Your public GitHub handle (loads all public repositories).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-900">
                    2. Personal Access Token (PAT) <span className="text-slate-400 font-normal">(Optional for private repos)</span>
                  </label>
                  <input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Required only if you want to inspect private repositories.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Connect GitHub Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right Column: Step-by-step instructions */}
            <div className="lg:col-span-6 space-y-4 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <h3 className="font-extrabold text-indigo-950 text-sm border-b border-indigo-100 pb-2.5 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#4F46E5]" />
                How to Connect (Step-by-Step Guide)
              </h3>

              <div className="space-y-4 text-xs font-medium text-slate-700">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Enter Your GitHub Username</p>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      Type your GitHub username in field #1 above. This allows AI OS to fetch your public repositories immediately.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      Generate Personal Access Token (For Private Repos)
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4F46E5] inline-flex items-center hover:underline font-bold"
                      >
                        github.com/settings/tokens <ExternalLink className="w-3 h-3 ml-0.5" />
                      </a>
                    </p>
                    <ul className="text-slate-500 mt-1 space-y-1 list-disc list-inside leading-relaxed">
                      <li>Open GitHub Settings &gt; Developer Settings &gt; Tokens (Classic).</li>
                      <li>Click <strong>Generate new token (classic)</strong>.</li>
                      <li>Select the <strong>`repo`</strong> scope checkbox (Read repository access).</li>
                      <li>Copy the generated token (starts with <code>ghp_</code>) and paste into field #2.</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">Click "Connect GitHub Account"</p>
                    <p className="text-slate-500 mt-0.5 leading-relaxed">
                      AI OS will authenticate securely in <strong>Read-Only Mode</strong>. It will never edit, commit, or alter your repository files.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Read-Only Inspection
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-500" /> Never Modifies Code
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Secure Token Storage
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      {/* Top Banner: Connected Account & Credentials Manager */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={account?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'}
              alt={account?.username || 'GitHub User'}
              className="w-14 h-14 rounded-2xl border border-slate-200 object-cover flex-shrink-0 shadow-2xs"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <Github className="w-5 h-5 text-slate-900" />
                  GitHub Integration
                </h1>
                {account ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Connected as @{account.username}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    Not Connected
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Read Only Mode
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {account?.bio || 'Connected GitHub developer account.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              Switch / Re-Connect Account
            </button>

            <button
              onClick={reload}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Repositories"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => {
                disconnectAccount();
                showToast('Disconnected GitHub account.');
              }}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              title="Disconnect Account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-slate-900">
            Connected Repositories ({repos.length})
          </h2>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900"
            />
          </div>
        </div>

        {repos.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <Github className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-extrabold text-slate-900 text-base">No Public Repositories Found for @{account?.username}</h3>
            <p className="text-xs text-slate-500 font-medium max-w-md mx-auto">
              If your repositories are private, please add a Personal Access Token (PAT) with <code>repo</code> permissions.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#4F46E5] text-white font-extrabold text-xs cursor-pointer"
            >
              Add Personal Access Token Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => (
              <RepositoryCard
                key={repo.id}
                repo={repo}
                isSelected={selectedRepo && repo.id === selectedRepo.id}
                onSelect={() => selectRepo(repo.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Selected Repository Active Workstation */}
      {selectedRepo && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900">{selectedRepo.fullName}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {selectedRepo.framework}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{selectedRepo.description}</p>
            </div>

            <BranchSelector
              branches={selectedRepo.branches}
              selectedBranch={selectedBranch}
              onSelectBranch={setSelectedBranch}
            />
          </div>

          {/* Explorer Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'overview', label: 'Repository Overview & Metrics', icon: Layers },
              { id: 'explorer', label: 'File Tree & Code Viewer', icon: Code },
              { id: 'commits', label: `Commit History (${commits.length})`, icon: GitCommit },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 ${
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

          {/* Active Sub-Tab View */}
          {activeTab === 'overview' && <RepositoryOverview repo={selectedRepo} tree={tree} />}

          {activeTab === 'explorer' && (
            <RepositoryExplorer
              tree={tree}
              activeFile={activeFile}
              activeFilePath={activeFilePath}
              onSelectFile={setActiveFilePath}
              onExpandFolder={expandFolder}
            />
          )}

          {activeTab === 'commits' && <CommitHistoryView commits={commits} />}
        </div>
      )}

      {/* GitHub Authorization Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-5 animate-scale-in border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-[#4F46E5]" />
                Connect GitHub Account
              </h3>
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConnect} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">GitHub Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. your-github-username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Personal Access Token (PAT) <span className="text-slate-400 font-normal">(Optional for private repos)</span>
                </label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  Create a token in GitHub Settings &gt; Developer Settings &gt; Personal Access Tokens (repo scope).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                {account && (
                  <button
                    type="button"
                    onClick={() => {
                      disconnectAccount();
                      setIsAuthModalOpen(false);
                      showToast('Disconnected GitHub account.');
                    }}
                    className="px-3 py-2 rounded-xl text-rose-600 font-bold text-xs hover:bg-rose-50 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Disconnect
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-extrabold text-xs shadow-sm"
                  >
                    Authorize & Connect
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
