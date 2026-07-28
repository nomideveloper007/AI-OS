export interface GitHubAccount {
  id: string;
  username: string;
  avatarUrl: string;
  name: string;
  bio?: string;
  publicReposCount: number;
  followers: number;
  connectedAt: string;
  status: 'Connected' | 'Disconnected' | 'Rate Limited';
}
