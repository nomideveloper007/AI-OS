export function normalizeUrl(base: string, href: string): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (
    !trimmed ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:')
  ) {
    return null;
  }
  try {
    return new URL(trimmed, base).toString();
  } catch {
    return null;
  }
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function sameHost(a: string, b: string): boolean {
  try {
    return new URL(a).hostname.replace(/^www\./, '') === new URL(b).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
}

export function parseHtmlDocument(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

export function metaContent(doc: Document, selectors: string[]): string {
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    const content = el?.getAttribute('content') || el?.getAttribute('href') || '';
    if (content.trim()) return content.trim();
  }
  return '';
}

export function detectFramework(html: string, headers: Record<string, string>, generator: string): string {
  const h = html.toLowerCase();
  const gen = generator.toLowerCase();
  const powered = (headers['x-powered-by'] || '').toLowerCase();
  if (h.includes('__next') || h.includes('/_next/') || gen.includes('next')) return 'Next.js';
  if (h.includes('data-reactroot') || h.includes('react')) return 'React';
  if (h.includes('ng-version') || h.includes('ng-app')) return 'Angular';
  if (h.includes('data-v-') || h.includes('vue')) return 'Vue';
  if (gen.includes('wordpress') || h.includes('wp-content')) return 'WordPress';
  if (gen.includes('shopify') || h.includes('cdn.shopify')) return 'Shopify';
  if (powered.includes('express')) return 'Node.js';
  if (powered.includes('php') || gen.includes('wordpress')) return 'PHP';
  if (generator) return generator;
  return 'Unknown';
}
