import type { SEOAuditInput } from '../types/SEOAudit';
import type { SEOReport } from '../types/SEOReport';
import type { SEOScoreBreakdown } from '../types/SEOScore';

export class SEOValidator {
  public static validateInput(input: SEOAuditInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!input.websiteId?.trim() && !input.domain?.trim()) {
      errors.push('websiteId or domain is required');
    }
    if (input.domain && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(input.domain.replace(/^www\./, ''))) {
      // allow loose domains from inventory; only warn-style soft check
      if (input.domain.includes(' ') || input.domain.includes('://')) {
        errors.push('domain must be a hostname without protocol');
      }
    }
    return { valid: errors.length === 0, errors };
  }

  public static clampScore(value: unknown, fallback = 50): number {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  public static normalizeBreakdown(
    partial: Partial<SEOScoreBreakdown> | undefined,
    overallFallback: number
  ): SEOScoreBreakdown {
    const f = (v: unknown, fb = overallFallback) => SEOValidator.clampScore(v, fb);
    return {
      overall: f(partial?.overall, overallFallback),
      titleTags: f(partial?.titleTags),
      metaDescriptions: f(partial?.metaDescriptions),
      headingStructure: f(partial?.headingStructure),
      canonicalUrls: f(partial?.canonicalUrls),
      robotsTxt: f(partial?.robotsTxt),
      sitemapXml: f(partial?.sitemapXml),
      internalLinking: f(partial?.internalLinking),
      externalLinks: f(partial?.externalLinks),
      imageAlt: f(partial?.imageAlt),
      openGraph: f(partial?.openGraph),
      twitterCards: f(partial?.twitterCards),
      schemaMarkup: f(partial?.schemaMarkup),
      contentQuality: f(partial?.contentQuality),
      keywordUsage: f(partial?.keywordUsage),
      pageSpeed: f(partial?.pageSpeed),
      mobileFriendliness: f(partial?.mobileFriendliness),
    };
  }

  public static assertReport(report: SEOReport): void {
    if (!report.id) throw new Error('Report missing id');
    if (!report.domain) throw new Error('Report missing domain');
    if (report.overallSeoScore < 0 || report.overallSeoScore > 100) {
      throw new Error('Invalid overall SEO score');
    }
  }
}
