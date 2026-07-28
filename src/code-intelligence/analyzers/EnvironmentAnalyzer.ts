export class EnvironmentAnalyzer {
  public static analyzeEnvFileNames(filePaths: string[]): string[] {
    const envVars: string[] = [
      'VITE_API_URL',
      'VITE_GITHUB_TOKEN',
      'VITE_OMNIROUTE_PORT',
      'DATABASE_URL',
      'NEXT_PUBLIC_APP_URL',
      'NODE_ENV'
    ];

    // Read env file names from file paths (NEVER expose values)
    const envFiles = filePaths.filter((f) => f.toLowerCase().includes('.env'));
    if (envFiles.length > 0) {
      envVars.push('VITE_AI_PROVIDER_KEY');
    }

    return Array.from(new Set(envVars));
  }
}
