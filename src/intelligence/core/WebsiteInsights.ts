import type { WebsiteScanResult } from '../../types';
import type { WebsiteInsight } from '../types/WebsiteInsight';
import { WebsiteMetrics } from './WebsiteMetrics';

let insightSeq = 0;
function uid(prefix: string): string {
  insightSeq += 1;
  return `${prefix}-${Date.now()}-${insightSeq}`;
}

export class WebsiteInsights {
  public static generate(scan: WebsiteScanResult): WebsiteInsight[] {
    if (scan.status !== 'completed') {
      return [
        {
          id: uid('ins'),
          category: 'technical',
          severity: 'critical',
          title: 'Scan incomplete',
          description: scan.error_message || `Latest scan status is "${scan.status}".`,
          recommendation: 'Re-run the Website Scanner before generating intelligence.',
        },
      ];
    }

    const insights: WebsiteInsight[] = [];
    const profile = WebsiteMetrics.buildProfile(scan);
    const paths = scan.pages.map((p) => p.path.toLowerCase());

    if (profile.metaTitle.length > 0 && profile.metaTitle.length < 30) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'warning',
        title: 'Homepage title too short',
        description: `Meta title is ${profile.metaTitle.length} characters; aim for 30–60.`,
        evidence: profile.metaTitle,
        recommendation: 'Expand the title with primary keywords and brand name.',
      });
    }

    if (profile.metaTitle.length > 65) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'info',
        title: 'Homepage title may be truncated in SERPs',
        description: `Meta title is ${profile.metaTitle.length} characters.`,
        evidence: profile.metaTitle,
        recommendation: 'Shorten to under 60 characters while keeping the primary keyword.',
      });
    }

    if (!profile.metaDescription || profile.metaDescription.length < 70) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'important',
        title: 'Meta description weak or missing',
        description: 'Search snippets need a clear 70–160 character description.',
        recommendation: 'Write a compelling meta description with a call to action.',
      });
    }

    if (!paths.some((p) => p.includes('faq'))) {
      insights.push({
        id: uid('ins'),
        category: 'content',
        severity: 'info',
        title: 'Missing FAQ page',
        description: 'No FAQ route was discovered in the scan page list.',
        recommendation: 'Add an FAQ page to capture long-tail queries and reduce support load.',
      });
    }

    if (!paths.some((p) => p.includes('about'))) {
      insights.push({
        id: uid('ins'),
        category: 'content',
        severity: 'info',
        title: 'Missing About page',
        description: 'No About page was found among discovered pages.',
        recommendation: 'Add an About page to build trust and brand clarity.',
      });
    }

    if (scan.images.missingAltCount > 0) {
      insights.push({
        id: uid('ins'),
        category: 'accessibility',
        severity: scan.images.missingAltCount > 5 ? 'important' : 'warning',
        title: 'Images without ALT',
        description: `${scan.images.missingAltCount} of ${scan.images.totalCount} images are missing alt text.`,
        recommendation: 'Add descriptive ALT attributes for accessibility and image SEO.',
      });
    }

    if (!profile.hasStructuredDataHint) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'warning',
        title: 'No schema markup signals detected',
        description: 'Scan data does not indicate strong structured-data / schema readiness.',
        recommendation: 'Add JSON-LD schema (Organization, WebSite, FAQ, Product as relevant).',
      });
    }

    if (scan.links.brokenCount > 0) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: scan.links.brokenCount > 3 ? 'important' : 'warning',
        title: 'Broken links detected',
        description: `${scan.links.brokenCount} broken link(s) found.`,
        evidence: scan.links.brokenLinks
          .slice(0, 3)
          .map((l) => l.url)
          .join(', '),
        recommendation: 'Fix or redirect broken URLs to protect crawl equity and UX.',
      });
    }

    const jsKb = Math.round(scan.performance.jsSizeBytes / 1024);
    if (jsKb > 400) {
      insights.push({
        id: uid('ins'),
        category: 'performance',
        severity: jsKb > 800 ? 'important' : 'warning',
        title: 'Large JavaScript bundles',
        description: `JavaScript payload is approximately ${jsKb} KB across ${scan.performance.jsFilesCount} files.`,
        recommendation: 'Code-split, tree-shake, and defer non-critical scripts.',
      });
    }

    if (!profile.hasRobots) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'warning',
        title: 'Missing robots.txt',
        description: 'robots.txt was not found during the scan.',
        recommendation: 'Publish robots.txt with sitemap reference and crawl rules.',
      });
    }

    if (!profile.hasSitemap) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'important',
        title: 'Missing sitemap.xml',
        description: 'XML sitemap was not discovered.',
        recommendation: 'Generate and submit an XML sitemap covering all indexable pages.',
      });
    }

    if (!profile.hasOpenGraph) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'info',
        title: 'OpenGraph tags incomplete',
        description: 'OG title/image/description signals are weak or missing.',
        recommendation: 'Add OpenGraph tags for better social sharing previews.',
      });
    }

    if (!profile.mobileFriendly) {
      insights.push({
        id: uid('ins'),
        category: 'accessibility',
        severity: 'important',
        title: 'Mobile viewport not detected',
        description: 'Responsive viewport meta appears missing.',
        recommendation: 'Add viewport meta for mobile-friendly rendering.',
      });
    }

    if (scan.headings.h1.length === 0) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'important',
        title: 'Missing H1 heading',
        description: 'No H1 tags were found on the homepage analysis.',
        recommendation: 'Add a single clear H1 that matches the primary topic.',
      });
    }

    if (scan.headings.h1.length > 1) {
      insights.push({
        id: uid('ins'),
        category: 'seo',
        severity: 'info',
        title: 'Multiple H1 headings',
        description: `${scan.headings.h1.length} H1 tags detected.`,
        evidence: scan.headings.h1.slice(0, 3).join(' | '),
        recommendation: 'Prefer a single H1 per page for clearer SEO structure.',
      });
    }

    return insights;
  }
}
