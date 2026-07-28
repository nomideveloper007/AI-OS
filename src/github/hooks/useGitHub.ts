import { useState, useEffect } from 'react';
import { GitHubManager } from '../core/GitHubManager';
import { RepositoryObject } from '../types/Repository';
import { RepositoryFile } from '../types/RepositoryFile';
import { RepositoryCommit } from '../types/RepositoryCommit';
import { RepositoryTree, RepositoryTreeNode } from '../types/RepositoryTree';
import { GitHubAccount } from '../types/GitHubAccount';

export const useGitHub = () => {
  const manager = GitHubManager.getInstance();

  const [account, setAccount] = useState<GitHubAccount | null>(null);
  const [repos, setRepos] = useState<RepositoryObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedRepoId, setSelectedRepoId] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('main');
  const [activeFilePath, setActiveFilePath] = useState<string | null>('README.md');

  const [commits, setCommits] = useState<RepositoryCommit[]>([]);
  const [tree, setTree] = useState<RepositoryTree | undefined>(undefined);
  const [activeFile, setActiveFile] = useState<RepositoryFile | undefined>(undefined);

  const selectedRepo = repos.find((r) => r.id === selectedRepoId) || repos[0];

  const loadData = async () => {
    setLoading(true);
    try {
      const acc = await manager.getAccount();
      setAccount(acc);
      const fetchedRepos = await manager.getRepositories();
      setRepos(fetchedRepos);
      if (fetchedRepos.length > 0 && !selectedRepoId) {
        setSelectedRepoId(fetchedRepos[0].id);
        setSelectedBranch(fetchedRepos[0].defaultBranch || 'main');
      }
    } catch (err) {
      console.error('Error loading GitHub data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedRepo) return;

    const loadRepoDetails = async () => {
      const parts = selectedRepo.fullName.split('/');
      const owner = selectedRepo.owner || parts[0] || account?.username || '';
      const repoName = selectedRepo.name || parts[1] || '';

      const fetchedCommits = await manager.getCommits(owner, repoName, selectedBranch);
      setCommits(fetchedCommits);

      const fetchedTree = await manager.getTree(owner, repoName, selectedBranch);
      setTree(fetchedTree);

      if (activeFilePath) {
        const file = await manager.getFileContent(owner, repoName, activeFilePath, selectedBranch);
        setActiveFile(file);
      }
    };

    loadRepoDetails();
  }, [selectedRepoId, selectedBranch, activeFilePath]);

  const expandFolder = async (folderPath: string) => {
    if (!selectedRepo) return;
    const parts = selectedRepo.fullName.split('/');
    const owner = selectedRepo.owner || parts[0] || account?.username || '';
    const repoName = selectedRepo.name || parts[1] || '';

    const client = manager.service.getClient();
    const children = await client.fetchDirectoryContents(owner, repoName, folderPath, selectedBranch);

    if (tree && children.length > 0) {
      const updateNodes = (nodes: RepositoryTreeNode[]): RepositoryTreeNode[] => {
        return nodes.map((n) => {
          if (n.path === folderPath) {
            return { ...n, children };
          }
          if (n.children) {
            return { ...n, children: updateNodes(n.children) };
          }
          return n;
        });
      };

      setTree({
        ...tree,
        rootNodes: updateNodes(tree.rootNodes)
      });
    }
  };

  const connectAccount = async (token: string, username: string) => {
    setLoading(true);
    await manager.connectAccount(token, username);
    await loadData();
  };

  const disconnectAccount = () => {
    manager.disconnectAccount();
    setAccount(null);
    setRepos([]);
    setSelectedRepoId('');
  };

  return {
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
    selectRepo: setSelectedRepoId,
    connectAccount,
    disconnectAccount,
    expandFolder,
    reload: loadData
  };
};
