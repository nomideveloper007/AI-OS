import { RepositoryObject } from '../types/Repository';
import { RepositoryCommit } from '../types/RepositoryCommit';
import { RepositoryTree, RepositoryTreeNode } from '../types/RepositoryTree';
import { RepositoryFile } from '../types/RepositoryFile';

export class GitHubRepository {
  private static instance: GitHubRepository;
  private repos: Map<string, RepositoryObject> = new Map();
  private commits: Map<string, RepositoryCommit[]> = new Map();
  private trees: Map<string, RepositoryTree> = new Map();
  private files: Map<string, RepositoryFile> = new Map();

  private constructor() {
    this.seedDefaultRepositories();
  }

  public static getInstance(): GitHubRepository {
    if (!GitHubRepository.instance) {
      GitHubRepository.instance = new GitHubRepository();
    }
    return GitHubRepository.instance;
  }

  private seedDefaultRepositories(): void {
    const aiOsRepo: RepositoryObject = {
      id: 'repo-ai-os',
      name: 'AI-OS',
      fullName: 'nomideveloper007/AI-OS',
      owner: 'nomideveloper007',
      description: 'Enterprise AI Website Operating System, Model Router, Memory System, Workflow Engine & CEO Agent.',
      isPrivate: false,
      defaultBranch: 'main',
      htmlUrl: 'https://github.com/nomideveloper007/AI-OS',
      cloneUrl: 'https://github.com/nomideveloper007/AI-OS.git',
      starsCount: 42,
      forksCount: 8,
      openIssuesCount: 0,
      primaryLanguage: 'TypeScript',
      framework: 'React',
      createdAt: '2026-07-01T10:00:00Z',
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      readmeContent: `# AI OS (AI Website Operating System)\n\nProduction-ready autonomous AI operating system designed for managing, analyzing, scanning, and optimizing websites.\n\n## Stack\n- Vite + React + TypeScript\n- Tailwind CSS\n- OmniRoute AI Smart Gateway\n- Long-Term Memory System & Knowledge Repository\n- Workflow Engine & CEO Executive Agent`,
      branches: [
        { name: 'main', isDefault: true, latestCommitSha: '458db42', protected: true },
        { name: 'dev', isDefault: false, latestCommitSha: '97c363f', protected: false },
        { name: 'feature/ai-engine', isDefault: false, latestCommitSha: 'f98f717', protected: false }
      ],
      metrics: {
        sizeKb: 1450,
        filesCount: 184,
        directoriesCount: 28,
        languages: [
          { name: 'TypeScript', percentage: 88 },
          { name: 'HTML', percentage: 7 },
          { name: 'CSS', percentage: 5 }
        ],
        framework: 'React',
        defaultBranch: 'main',
        lastCommitDate: new Date().toISOString(),
        contributorsCount: 3
      }
    };

    const taskToMoneyRepo: RepositoryObject = {
      id: 'repo-tasktomoney',
      name: 'TaskToMoney',
      fullName: 'nomideveloper007/TaskToMoney',
      owner: 'nomideveloper007',
      description: 'High Paying Online Microtasks & Work From Home SaaS platform built with Next.js SSR.',
      isPrivate: false,
      defaultBranch: 'main',
      htmlUrl: 'https://github.com/nomideveloper007/TaskToMoney',
      cloneUrl: 'https://github.com/nomideveloper007/TaskToMoney.git',
      starsCount: 29,
      forksCount: 4,
      openIssuesCount: 2,
      primaryLanguage: 'TypeScript',
      framework: 'Next.js',
      createdAt: '2026-06-15T10:00:00Z',
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      pushedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      readmeContent: `# TaskToMoney Platform\n\nHigh Paying Online Microtasks & Work From Home platform.\nBuilt with Next.js 14 App Router, Tailwind CSS, PostgreSQL, and Redis.`,
      branches: [
        { name: 'main', isDefault: true, latestCommitSha: 'a8b7c6d', protected: true },
        { name: 'staging', isDefault: false, latestCommitSha: 'e5f4d3c', protected: false }
      ],
      metrics: {
        sizeKb: 3200,
        filesCount: 245,
        directoriesCount: 36,
        languages: [
          { name: 'TypeScript', percentage: 92 },
          { name: 'CSS', percentage: 8 }
        ],
        framework: 'Next.js',
        defaultBranch: 'main',
        lastCommitDate: new Date(Date.now() - 3600000 * 5).toISOString(),
        contributorsCount: 2
      }
    };

    this.repos.set(aiOsRepo.id, aiOsRepo);
    this.repos.set(taskToMoneyRepo.id, taskToMoneyRepo);

    // Seed Commits for AI-OS
    this.commits.set(aiOsRepo.id, [
      {
        sha: '458db42',
        message: 'feat: add target website selector dropdown bar to CEO Agent dashboard',
        authorName: 'Sufian Ali',
        authorEmail: 'sufian@ai-os.io',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        date: new Date(Date.now() - 1800000).toISOString(),
        branch: 'main'
      },
      {
        sha: '97c363f',
        message: 'feat: implement CEO Agent executive advisor, health audit, risk analysis, and task planner',
        authorName: 'Sufian Ali',
        authorEmail: 'sufian@ai-os.io',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        date: new Date(Date.now() - 7200000).toISOString(),
        branch: 'main'
      },
      {
        sha: 'f98f717',
        message: 'feat: implement workflow engine mission control architecture and visual builder',
        authorName: 'Sufian Ali',
        authorEmail: 'sufian@ai-os.io',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        date: new Date(Date.now() - 14400000).toISOString(),
        branch: 'main'
      }
    ]);

    // Seed Trees
    this.trees.set(aiOsRepo.id, {
      repositoryId: aiOsRepo.id,
      branch: 'main',
      rootNodes: [
        {
          name: 'src',
          path: 'src',
          type: 'directory',
          sha: 'dir-src-1',
          children: [
            { name: 'App.tsx', path: 'src/App.tsx', type: 'file', sizeBytes: 3200, sha: 'f-app-1' },
            { name: 'main.tsx', path: 'src/main.tsx', type: 'file', sizeBytes: 450, sha: 'f-[#main]-1' },
            { name: 'index.css', path: 'src/index.css', type: 'file', sizeBytes: 2100, sha: 'f-css-1' }
          ]
        },
        { name: 'package.json', path: 'package.json', type: 'file', sizeBytes: 1250, sha: 'f-pkg-1' },
        { name: 'README.md', path: 'README.md', type: 'file', sizeBytes: 1450, sha: 'f-readme-1' },
        { name: 'vite.config.ts', path: 'vite.config.ts', type: 'file', sizeBytes: 680, sha: 'f-vite-1' }
      ]
    });

    // Seed File Contents
    this.files.set(`${aiOsRepo.id}:package.json`, {
      path: 'package.json',
      name: 'package.json',
      extension: 'json',
      sizeBytes: 1250,
      sha: 'f-pkg-1',
      language: 'json',
      content: `{\n  "name": "ai-os",\n  "version": "1.0.0",\n  "private": true,\n  "type": "module",\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "lucide-react": "^0.344.0"\n  }\n}`
    });

    this.files.set(`${aiOsRepo.id}:README.md`, {
      path: 'README.md',
      name: 'README.md',
      extension: 'md',
      sizeBytes: 1450,
      sha: 'f-readme-1',
      language: 'markdown',
      content: aiOsRepo.readmeContent || ''
    });
  }

  public getAll(): RepositoryObject[] {
    return Array.from(this.repos.values());
  }

  public getById(id: string): RepositoryObject | undefined {
    return this.repos.get(id);
  }

  public getCommits(repoId: string): RepositoryCommit[] {
    return this.commits.get(repoId) || [];
  }

  public getTree(repoId: string): RepositoryTree | undefined {
    return this.trees.get(repoId);
  }

  public getFileContent(repoId: string, path: string): RepositoryFile | undefined {
    return this.files.get(`${repoId}:${path}`);
  }
}
