import type { WebsiteScanResult } from '../../types';
import type { HealthGrade, WebsiteScores } from '../types/WebsiteContext';
import { WebsiteMetrics } from './WebsiteMetrics';

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function gradeFromScore(score: number): HealthGrade {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

export class WebsiteScore {
  public static compute(scan: WebsiteScanResult): WebsiteScores {
    if (scan.status !== 'completed') {
      return {
        overall: 0,
        seo: 0,
        performance: 0,
        security: 0,
        accessibility: 0,
        content: 0,
        maintainability: 0,
        grade: 'critical',
      };
    }

    const profile = WebsiteMetrics.buildProfile(scan);
    const seo = WebsiteScore.scoreSeo(scan, profile.metaTitle, profile.metaDescription);
    const performance = WebsiteScore.scorePerformance(scan);
    const security = WebsiteScore.scoreSecurity(scan);
    const accessibility = WebsiteScore.scoreAccessibility(scan, profile.mobileFriendly);
    const content = WebsiteScore.scoreContent(scan);
    const maintainability = WebsiteScore.scoreMaintainability(scan);

    const overall = clamp(
      seo * 0.22 +
        performance * 0.2 +
        security * 0.18 +
        accessibility * 0.15 +
        content * 0.15 +
        maintainability * 0.1
    );

    return {
      overall,
      seo: clamp(seo),
      performance: clamp(performance),
      security: clamp(security),
      accessibility: clamp(accessibility),
      content: clamp(content),
      maintainability: clamp(maintainability),
      grade: gradeFromScore(overall),
    };
  }

  private static scoreSeo(
    scan: WebsiteScanResult,
    title: string,
    description: string
  ): number {
    let score = 100;
    if (!title) score -= 25;
    else if (title.length < 30) score -= 15;
    else if (title.length > 65) score -= 8;

    if (!description) score -= 20;
    else if (description.length < 70) score -= 10;
    else if (description.length > 160) score -= 5;

    if (!scan.meta.canonicalUrl) score -= 8;
    if (!scan.files.robotsTxt.found) score -= 10;
    if (!scan.files.sitemapXml.found) score -= 12;
    if (!(scan.meta.ogTitle || scan.meta.ogImage)) score -= 8;
    score -= Math.min(25, scan.links.brokenCount * 8);
    if (scan.headings.h1.length === 0) score -= 12;
    if (scan.headings.h1.length > 1) score -= 6;
    return score;
  }

  private static scorePerformance(scan: WebsiteScanResult): number {
    let score = 100;
    const load = scan.performance.loadTimeMs;
    if (load > 4000) score -= 35;
    else if (load > 2500) score -= 22;
    else if (load > 1500) score -= 12;
    else if (load > 1000) score -= 5;

    const jsMb = scan.performance.jsSizeBytes / (1024 * 1024);
    if (jsMb > 1.5) score -= 25;
    else if (jsMb > 0.8) score -= 15;
    else if (jsMb > 0.4) score -= 8;

    if (scan.performance.jsFilesCount > 25) score -= 10;
    if (scan.performance.imageSizeBytes > 3 * 1024 * 1024) score -= 12;
    return score;
  }

  private static scoreSecurity(scan: WebsiteScanResult): number {
    let score = 40;
    if (scan.security.httpsEnabled) score += 25;
    if (scan.security.headers.hsts) score += 8;
    if (scan.security.headers.xFrameOptions) score += 7;
    if (scan.security.headers.xContentTypeOptions) score += 6;
    if (scan.security.headers.csp) score += 8;
    if (scan.security.headers.referrerPolicy) score += 6;
    if (scan.technical.protocol === 'HTTP') score -= 30;
    return score;
  }

  private static scoreAccessibility(scan: WebsiteScanResult, mobileFriendly: boolean): number {
    let score = 100;
    if (scan.images.totalCount > 0) {
      const missingRatio = scan.images.missingAltCount / scan.images.totalCount;
      score -= Math.round(missingRatio * 40);
    }
    if (!mobileFriendly) score -= 20;
    if (!scan.technical.viewport) score -= 10;
    if (scan.links.brokenCount > 0) score -= Math.min(15, scan.links.brokenCount * 5);
    return score;
  }

  private static scoreContent(scan: WebsiteScanResult): number {
    let score = 55;
    score += Math.min(20, scan.pages.length * 2);
    score += Math.min(15, scan.headings.totalCount);
    if (scan.meta.description && scan.meta.description.length >= 70) score += 10;
    if (scan.pages.some((p) => p.path.includes('blog') || p.type === 'Content')) score += 8;
    if (scan.images.missingAltCount > 0) score -= 5;
    return score;
  }

  private static scoreMaintainability(scan: WebsiteScanResult): number {
    let score = 70;
    if (scan.files.sitemapXml.found) score += 8;
    if (scan.files.robotsTxt.found) score += 6;
    if (scan.files.manifestJson.found) score += 4;
    if (scan.links.brokenCount > 3) score -= 15;
    else if (scan.links.brokenCount > 0) score -= 6;
    if (scan.performance.jsFilesCount > 30) score -= 10;
    return score;
  }
}
