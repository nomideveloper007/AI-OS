/**
 * Vite middleware: server-side fetch for Website Scanner (bypasses browser CORS).
 * GET /api/scanner/fetch?url=<encoded>&method=GET|HEAD
 */
import type { Plugin } from 'vite';

const MAX_BODY_BYTES = 2_500_000;
const DEFAULT_TIMEOUT_MS = 20_000;

function isAllowedUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
      // allow local targets for testing
    }
    return u;
  } catch {
    return null;
  }
}

async function fetchTarget(
  target: URL,
  method: 'GET' | 'HEAD',
  timeoutMs: number
): Promise<{
  ok: boolean;
  status: number;
  statusText: string;
  finalUrl: string;
  redirected: boolean;
  headers: Record<string, string>;
  body: string;
  timingMs: number;
  error?: string;
}> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(target.toString(), {
      method,
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'AI-OS-WebsiteScanner/1.0 (+https://localhost; factual crawl; no AI)',
        Accept: method === 'HEAD' ? '*/*' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

    let body = '';
    if (method !== 'HEAD') {
      const buf = await response.arrayBuffer();
      const slice = buf.byteLength > MAX_BODY_BYTES ? buf.slice(0, MAX_BODY_BYTES) : buf;
      body = new TextDecoder('utf-8', { fatal: false }).decode(slice);
    }

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      finalUrl: response.url || target.toString(),
      redirected: response.redirected || response.url !== target.toString(),
      headers,
      body,
      timingMs: Date.now() - started,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : '';
    return {
      ok: false,
      status: 0,
      statusText: 'Error',
      finalUrl: target.toString(),
      redirected: false,
      headers: {},
      body: '',
      timingMs: Date.now() - started,
      error: name === 'AbortError' ? `timeout after ${timeoutMs}ms` : message,
    };
  } finally {
    clearTimeout(timer);
  }
}

export function scannerProxyPlugin(): Plugin {
  return {
    name: 'ai-os-scanner-proxy',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/scanner/fetch')) return next();

        try {
          const incoming = new URL(req.url, 'http://localhost');
          const rawUrl = incoming.searchParams.get('url') || '';
          const methodParam = (incoming.searchParams.get('method') || 'GET').toUpperCase();
          const method = methodParam === 'HEAD' ? 'HEAD' : 'GET';
          const timeoutMs = Math.min(
            Number(incoming.searchParams.get('timeout') || DEFAULT_TIMEOUT_MS),
            45_000
          );

          const target = isAllowedUrl(rawUrl);
          if (!target) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Invalid or unsupported url' }));
            return;
          }

          const result = await fetchTarget(target, method, timeoutMs);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(result));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'Scanner proxy failure',
            })
          );
        }
      });
    },
  };
}
