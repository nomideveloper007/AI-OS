export class RepositoryFileReader {
  public static getSyntaxLanguage(extension: string): string {
    const ext = extension.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      case 'html':
        return 'html';
      case 'css':
      case 'scss':
        return 'css';
      case 'php':
        return 'php';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'go':
        return 'go';
      case 'yaml':
      case 'yml':
        return 'yaml';
      case 'xml':
        return 'xml';
      default:
        return 'plaintext';
    }
  }
}
