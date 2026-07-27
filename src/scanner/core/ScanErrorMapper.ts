import type { ScanErrorType, WebsiteScanResult, WebsiteItem } from '../../types';
import type { FetchedResource } from '../types/RawScan';

export function classifyFetchError(
  homepage: FetchedResource
): { errorType: ScanErrorType; message: string } {
  const err = (homepage.error || '').toLowerCase();
  const status = homepage.status;

  if (err.includes('timeout') || err.includes('abort')) {
    return { errorType: 'timeout', message: homepage.error || 'Request timed out' };
  }
  if (err.includes('enotfound') || err.includes('getaddrinfo') || err.includes('dns')) {
    return { errorType: 'dns_error', message: homepage.error || 'DNS resolution failed' };
  }
  if (err.includes('ssl') || err.includes('cert') || err.includes('tls')) {
    return { errorType: 'ssl_error', message: homepage.error || 'SSL/TLS error' };
  }
  if (status === 403 || status === 401) {
    return { errorType: 'blocked', message: `HTTP ${status} Forbidden/Unauthorized` };
  }
  if (status === 404) {
    return { errorType: 'http_404', message: 'HTTP 404 Not Found' };
  }
  if (status >= 500) {
    return { errorType: 'http_500', message: `HTTP ${status} Server Error` };
  }
  if (status === 0 || homepage.error) {
    return { errorType: 'offline', message: homepage.error || 'Host unreachable' };
  }
  return { errorType: 'offline', message: 'Scan failed' };
}

export function buildFailedScan(
  website: WebsiteItem,
  homepage: FetchedResource,
  startedAt: number
): WebsiteScanResult {
  const { errorType, message } = classifyFetchError(homepage);
  const url = website.url || `https://${website.domain}`;
  const domain = website.domain || homepage.finalUrl;

  return {
    id: `scan-${Date.now()}`,
    website_id: website.id,
    domain,
    status: 'failed',
    error_type: errorType,
    error_message: message,
    scan_date: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    technical: {
      title: 'Scan Failed',
      homepageUrl: url,
      finalUrl: homepage.finalUrl || url,
      domain,
      protocol: url.startsWith('https') ? 'HTTPS' : 'HTTP',
      statusCode: homepage.status,
      server: homepage.headers['server'] || 'Unknown',
      framework: website.framework || 'Unknown',
      language: 'Unknown',
      charset: 'Unknown',
      viewport: '',
      generator: 'Unknown',
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    },
    pages: [],
    meta: {
      title: '',
      description: '',
      keywords: [],
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: '',
      twitterCard: '',
      twitterTitle: '',
      robotsMeta: '',
    },
    headings: { h1: [], h2: [], h3: [], totalCount: 0 },
    images: { totalCount: 0, missingAltCount: 0, withAltCount: 0, list: [] },
    links: {
      internalCount: 0,
      externalCount: 0,
      brokenCount: 0,
      internalLinks: [],
      externalLinks: [],
      brokenLinks: [],
    },
    files: {
      robotsTxt: { found: false, path: `${url.replace(/\/$/, '')}/robots.txt` },
      sitemapXml: { found: false, path: `${url.replace(/\/$/, '')}/sitemap.xml` },
      manifestJson: { found: false, path: `${url.replace(/\/$/, '')}/manifest.json` },
      favicon: { found: false, path: `${url.replace(/\/$/, '')}/favicon.ico` },
    },
    security: {
      httpsEnabled: url.startsWith('https'),
      tlsVersion: 'None',
      headers: {
        hsts: false,
        xFrameOptions: false,
        xContentTypeOptions: false,
        csp: false,
        referrerPolicy: false,
      },
    },
    performance: {
      htmlSizeBytes: 0,
      cssFilesCount: 0,
      cssSizeBytes: 0,
      jsFilesCount: 0,
      jsSizeBytes: 0,
      imageCount: 0,
      imageSizeBytes: 0,
      loadTimeMs: homepage.timingMs || 0,
    },
  };
}
