import type { SEOReport } from '../types/SEOReport';
import type { SEOScoreBreakdown, SEOGrade } from '../types/SEOScore';
import type { SEOIssue } from '../types/SEOIssue';

export interface SEOMetricsSnapshot {
  totalAudits: number;
  averageScore: number;
  latestScore: number;
  criticalIssueCount: number;
  warningCount: number;
  opportunityCount: number;
  quickWinCount: number;
  domainsAudited: number;
  averageDurationMs: number;
  updatedAt: string;
}

export class SEOMetrics {
  public static gradeFromScore(score: number): SEOGrade {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  public static computeOverallFromBreakdown(breakdown: SEOScoreBreakdown): number {
    const keys: Array<keyof SEOScoreBreakdown> = [
      'titleTags',
      'metaDescriptions',
      'headingStructure',
      'canonicalUrls',
      'robotsTxt',
      'sitemapXml',
      'internalLinking',
      'externalLinks',
      'imageAlt',
      'openGraph',
      'twitterCards',
      'schemaMarkup',
      'contentQuality',
      'keywordUsage',
      'pageSpeed',
      'mobileFriendliness',
    ];
    const sum = keys.reduce((s, k) => s + breakdown[k], 0);
    return Math.round(sum / keys.length);
  }

  public static prioritizeFromIssues(critical: SEOIssue[], warnings: SEOIssue[]): SEOReport['priority'] {
    if (critical.length >= 3) return 'critical';
    if (critical.length >= 1) return 'high';
    if (warnings.length >= 3) return 'medium';
    return 'low';
  }

  public static snapshot(reports: SEOReport[]): SEOMetricsSnapshot {
    const domains = new Set(reports.map((r) => r.domain.toLowerCase()));
    const avgScore =
      reports.length === 0
        ? 0
        : Math.round(reports.reduce((s, r) => s + r.overallSeoScore, 0) / reports.length);
    const avgDur =
      reports.length === 0
        ? 0
        : Math.round(reports.reduce((s, r) => s + r.durationMs, 0) / reports.length);
    const latest = reports[0];

    return {
      totalAudits: reports.length,
      averageScore: avgScore,
      latestScore: latest?.overallSeoScore ?? 0,
      criticalIssueCount: latest?.criticalIssues.length ?? 0,
      warningCount: latest?.warnings.length ?? 0,
      opportunityCount: latest?.opportunities.length ?? 0,
      quickWinCount: latest?.quickWins.length ?? 0,
      domainsAudited: domains.size,
      averageDurationMs: avgDur,
      updatedAt: new Date().toISOString(),
    };
  }
}
