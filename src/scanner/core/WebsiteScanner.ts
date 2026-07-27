import type { WebsiteItem, WebsiteScanResult, ScanLinkItem } from '../../types';
import type { RawScanRecord, ScanProgressCallback } from '../types/RawScan';
import type { ScanSnapshot } from '../types/ScanSnapshot';
import { HtmlFetcher } from './HtmlFetcher';
import { parseHtmlDocument } from './htmlUtils';
import {
  extractMeta,
  extractHeadings,
  extractImages,
  extractLinks,
  extractJsonLd,
  extractTechnical,
  extractSecurity,
  extractPerformance,
  buildPagesFromLinks,
  emptyFiles,
  countSitemapUrls,
} from './extractors';
import { buildFailedScan } from './ScanErrorMapper';
import { ScanLogger } from './ScanLogger';
import { ScanRepository } from '../repositories/ScanRepository';

export const SCAN_STEPS = [
  'Connecting...',
  'Reading homepage...',
  'Finding pages...',
  'Reading metadata...',
  'Checking robots.txt...',
  'Checking sitemap.xml...',
  'Collecting assets...',
  'Saving results...',
  'Completed.',
];

/**
 * Production Website Scanner — factual HTTP/HTML collection only.
 * Never calls AI. Output is WebsiteScanResult for Website Intelligence.
 */
export class WebsiteScanner {
  private static instance: WebsiteScanner;
  private fetcher = new HtmlFetcher();
  private logger = ScanLogger.getInstance();
  private repo = ScanRepository.getInstance();

  public static getInstance(): WebsiteScanner {
    if (!WebsiteScanner.instance) WebsiteScanner.instance = new WebsiteScanner();
    return WebsiteScanner.instance;
  }

