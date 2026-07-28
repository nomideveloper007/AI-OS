import { GitHubClient } from './GitHubClient';
import { RepositoryObject } from '../types/Repository';
import { RepositoryCommit } from '../types/RepositoryCommit';
import { RepositoryTree } from '../types/RepositoryTree';
import { RepositoryFile } from '../types/RepositoryFile';

export class GitHubService {
  private client = new GitHubClient();

  public getClient(): GitHubClient {
    return this.client;
  }

  public async getConnectedAccount() {
    return await this.client.fetchAccount();
  }

  public async fetchRepositories(): Promise<RepositoryObject[]> {
    return await this.client.fetchRepositories();
  }

  public async fetchCommits(owner: string, repo: string, branch: string = 'main'): Promise<RepositoryCommit[]> {
    return await this.client.fetchCommits(owner, repo, branch);
  }

  public async fetchTree(owner: string, repo: string, branch: string = 'main'): Promise<RepositoryTree> {
    return await this.client.fetchTree(owner, repo, branch);
  }

  public async fetchFileContent(owner: string, repo: string, path: string, branch: string = 'main'): Promise<RepositoryFile | undefined> {
    return await this.client.fetchFileContent(owner, repo, path, branch);
  }
}
