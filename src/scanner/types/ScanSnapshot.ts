import type { WebsiteScanResult } from '../../types';

export interface ScanSnapshot {
  id: string;
  websiteId: string;
  scanId: string;
  domain: string;
  createdAt: string;
  status: WebsiteScanResult['status'];
  httpStatus: number;
  https: boolean;
  loadTimeMs: number;
  title: string;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  images: number;
  missingAlt: number;
  hasRobots: boolean;
  hasSitemap: boolean;
  hasOpenGraph: boolean;
  hasJsonLd: boolean;
  htmlSizeBytes: number;
}
