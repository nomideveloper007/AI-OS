export interface LanguageBreakdown {
  language: string;
  percentage: number;
  fileCount: number;
}

export class RepositoryLanguageDetector {
  public static calculateBreakdown(filePaths: string[]): LanguageBreakdown[] {
    const counts: Record<string, number> = {};
    let total = 0;

    filePaths.forEach((path) => {
      const ext = path.split('.').pop()?.toLowerCase();
      if (!ext) return;

      let lang = 'Other';
      if (ext === 'ts' || ext === 'tsx') lang = 'TypeScript';
      else if (ext === 'js' || ext === 'jsx') lang = 'JavaScript';
      else if (ext === 'py') lang = 'Python';
      else if (ext === 'php') lang = 'PHP';
      else if (ext === 'html') lang = 'HTML';
      else if (ext === 'css' || ext === 'scss') lang = 'CSS';
      else if (ext === 'md') lang = 'Markdown';
      else if (ext === 'json') lang = 'JSON';

      counts[lang] = (counts[lang] || 0) + 1;
      total++;
    });

    if (total === 0) {
      return [{ language: 'TypeScript', percentage: 100, fileCount: 0 }];
    }

    const breakdown: LanguageBreakdown[] = Object.entries(counts).map(([language, count]) => ({
      language,
      fileCount: count,
      percentage: Math.round((count / total) * 100)
    }));

    return breakdown.sort((a, b) => b.percentage - a.percentage);
  }
}
