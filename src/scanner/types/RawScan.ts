export interface FetchedResource {
  requestedUrl: string;
  finalUrl: string;
  status: number;
  statusText: string;
  ok: boolean;
  redirected: boolean;
  headers: Record<string, string>;
  body: string;
  timingMs: number;
  error?: string;
  fetchedAt: string;
}

export interface RawScanRecord {
  id: string;
  websiteId: string;
  domain: string;
  homepage: FetchedResource;
  robotsTxt?: FetchedResource;
  sitemapXml?: FetchedResource;
  manifestJson?: FetchedResource;
  favicon?: FetchedResource;
  linkProbes: Array<{ url: string; status: number; timingMs: number; error?: string }>;
  createdAt: string;
}

export type ScanProgressCallback = (stepIndex: number, label: string) => void;
