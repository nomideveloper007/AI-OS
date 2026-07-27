import type { FetchedResource } from '../types/RawScan';

const PROXY = '/api/scanner/fetch';

export class HtmlFetcher {
  public async fetch(
    url: string,
    options?: { method?: 'GET' | 'HEAD'; timeoutMs?: number }
  ): Promise<FetchedResource> {
    const method = options?.method || 'GET';
    const timeoutMs = options?.timeoutMs ?? 20000;
    const endpoint = `${PROXY}?url=${encodeURIComponent(url)}&method=${method}&timeout=${timeoutMs}`;
    const fetchedAt = new Date().toISOString();

    try {
      const res = await fetch(endpoint);
      const data = (await res.json()) as {
        ok?: boolean;
        status?: number;
        statusText?: string;
        finalUrl?: string;
        redirected?: boolean;
        headers?: Record<string, string>;
        body?: string;
        timingMs?: number;
        error?: string;
      };

      if (!res.ok && data.error) {
        return {
          requestedUrl: url,
          finalUrl: url,
          status: 0,
          statusText: 'Proxy Error',
          ok: false,
          redirected: false,
          headers: {},
          body: '',
          timingMs: data.timingMs || 0,
          error: data.error,
          fetchedAt,
        };
      }

      return {
        requestedUrl: url,
        finalUrl: data.finalUrl || url,
        status: data.status ?? 0,
        statusText: data.statusText || '',
        ok: Boolean(data.ok),
        redirected: Boolean(data.redirected),
        headers: data.headers || {},
        body: data.body || '',
        timingMs: data.timingMs || 0,
        error: data.error,
        fetchedAt,
      };
    } catch (err) {
      return {
        requestedUrl: url,
        finalUrl: url,
        status: 0,
        statusText: 'Network Error',
        ok: false,
        redirected: false,
        headers: {},
        body: '',
        timingMs: 0,
        error: err instanceof Error ? err.message : String(err),
        fetchedAt,
      };
    }
  }
}
