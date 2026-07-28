export interface RepositoryFile {
  path: string;
  name: string;
  extension: string;
  sizeBytes: number;
  content: string;
  sha: string;
  language?: string;
}