  public async scan(
    website: WebsiteItem,
    onProgress?: ScanProgressCallback
  ): Promise<WebsiteScanResult> {
    const started = Date.now();
    const url = this.resolveStartUrl(website);
    const progress = (idx: number) => onProgress?.(idx, SCAN_STEPS[idx] || 'Scanning...');

    progress(0);
    this.logger.info(`Starting real scan for ${url}`, website.id);

    progress(1);
    const homepage = await this.fetcher.fetch(url, { method: 'GET', timeoutMs: 25000 });

    if (!homepage.ok || homepage.status === 0 || !homepage.body) {
      this.logger.error(`Homepage fetch failed: ${homepage.error || homepage.status}`, website.id);
      const failed = buildFailedScan(website, homepage, started);
      this.persist(failed, {
        id: `raw-${failed.id}`,
        websiteId: website.id,
        domain: website.domain,
        homepage,
        linkProbes: [],
        createdAt: new Date().toISOString(),
      });
      progress(8);
      return failed;
    }

    progress(2);
    const doc = parseHtmlDocument(homepage.body);
    const jsonLd = extractJsonLd(doc);
    const meta = extractMeta(doc, homepage.finalUrl);
    if (jsonLd.count > 0 && !meta.keywords.includes('json-ld')) {
      meta.keywords = [...meta.keywords, 'json-ld', 'schema.org', ...jsonLd.types.slice(0, 5)];
    }

    progress(3);
    const headings = extractHeadings(doc);
    const images = extractImages(doc, homepage.finalUrl);
    const linkData = extractLinks(doc, homepage.finalUrl);
    const technical = extractTechnical(doc, homepage, meta, jsonLd.count);
    const security = extractSecurity(homepage);

    progress(4);
    const origin = new URL(homepage.finalUrl).origin;
    const robots = await this.fetcher.fetch(`${origin}/robots.txt`, { timeoutMs: 12000 });
    const files = emptyFiles(homepage.finalUrl);
    files.robotsTxt = {
      found: robots.ok && robots.status === 200 && /user-agent/i.test(robots.body),
      path: `${origin}/robots.txt`,
      content: robots.ok ? robots.body.slice(0, 8000) : undefined,
    };

    progress(5);
    let sitemapUrl = `${origin}/sitemap.xml`;
    const robotsSitemap = robots.body.match(/sitemap:\s*(\S+)/i)?.[1];
    if (robotsSitemap) {
      try {
        sitemapUrl = new URL(robotsSitemap, origin).toString();
      } catch {
        // keep default
      }
    }
    const sitemap = await this.fetcher.fetch(sitemapUrl, { timeoutMs: 15000 });
    const sitemapUrls: string[] = [];
    if (sitemap.ok && sitemap.status === 200 && /<urlset|<sitemapindex/i.test(sitemap.body)) {
      files.sitemapXml = {
        found: true,
        path: sitemapUrl,
        urlCount: countSitemapUrls(sitemap.body),
      };
      const locs = [...sitemap.body.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
      for (const loc of locs.slice(0, 30)) {
        if (loc.startsWith('http')) sitemapUrls.push(loc);
      }
    } else {
      files.sitemapXml = { found: false, path: sitemapUrl };
    }

    progress(6);
    const manifestHref =
      doc.querySelector('link[rel="manifest"]')?.getAttribute('href') || '/manifest.json';
    const manifestUrl = new URL(manifestHref, homepage.finalUrl).toString();
    const manifest = await this.fetcher.fetch(manifestUrl, { timeoutMs: 10000 });
    if (manifest.ok && manifest.status === 200) {
      let name: string | undefined;
      try {
        name = (JSON.parse(manifest.body) as { name?: string; short_name?: string }).name ||
          (JSON.parse(manifest.body) as { short_name?: string }).short_name;
      } catch {
        name = undefined;
      }
      files.manifestJson = { found: true, path: manifestUrl, name };
    } else {
      files.manifestJson = { found: false, path: manifestUrl };
    }

    const faviconProbe = await this.fetcher.fetch(technical.favicon, { method: 'HEAD', timeoutMs: 8000 });
    files.favicon = {
      found: faviconProbe.ok && faviconProbe.status > 0 && faviconProbe.status < 400,
      path: technical.favicon,
    };

    // Probe a limited set of links for broken status (factual HEAD/GET)
    const probeTargets = [
      ...linkData.internal.slice(0, 12).map((l) => l.url),
      ...linkData.external.slice(0, 8).map((l) => l.url),
      ...images.brokenCandidates.slice(0, 6),
    ];
    const linkProbes: RawScanRecord['linkProbes'] = [];
    const statusByUrl = new Map<string, number>();

    for (const target of probeTargets) {
      const probe = await this.fetcher.fetch(target, { method: 'HEAD', timeoutMs: 8000 });
      let status = probe.status;
      // Some hosts block HEAD — fall back to GET
      if (status === 0 || status === 405 || status === 501) {
        const getProbe = await this.fetcher.fetch(target, { method: 'GET', timeoutMs: 8000 });
        status = getProbe.status;
        linkProbes.push({
          url: target,
          status,
          timingMs: getProbe.timingMs,
          error: getProbe.error,
        });
      } else {
        linkProbes.push({
          url: target,
          status,
          timingMs: probe.timingMs,
          error: probe.error,
        });
      }
      statusByUrl.set(target, status);
    }

    const markBroken = (items: ScanLinkItem[]): ScanLinkItem[] =>
      items.map((item) => {
        const status = statusByUrl.get(item.url);
        if (status == null) return { ...item };
        const broken = status >= 400 || status === 0;
        return { ...item, statusCode: status, isBroken: broken };
      });

    const internalLinks = markBroken(linkData.internal);
    const externalLinks = markBroken(linkData.external);
    const brokenLinks = [...internalLinks, ...externalLinks].filter((l) => l.isBroken);
    const brokenImages = images.list.filter((img) => {
      const st = statusByUrl.get(img.src);
      return st != null && (st >= 400 || st === 0);
    }).length;

    const performance = extractPerformance(doc, homepage, images.totalCount);

  const pages = buildPagesFromLinks(
      homepage.finalUrl,
      linkData.allInternalUrls,
      homepage.status,
      homepage.timingMs,
      meta.title || technical.title,
      sitemapUrls
    ).map((p) => {
      const st = statusByUrl.get(p.url);
      if (st != null && p.statusCode === 0) return { ...p, statusCode: st };
      return p;
    });

    progress(7);
    const scan: WebsiteScanResult = {
      id: `scan-${Date.now()}`,
      website_id: website.id,
      domain: technical.domain || website.domain,
      status: 'completed',
      error_type: null,
      scan_date: new Date().toISOString(),
      duration_ms: Date.now() - started,
      technical,
      pages,
      meta,
      headings,
      images: {
        totalCount: images.totalCount,
        missingAltCount: images.missingAltCount,
        withAltCount: images.withAltCount,
        list: images.list,
      },
      links: {
        internalCount: internalLinks.length,
        externalCount: externalLinks.length,
        brokenCount: brokenLinks.length + brokenImages,
        internalLinks: internalLinks.slice(0, 40),
        externalLinks: externalLinks.slice(0, 25),
        brokenLinks: brokenLinks.slice(0, 30),
      },
      files,
      security,
      performance,
    };

    // Annotate JSON-LD discovery without changing WebsiteScanResult shape:
    // keywords already include json-ld; generator includes count when present.
    if (jsonLd.count > 0) {
      this.logger.info(`JSON-LD blocks found: ${jsonLd.count} (${jsonLd.types.join(', ')})`, website.id);
    }

    const raw: RawScanRecord = {
      id: `raw-${scan.id}`,
      websiteId: website.id,
      domain: scan.domain,
      homepage: { ...homepage, body: homepage.body.slice(0, 400_000) },
      robotsTxt: robots,
      sitemapXml: sitemap,
      manifestJson: manifest,
      favicon: faviconProbe,
      linkProbes,
      createdAt: new Date().toISOString(),
    };

    this.persist(scan, raw);
    this.logger.info(
      `Scan completed ${scan.domain} status=${homepage.status} links=${scan.links.internalCount}/${scan.links.externalCount} broken=${scan.links.brokenCount}`,
      website.id,
      { durationMs: scan.duration_ms, jsonLd: jsonLd.count }
    );

    progress(8);
    return scan;
  }

  private persist(scan: WebsiteScanResult, raw: RawScanRecord): void {
    this.repo.saveProcessed(scan);
    this.repo.saveRaw(raw);
    this.repo.saveSnapshot(this.toSnapshot(scan));
  }

  private toSnapshot(scan: WebsiteScanResult): ScanSnapshot {
    return {
      id: `snap-${scan.id}`,
      websiteId: scan.website_id,
      scanId: scan.id,
      domain: scan.domain,
      createdAt: scan.scan_date,
      status: scan.status,
      httpStatus: scan.technical.statusCode,
      https: scan.security.httpsEnabled,
      loadTimeMs: scan.performance.loadTimeMs,
      title: scan.technical.title,
      internalLinks: scan.links.internalCount,
      externalLinks: scan.links.externalCount,
      brokenLinks: scan.links.brokenCount,
      images: scan.images.totalCount,
      missingAlt: scan.images.missingAltCount,
      hasRobots: scan.files.robotsTxt.found,
      hasSitemap: scan.files.sitemapXml.found,
      hasOpenGraph: Boolean(scan.meta.ogTitle || scan.meta.ogImage),
      hasJsonLd: (scan.meta.keywords || []).some((k) => k.toLowerCase().includes('json-ld')),
      htmlSizeBytes: scan.performance.htmlSizeBytes,
    };
  }

  private resolveStartUrl(website: WebsiteItem): string {
    let url = (website.url || '').trim();
    if (!url) url = `https://${website.domain}`;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    return url;
  }

  public getRepository(): ScanRepository {
    return this.repo;
  }

  public getLogger(): ScanLogger {
    return this.logger;
  }
}
