import type {
  ScanMetaData,
  ScanHeadings,
  ScanImagesData,
  ScanLinkItem,
  ScanFilesData,
  ScanSecurityData,
  ScanPerformanceData,
  ScanTechnicalData,
  DiscoveredPage,
} from '../../types';
import { getDomain, metaContent, normalizeUrl, sameHost, detectFramework } from './htmlUtils';
import type { FetchedResource } from '../types/RawScan';

export function extractMeta(doc: Document, finalUrl: string): ScanMetaData {
  const title =
    doc.querySelector('title')?.textContent?.trim() ||
    metaContent(doc, ['meta[property="og:title"]']) ||
    '';

  const keywordsRaw = metaContent(doc, ['meta[name="keywords"]']);
  const keywords = keywordsRaw
    ? keywordsRaw
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
    : [];

  return {
    title,
    description: metaContent(doc, ['meta[name="description"]', 'meta[property="og:description"]']),
    keywords,
    canonicalUrl:
      doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ||
      metaContent(doc, ['meta[property="og:url"]']) ||
      finalUrl,
    ogTitle: metaContent(doc, ['meta[property="og:title"]']),
    ogDescription: metaContent(doc, ['meta[property="og:description"]']),
    ogImage: metaContent(doc, ['meta[property="og:image"]']),
    ogType: metaContent(doc, ['meta[property="og:type"]']),
    twitterCard: metaContent(doc, ['meta[name="twitter:card"]']),
    twitterTitle: metaContent(doc, ['meta[name="twitter:title"]']),
    robotsMeta: metaContent(doc, ['meta[name="robots"]', 'meta[name="googlebot"]']),
  };
}

export function extractHeadings(doc: Document): ScanHeadings {
  const grab = (tag: string) =>
    Array.from(doc.querySelectorAll(tag))
      .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .slice(0, 30);

  const h1 = grab('h1');
  const h2 = grab('h2');
  const h3 = grab('h3');
  const h4 = grab('h4');
  const h5 = grab('h5');
  const h6 = grab('h6');

  return {
    h1,
    h2,
    h3,
    totalCount: h1.length + h2.length + h3.length + h4.length + h5.length + h6.length,
  };
}

export function extractImages(doc: Document, baseUrl: string): ScanImagesData & { brokenCandidates: string[] } {
  const nodes = Array.from(doc.querySelectorAll('img'));
  const list = nodes.slice(0, 80).map((img) => {
    const src = normalizeUrl(baseUrl, img.getAttribute('src') || img.getAttribute('data-src') || '') || '';
    const alt = img.getAttribute('alt') ?? '';
    const width = Number(img.getAttribute('width')) || undefined;
    const height = Number(img.getAttribute('height')) || undefined;
    const missingAlt = !alt.trim();
    return { src, alt, width, height, missingAlt };
  }).filter((i) => i.src);

  const missingAltCount = list.filter((i) => i.missingAlt).length;
  return {
    totalCount: nodes.length,
    missingAltCount,
    withAltCount: Math.max(0, nodes.length - missingAltCount),
    list,
    brokenCandidates: list.map((i) => i.src).filter(Boolean).slice(0, 12),
  };
}

export function extractLinks(
  doc: Document,
  baseUrl: string
): {
  internal: ScanLinkItem[];
  external: ScanLinkItem[];
  allInternalUrls: string[];
} {
  const anchors = Array.from(doc.querySelectorAll('a[href]'));
  const internalMap = new Map<string, ScanLinkItem>();
  const externalMap = new Map<string, ScanLinkItem>();

  for (const a of anchors) {
    const href = a.getAttribute('href') || '';
    const absolute = normalizeUrl(baseUrl, href);
    if (!absolute) continue;
    const text = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    const external = !sameHost(baseUrl, absolute);
    const item: ScanLinkItem = {
      url: absolute,
      text: text || absolute,
      isExternal: external,
      isBroken: false,
    };
    if (external) {
      if (!externalMap.has(absolute)) externalMap.set(absolute, item);
    } else if (!internalMap.has(absolute)) {
      internalMap.set(absolute, item);
    }
  }

  return {
    internal: Array.from(internalMap.values()),
    external: Array.from(externalMap.values()),
    allInternalUrls: Array.from(internalMap.keys()),
  };
}

export function extractJsonLd(doc: Document): { count: number; types: string[]; rawSnippets: string[] } {
  const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
  const types: string[] = [];
  const rawSnippets: string[] = [];

  for (const s of scripts.slice(0, 10)) {
    const text = (s.textContent || '').trim();
    if (!text) continue;
    rawSnippets.push(text.slice(0, 500));
    try {
      const parsed = JSON.parse(text) as { '@type'?: string | string[] } | Array<{ '@type'?: string }>;
      const collect = (node: { '@type'?: string | string[] }) => {
        if (!node?.['@type']) return;
        if (Array.isArray(node['@type'])) types.push(...node['@type']);
        else types.push(String(node['@type']));
      };
      if (Array.isArray(parsed)) parsed.forEach((n) => collect(n));
      else collect(parsed);
    } catch {
      // ignore invalid json-ld
    }
  }

  return { count: scripts.length, types: Array.from(new Set(types)), rawSnippets };
}

