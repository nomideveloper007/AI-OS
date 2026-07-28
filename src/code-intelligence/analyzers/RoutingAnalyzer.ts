import { RouteIntel } from '../models/ProjectKnowledge';

export class RoutingAnalyzer {
  public static analyze(filePaths: string[]): RouteIntel[] {
    const routes: RouteIntel[] = [];

    filePaths.forEach((path) => {
      const lower = path.toLowerCase();

      // Next.js App Router
      if (lower.includes('app/') && (lower.endsWith('page.tsx') || lower.endsWith('page.js'))) {
        const routePath = '/' + path.replace(/^.*app\//, '').replace(/\/page\.(tsx|js)$/, '');
        routes.push({
          id: `route-${path}`,
          path: routePath === '/page' ? '/' : routePath,
          type: 'page',
          filePath: path
        });
      }
      // Next.js Pages Router
      else if (lower.includes('pages/') && (lower.endsWith('.tsx') || lower.endsWith('.js'))) {
        const routePath = '/' + path.replace(/^.*pages\//, '').replace(/\.(tsx|js)$/, '');
        const isApi = lower.includes('pages/api/');
        routes.push({
          id: `route-${path}`,
          path: routePath,
          type: isApi ? 'api' : 'page',
          filePath: path,
          method: isApi ? 'GET / POST' : undefined
        });
      }
      // React / Vite Routes
      else if (lower.includes('routes') || lower.includes('views')) {
        const name = path.split('/').pop()?.replace(/\.(tsx|ts|js)$/, '') || '';
        routes.push({
          id: `route-${path}`,
          path: `/${name.toLowerCase()}`,
          type: 'page',
          filePath: path
        });
      }
    });

    return routes;
  }
}
