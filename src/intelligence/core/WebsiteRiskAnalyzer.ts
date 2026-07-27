import type { WebsiteScanResult } from '../../types';
import type { WebsiteRisk } from '../types/WebsiteRisk';

let riskSeq = 0;
function uid(): string {
  riskSeq += 1;
  return `risk-${Date.now()}-${riskSeq}`;
}

export class WebsiteRiskAnalyzer {
  public static analyze(scan: WebsiteScanResult): WebsiteRisk[] {
    if (scan.status !== 'completed') {
      return [
        {
          id: uid(),
          severity: 'critical',
          category: 'reliability',
          title: 'Website unreachable or scan failed',
          description: scan.error_message || `Scan ended with status "${scan.status}".`,
          impact: 'Agents cannot trust site knowledge until a successful scan exists.',
          mitigation: 'Fix connectivity/SSL/DNS issues and re-scan.',
        },
      ];
    }

    const risks: WebsiteRisk[] = [];

    if (!scan.security.httpsEnabled || scan.technical.protocol === 'HTTP') {
      risks.push({
        id: uid(),
        severity: 'critical',
        category: 'security',
        title: 'Site not served over HTTPS',
        description: 'HTTP-only or HTTPS disabled in scan security data.',
        impact: 'Browser warnings, SEO demotion, and credential exposure risk.',
        mitigation: 'Enable TLS certificates and force HTTPS redirects.',
      });
    }

    if (!scan.security.headers.csp) {
      risks.push({
        id: uid(),
        severity: 'high',
        category: 'security',
        title: 'Content-Security-Policy missing',
        description: 'CSP header not detected.',
        impact: 'Higher XSS and injection exposure.',
        mitigation: 'Deploy a restrictive CSP tailored to required origins.',
      });
    }

    if (!scan.security.headers.hsts && scan.security.httpsEnabled) {
      risks.push({
        id: uid(),
        severity: 'medium',
        category: 'security',
        title: 'HSTS not enabled',
        description: 'Strict-Transport-Security header missing.',
        impact: 'Users may still hit insecure first requests.',
        mitigation: 'Enable HSTS with a sensible max-age.',
      });
    }

    if (scan.links.brokenCount >= 5) {
      risks.push({
        id: uid(),
        severity: 'high',
        category: 'seo',
        title: 'High volume of broken links',
        description: `${scan.links.brokenCount} broken links detected.`,
        impact: 'Crawl waste, poor UX, and ranking leakage.',
        mitigation: 'Audit and repair or 301-redirect dead URLs.',
      });
    } else if (scan.links.brokenCount > 0) {
      risks.push({
        id: uid(),
        severity: 'medium',
        category: 'seo',
        title: 'Broken links present',
        description: `${scan.links.brokenCount} broken link(s) found.`,
        impact: 'Minor crawl and trust degradation.',
        mitigation: 'Fix broken destinations promptly.',
      });
    }

    if (scan.performance.loadTimeMs > 3000) {
      risks.push({
        id: uid(),
        severity: scan.performance.loadTimeMs > 5000 ? 'high' : 'medium',
        category: 'performance',
        title: 'Slow page load time',
        description: `Measured load time ${scan.performance.loadTimeMs} ms.`,
        impact: 'Higher bounce rate and weaker Core Web Vitals.',
        mitigation: 'Optimize assets, caching, and server response.',
      });
    }

    if (scan.images.missingAltCount > 8) {
      risks.push({
        id: uid(),
        severity: 'medium',
        category: 'accessibility',
        title: 'Widespread missing image ALT text',
        description: `${scan.images.missingAltCount} images lack ALT attributes.`,
        impact: 'Accessibility compliance and image SEO risk.',
        mitigation: 'Backfill ALT text across templates and CMS media.',
      });
    }

    if (!scan.files.sitemapXml.found) {
      risks.push({
        id: uid(),
        severity: 'medium',
        category: 'seo',
        title: 'No XML sitemap',
        description: 'Sitemap not discovered by scanner.',
        impact: 'Slower indexing of new/updated pages.',
        mitigation: 'Publish sitemap.xml and reference it in robots.txt.',
      });
    }

    if (!scan.security.headers.xFrameOptions) {
      risks.push({
        id: uid(),
        severity: 'low',
        category: 'security',
        title: 'X-Frame-Options missing',
        description: 'Clickjacking protection header not found.',
        impact: 'Page may be embedded by third parties.',
        mitigation: 'Set X-Frame-Options or frame-ancestors CSP.',
      });
    }

    return risks;
  }
}
