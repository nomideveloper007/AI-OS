import { GitHubService } from './GitHubService';
import { RepositoryLogger } from './RepositoryLogger';
import { RepositoryCache } from './RepositoryCache';
import { RepositoryObject } from '../types/Repository';
import { RepositoryFile } from '../types/RepositoryFile';

export class GitHubManager {
  private static instance: GitHubManager;
  public service = new GitHubService();
  public logger = new RepositoryLogger();
  public cache = new RepositoryCache();

  private constructor() {}

  public static getInstance(): GitHubManager {
    if (!GitHubManager.instance) {
      GitHubManager.instance = new GitHubManager();
    }
    return GitHubManager.instance;
  }

  public async connectAccount(token: string, username: string) {
    this.service.getClient().saveCredentials(token, username);
    this.cache.clear();
    return await this.service.getConnectedAccount();
  }

  public disconnectAccount() {
    this.service.getClient().disconnect();
    this.cache.clear();
  }

  public async getAccount() {
    return await this.service.getConnectedAccount();
  }

  public async getRepositories(): Promise<RepositoryObject[]> {
    const repos = await this.service.fetchRepositories();
    repos.forEach((r) => this.cache.setCachedRepo(r));
    return repos;
  }

  public getRepository(id: string): RepositoryObject | undefined {
    return this.cache.getCachedRepo(id);
  }

  public async getCommits(owner: string, repo: string, branch: string = 'main') {
    this.logger.log(`${owner}/${repo}`, 'FETCH', `Fetched commit history for ${branch}`);
    return await this.service.fetchCommits(owner, repo, branch);
  }

  public async getTree(owner: string, repo: string, branch: string = 'main') {
    this.logger.log(`${owner}/${repo}`, 'INDEX', `Indexed file tree for ${branch}`);
    return await this.service.fetchTree(owner, repo, branch);
  }

  public async getFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<RepositoryFile | undefined> {
    this.logger.log(`${owner}/${repo}`, 'SCAN', `Reading file content for ${path}`);
    return await this.service.fetchFileContent(owner, repo, path, branch);
  }
}
