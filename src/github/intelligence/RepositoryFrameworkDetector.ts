import { RepositoryFramework } from '../types/RepositoryFramework';

export class RepositoryFrameworkDetector {
  public static detect(
    filePaths: string[],
    packageJsonContent?: string,
    composerJsonContent?: string,
    requirementsTxtContent?: string
  ): RepositoryFramework {
    const norm = filePaths.map((f) => f.toLowerCase());
    const fileSet = new Set(norm);

    // Check config files & folder patterns first
    if (norm.some((f) => f.includes('next.config.'))) return 'Next.js';
    if (norm.some((f) => f.includes('astro.config.'))) return 'Astro';
    if (norm.some((f) => f.includes('nuxt.config.'))) return 'Nuxt';
    if (norm.some((f) => f.includes('angular.json'))) return 'Angular';
    if (norm.some((f) => f.includes('vite.config.'))) return 'Vite';

    // Parse package.json
    if (packageJsonContent) {
      try {
        const pkg = JSON.parse(packageJsonContent);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['next']) return 'Next.js';
        if (deps['@remix-run/react']) return 'Remix';
        if (deps['astro']) return 'Astro';
        if (deps['nuxt'] || deps['nuxt3']) return 'Nuxt';
        if (deps['@angular/core']) return 'Angular';
        if (deps['@nestjs/core']) return 'NestJS';
        if (deps['vue']) return 'Vue';
        if (deps['react']) {
          if (deps['vite'] || norm.some((f) => f.includes('vite.config.'))) {
            return 'Vite';
          }
          return 'React';
        }
        if (deps['express']) return 'Express';
        return 'Node.js';
      } catch (e) {
        // Fallthrough
      }
    }

    // Heuristics based on file structure
    if (norm.some((f) => f.includes('next/')) || (norm.some((f) => f.includes('pages/')) && norm.some((f) => f.endsWith('.tsx')))) {
      return 'Next.js';
    }

    if (norm.some((f) => f.endsWith('.tsx') || f.endsWith('.jsx'))) {
      if (norm.some((f) => f.includes('vite'))) return 'Vite';
      return 'React';
    }

    // Parse composer.json for PHP / Laravel / WordPress
    if (composerJsonContent) {
      if (composerJsonContent.includes('laravel/framework')) return 'Laravel';
      return 'PHP';
    }

    if (fileSet.has('wp-config.php') || norm.some((f) => f.includes('wp-content'))) {
      return 'WordPress';
    }

    // Parse requirements.txt for Python / Django / Flask
    if (requirementsTxtContent) {
      if (requirementsTxtContent.toLowerCase().includes('django')) return 'Django';
      if (requirementsTxtContent.toLowerCase().includes('flask')) return 'Flask';
      return 'Python';
    }

    if (norm.some((f) => f.endsWith('.py'))) return 'Python';
    if (norm.some((f) => f.endsWith('.php'))) return 'PHP';

    return 'Static HTML';
  }

  public static isTailwindUsed(filePaths: string[], packageJsonContent?: string): boolean {
    const norm = filePaths.map((f) => f.toLowerCase());
    if (norm.some((f) => f.includes('tailwind.config.'))) return true;
    if (packageJsonContent && packageJsonContent.includes('tailwindcss')) return true;
    return false;
  }
}
