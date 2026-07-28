import { RepositoryFramework } from '../types/RepositoryFramework';
import { RepositoryLanguage } from '../types/RepositoryLanguage';

export class RepositoryScanner {
  public static detectFramework(
    files: string[],
    packageJsonContent?: string,
    composerJsonContent?: string,
    requirementsTxtContent?: string
  ): RepositoryFramework {
    if (packageJsonContent) {
      try {
        const pkg = JSON.parse(packageJsonContent);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) return 'Next.js';
        if (deps['nuxt']) return 'Nuxt';
        if (deps['@angular/core']) return 'Angular';
        if (deps['@nestjs/core']) return 'NestJS';
        if (deps['react']) return 'React';
        if (deps['vue']) return 'Vue';
        if (deps['express']) return 'Express';
        return 'Node.js';
      } catch (err) {
        // Fallthrough if parsing fails
      }
    }

    if (composerJsonContent) {
      if (composerJsonContent.includes('laravel/framework')) return 'Laravel';
      return 'PHP';
    }

    if (requirementsTxtContent) {
      if (requirementsTxtContent.includes('django')) return 'Django';
      if (requirementsTxtContent.includes('flask')) return 'Flask';
      return 'Python';
    }

    if (files.some((f) => f.includes('wp-config.php') || f.includes('wp-content'))) {
      return 'WordPress';
    }

    if (files.some((f) => f.endsWith('.php'))) return 'PHP';
    if (files.some((f) => f.endsWith('.py'))) return 'Python';
    if (files.some((f) => f.endsWith('.html'))) return 'Static HTML';

    return 'Static HTML';
  }

  public static detectPrimaryLanguage(files: string[]): RepositoryLanguage {
    const counts: Record<string, number> = {};

    files.forEach((file) => {
      const ext = file.split('.').pop()?.toLowerCase();
      if (ext === 'ts' || ext === 'tsx') counts['TypeScript'] = (counts['TypeScript'] || 0) + 1;
      else if (ext === 'js' || ext === 'jsx') counts['JavaScript'] = (counts['JavaScript'] || 0) + 1;
      else if (ext === 'py') counts['Python'] = (counts['Python'] || 0) + 1;
      else if (ext === 'php') counts['PHP'] = (counts['PHP'] || 0) + 1;
      else if (ext === 'html') counts['HTML'] = (counts['HTML'] || 0) + 1;
      else if (ext === 'css') counts['CSS'] = (counts['CSS'] || 0) + 1;
    });

    let maxLang: RepositoryLanguage = 'TypeScript';
    let maxCount = 0;

    Object.entries(counts).forEach(([lang, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxLang = lang as RepositoryLanguage;
      }
    });

    return maxLang;
  }
}
