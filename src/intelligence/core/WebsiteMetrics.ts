import type { WebsiteScanResult, WebsiteItem } from '../../types';
import type { WebsiteMetric } from '../types/WebsiteMetric';
import type { WebsiteProfile } from '../types/WebsiteContext';

function detectCms(scan: WebsiteScanResult): string | null {
  const generator = (scan.technical.generator || '').toLowerCase();
  const framework = (scan.technical.framework || '').toLowerCase();
  if (generator.includes('wordpress') || framework.includes('wordpress')) return 'WordPress';
  if (generator.includes('drupal')) return 'Drupal';
  if (generator.includes('shopify')) return 'Shopify';
  if (framework.includes('next') || framework.includes('react') || framework.includes('vue')) {
    return null; // app framework, not CMS
  }
  if (generator && generator !== 'unknown') return scan.technical.generator;
  return null;
}

function buildTechStack(scan: WebsiteScanResult, website?: WebsiteItem): string[] {
  const stack = new Set<string>();
  if (scan.technical.framework) stack.add(scan.technical.framework);
  if (website?.framework && website.framework !== 'Unknown') stack.add(website.framework);
  if (scan.technical.server) stack.add(scan.technical.server.split('/')[0].trim());
  if (scan.technical.generator) stack.add(scan.technical.generator);
  if (scan.security.httpsEnabled) stack.add('HTTPS/TLS');
  if (scan.files.sitemapXml.found) stack.add('XML Sitemap');
  return Array.from(stack).filter(Boolean);
}

export class WebsiteMetrics {
  public static buildProfile(scan: WebsiteScanResult, website?: WebsiteItem): WebsiteProfile {
    const hasOg = Boolean(scan.meta.ogTitle || scan.meta.ogImage || scan.meta.ogDescription);
    const structuredDataHint =
      scan.headings.totalCount > 10 && Boolean(scan.meta.ogType) && scan.files.sitemapXml.found;

    return {
      websiteName: website?.name || scan.technical.title || scan.domain,
      domain: scan.domain || website?.domain || '',
      description: website?.description || scan.meta.description || '',
      technologyStack: buildTechStack(scan, website),
      framework: scan.technical.framework || website?.framework || 'Unknown',
      cms: detectCms(scan),
      protocol: scan.technical.protocol,
      server: scan.technical.server,
      language: scan.technical.language || 'unknown',
      mobileFriendly: Boolean(scan.technical.viewport && scan.technical.viewport.includes('width=device-width')),
      pageCount: scan.pages.length,
      internalLinks: scan.links.internalCount,
      externalLinks: scan.links.externalCount,
      brokenLinks: scan.links.brokenCount,
      imageCount: scan.images.totalCount,
      imagesMissingAlt: scan.images.missingAltCount,
      hasRobots: scan.files.robotsTxt.found,
      hasSitemap: scan.files.sitemapXml.found,
      hasOpenGraph: hasOg,
      hasStructuredDataHint: structuredDataHint,
      metaTitle: scan.meta.title || scan.technical.title || '',
      metaDescription: scan.meta.description || '',
      loadingTimeMs: scan.performance.loadTimeMs,
      httpsEnabled: scan.security.httpsEnabled,
    };
  }

  public static extract(scan: WebsiteScanResult, website?: WebsiteItem): WebsiteMetric[] {
    const profile = WebsiteMetrics.buildProfile(scan, website);
    const jsKb = Math.round(scan.performance.jsSizeBytes / 1024);
    const cssKb = Math.round(scan.performance.cssSizeBytes / 1024);

    return [
      { id: 'm-pages', key: 'page_count', label: 'Page Count', category: 'structure', value: profile.pageCount },
      { id: 'm-internal', key: 'internal_links', label: 'Internal Links', category: 'structure', value: profile.internalLinks },
      { id: 'm-external', key: 'external_links', label: 'External Links', category: 'structure', value: profile.externalLinks },
      { id: 'm-broken', key: 'broken_links', label: 'Broken Links', category: 'seo', value: profile.brokenLinks },
      { id: 'm-images', key: 'image_count', label: 'Images', category: 'content', value: profile.imageCount },
      { id: 'm-alt', key: 'images_missing_alt', label: 'Images Missing ALT', category: 'accessibility', value: profile.imagesMissingAlt },
      { id: 'm-load', key: 'loading_time_ms', label: 'Loading Time', category: 'performance', value: profile.loadingTimeMs, unit: 'ms' },
      { id: 'm-js', key: 'js_bundle_kb', label: 'JavaScript Size', category: 'performance', value: jsKb, unit: 'KB' },
      { id: 'm-css', key: 'css_size_kb', label: 'CSS Size', category: 'performance', value: cssKb, unit: 'KB' },
      { id: 'm-https', key: 'https_enabled', label: 'HTTPS Enabled', category: 'security', value: profile.httpsEnabled },
      { id: 'm-robots', key: 'robots_txt', label: 'Robots.txt', category: 'seo', value: profile.hasRobots },
      { id: 'm-sitemap', key: 'sitemap', label: 'Sitemap', category: 'seo', value: profile.hasSitemap },
      { id: 'm-og', key: 'open_graph', label: 'OpenGraph', category: 'seo', value: profile.hasOpenGraph },
      { id: 'm-mobile', key: 'mobile_friendly', label: 'Mobile Friendly', category: 'accessibility', value: profile.mobileFriendly },
      { id: 'm-title-len', key: 'meta_title_length', label: 'Meta Title Length', category: 'seo', value: profile.metaTitle.length, unit: 'chars' },
      { id: 'm-desc-len', key: 'meta_desc_length', label: 'Meta Description Length', category: 'seo', value: profile.metaDescription.length, unit: 'chars' },
    ];
  }
}