export function extractTechnical(
  doc: Document,
  homepage: FetchedResource,
  meta: ScanMetaData,
  jsonLdCount: number
): ScanTechnicalData {
  const finalUrl = homepage.finalUrl || homepage.requestedUrl;
  const domain = getDomain(finalUrl);
  const protocol = finalUrl.startsWith('https') ? 'HTTPS' : 'HTTP';
  const charset =
    doc.querySelector('meta[charset]')?.getAttribute('charset') ||
    /charset=([^;\s"']+)/i.exec(
      doc.querySelector('meta[http-equiv="Content-Type"]')?.getAttribute('content') || ''
    )?.[1] ||
    /charset=([^;\s]+)/i.exec(homepage.headers['content-type'] || '')?.[1] ||
    doc.characterSet ||
    'UTF-8';
  const viewport = metaContent(doc, ['meta[name="viewport"]']);
  const generator = metaContent(doc, ['meta[name="generator"]']);
  const language =
    doc.documentElement.getAttribute('lang') ||
    metaContent(doc, ['meta[http-equiv="content-language"]', 'meta[name="language"]']) ||
    'unknown';
  const faviconHref =
    doc.querySelector('link[rel="icon"]')?.getAttribute('href') ||
    doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') ||
    '/favicon.ico';
  const favicon = normalizeUrl(finalUrl, faviconHref) || `https://${domain}/favicon.ico`;
  const logo =
    normalizeUrl(
      finalUrl,
      doc.querySelector('img[alt*="logo" i]')?.getAttribute('src') ||
        doc.querySelector('header img')?.getAttribute('src') ||
        ''
    ) || undefined;

  let framework = detectFramework(homepage.body, homepage.headers, generator);
  if (jsonLdCount > 0 && framework === 'Unknown') framework = 'Unknown (JSON-LD present)';

  return {
    title: meta.title || domain,
    homepageUrl: homepage.requestedUrl,
    finalUrl,
    domain,
    protocol,
    statusCode: homepage.status,
    server: homepage.headers['server'] || homepage.headers['x-powered-by'] || 'Unknown',
    framework,
    language,
    charset,
    viewport,
    generator: generator || (jsonLdCount > 0 ? `JSON-LD:${jsonLdCount}` : 'Unknown'),
    favicon,
    logo,
  };
}

export function extractSecurity(homepage: FetchedResource): ScanSecurityData {
  const headers = homepage.headers;
  const httpsEnabled = (homepage.finalUrl || homepage.requestedUrl).startsWith('https');
  return {
    httpsEnabled,
    tlsVersion: httpsEnabled ? 'TLS (browser/proxy verified HTTPS)' : 'None',
    headers: {
      hsts: Boolean(headers['strict-transport-security']),
      xFrameOptions: Boolean(headers['x-frame-options']),
      xContentTypeOptions: Boolean(headers['x-content-type-options']),
      csp: Boolean(headers['content-security-policy'] || headers['content-security-policy-report-only']),
      referrerPolicy: Boolean(headers['referrer-policy']),
    },
  };
}

export function extractPerformance(
  doc: Document,
  homepage: FetchedResource,
  imageCount: number
): ScanPerformanceData {
  const cssLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
  const scripts = Array.from(doc.querySelectorAll('script[src]'));
  const inlineStyles = Array.from(doc.querySelectorAll('style'));
  const htmlSizeBytes = new TextEncoder().encode(homepage.body).length;

  // Size of external assets unknown without extra fetches — estimate from URL hints + inline
  const cssSizeBytes = inlineStyles.reduce((s, el) => s + (el.textContent?.length || 0), 0);
  const jsInline = Array.from(doc.querySelectorAll('script:not([src])')).reduce(
    (s, el) => s + (el.textContent?.length || 0),
    0
  );

  return {
    htmlSizeBytes,
    cssFilesCount: cssLinks.length,
    cssSizeBytes,
    jsFilesCount: scripts.length,
    jsSizeBytes: jsInline,
    imageCount,
    imageSizeBytes: 0,
    loadTimeMs: homepage.timingMs,
  };
}

export function buildPagesFromLinks(
  finalUrl: string,
  internalUrls: string[],
  homepageStatus: number,
  homepageTiming: number,
  homepageTitle: string,
  sitemapUrls: string[]
): DiscoveredPage[] {
  const pages: DiscoveredPage[] = [];
  const seen = new Set<string>();

  const add = (url: string, title: string, statusCode: number, loadTimeMs: number, type: string) => {
    try {
      const u = new URL(url);
      const key = u.origin + u.pathname;
      if (seen.has(key)) return;
      seen.add(key);
      pages.push({
        id: `page-${pages.length + 1}`,
        path: u.pathname || '/',
        url: u.toString(),
        title,
        statusCode,
        loadTimeMs,
        type,
      });
    } catch {
      // skip
    }
  };

  add(finalUrl, homepageTitle || 'Home', homepageStatus, homepageTiming, 'Home');

  for (const url of [...sitemapUrls, ...internalUrls].slice(0, 40)) {
    if (pages.length >= 25) break;
    let type = 'Page';
    const path = (() => {
      try {
        return new URL(url).pathname.toLowerCase();
      } catch {
        return '';
      }
    })();
    if (path.includes('about')) type = 'About';
    else if (path.includes('contact')) type = 'Contact';
    else if (path.includes('blog')) type = 'Blog';
    else if (path.includes('pricing')) type = 'Pricing';
    else if (path.includes('faq')) type = 'FAQ';
    else if (path.includes('login') || path.includes('signin')) type = 'Auth';
    add(url, path || url, 0, 0, type);
  }

  return pages;
}

export function emptyFiles(baseUrl: string): ScanFilesData {
  const origin = (() => {
    try {
      return new URL(baseUrl).origin;
    } catch {
      return baseUrl.replace(/\/$/, '');
    }
  })();
  return {
    robotsTxt: { found: false, path: `${origin}/robots.txt` },
    sitemapXml: { found: false, path: `${origin}/sitemap.xml` },
    manifestJson: { found: false, path: `${origin}/manifest.json` },
    favicon: { found: false, path: `${origin}/favicon.ico` },
  };
}

export function countSitemapUrls(xml: string): number {
  const matches = xml.match(/<loc[\s>]/gi);
  return matches ? matches.length : 0;
}
