import { WebsiteScanResult, WebsiteItem } from '../types';

export const initialScans: WebsiteScanResult[] = [
  {
    id: 'scan-1',
    website_id: 'web-1',
    domain: 'tasktomoney.com',
    status: 'completed',
    error_type: null,
    scan_date: '2024-07-26T14:30:00.000Z',
    duration_ms: 3840,
    technical: {
      title: 'Task To Money - Complete Microtasks & Automate Online Income',
      homepageUrl: 'https://tasktomoney.com',
      finalUrl: 'https://tasktomoney.com/',
      domain: 'tasktomoney.com',
      protocol: 'HTTPS',
      statusCode: 200,
      server: 'Cloudflare / Edge Server',
      framework: 'Next.js 14',
      language: 'en',
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1',
      generator: 'Next.js',
      favicon: 'https://www.google.com/s2/favicons?domain=tasktomoney.com&sz=64',
      logo: 'https://tasktomoney.com/logo.png'
    },
    pages: [
      { id: 'p-1', path: '/', url: 'https://tasktomoney.com/', title: 'Home', statusCode: 200, loadTimeMs: 240, type: 'Landing' },
      { id: 'p-2', path: '/about', url: 'https://tasktomoney.com/about', title: 'About Us', statusCode: 200, loadTimeMs: 190, type: 'Informational' },
      { id: 'p-3', path: '/features', url: 'https://tasktomoney.com/features', title: 'Platform Features', statusCode: 200, loadTimeMs: 210, type: 'Product' },
      { id: 'p-4', path: '/pricing', url: 'https://tasktomoney.com/pricing', title: 'Pricing & Payouts', statusCode: 200, loadTimeMs: 180, type: 'Commerce' },
      { id: 'p-5', path: '/faq', url: 'https://tasktomoney.com/faq', title: 'Frequently Asked Questions', statusCode: 200, loadTimeMs: 150, type: 'Support' },
      { id: 'p-6', path: '/privacy', url: 'https://tasktomoney.com/privacy', title: 'Privacy Policy', statusCode: 200, loadTimeMs: 160, type: 'Legal' },
      { id: 'p-7', path: '/terms', url: 'https://tasktomoney.com/terms', title: 'Terms of Service', statusCode: 200, loadTimeMs: 155, type: 'Legal' },
      { id: 'p-8', path: '/contact', url: 'https://tasktomoney.com/contact', title: 'Contact Support', statusCode: 200, loadTimeMs: 175, type: 'Contact' },
      { id: 'p-9', path: '/login', url: 'https://tasktomoney.com/login', title: 'Member Sign In', statusCode: 200, loadTimeMs: 205, type: 'Auth' },
      { id: 'p-10', path: '/register', url: 'https://tasktomoney.com/register', title: 'Create Free Account', statusCode: 200, loadTimeMs: 215, type: 'Auth' },
      { id: 'p-11', path: '/dashboard', url: 'https://tasktomoney.com/dashboard', title: 'User Dashboard', statusCode: 200, loadTimeMs: 290, type: 'App' },
      { id: 'p-12', path: '/blog', url: 'https://tasktomoney.com/blog', title: 'Earning Guides Blog', statusCode: 200, loadTimeMs: 230, type: 'Content' },
    ],
    meta: {
      title: 'Task To Money - Complete Microtasks & Automate Online Income',
      description: 'Join thousands of active users completing simple tasks, surveys, and offerwalls to generate automated daily income.',
      keywords: ['microtasks', 'online income', 'earning app', 'task automation', 'rewards'],
      canonicalUrl: 'https://tasktomoney.com/',
      ogTitle: 'Task To Money - Automate Your Online Income',
      ogDescription: 'Start completing high-paying tasks and micro-gigs today.',
      ogImage: 'https://tasktomoney.com/og-banner.png',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: 'Task To Money Platform',
      robotsMeta: 'index, follow, max-snippet:-1, max-image-preview:large'
    },
    headings: {
      h1: ['Automate Your Daily Online Tasks & Income', 'Discover Available Offerwalls'],
      h2: ['How Task To Money Works', 'Top Earning Categories', 'Instant Payout Options', 'Real User Testimonials', 'Frequently Asked Questions'],
      h3: ['1. Sign Up Free', '2. Pick Microtasks', '3. Receive Payouts', 'Enterprise Security', 'Edge Fast CDN'],
      totalCount: 28
    },
    images: {
      totalCount: 42,
      missingAltCount: 4,
      withAltCount: 38,
      list: [
        { src: 'https://tasktomoney.com/images/hero-banner.webp', alt: 'Task To Money Dashboard Hero', width: 1200, height: 630, missingAlt: false },
        { src: 'https://tasktomoney.com/images/offerwall-icon.png', alt: 'Offerwall Provider Logo', width: 128, height: 128, missingAlt: false },
        { src: 'https://tasktomoney.com/images/payout-methods.svg', alt: 'Instant Crypto & Bank Payouts', width: 400, height: 120, missingAlt: false },
        { src: 'https://tasktomoney.com/images/unnamed-graphic.png', alt: '', width: 200, height: 200, missingAlt: true },
        { src: 'https://tasktomoney.com/images/avatar-user1.jpg', alt: 'Top Earner Profile Avatar', width: 80, height: 80, missingAlt: false },
        { src: 'https://tasktomoney.com/images/avatar-user2.jpg', alt: '', width: 80, height: 80, missingAlt: true },
      ]
    },
    links: {
      internalCount: 84,
      externalCount: 16,
      brokenCount: 1,
      internalLinks: [
        { url: 'https://tasktomoney.com/about', text: 'About Us', isExternal: false, isBroken: false, statusCode: 200 },
        { url: 'https://tasktomoney.com/pricing', text: 'Pricing & Fees', isExternal: false, isBroken: false, statusCode: 200 },
        { url: 'https://tasktomoney.com/faq', text: 'Help Center', isExternal: false, isBroken: false, statusCode: 200 },
      ],
      externalLinks: [
        { url: 'https://twitter.com/tasktomoney', text: 'Twitter Profile', isExternal: true, isBroken: false, statusCode: 200 },
        { url: 'https://discord.gg/tasktomoney', text: 'Discord Community', isExternal: true, isBroken: false, statusCode: 200 },
      ],
      brokenLinks: [
        { url: 'https://tasktomoney.com/old-promotions-2023', text: 'Expired Offer Page', isExternal: false, isBroken: true, statusCode: 404 }
      ]
    },
    files: {
      robotsTxt: {
        found: true,
        path: 'https://tasktomoney.com/robots.txt',
        content: `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/private/\n\nSitemap: https://tasktomoney.com/sitemap.xml`
      },
      sitemapXml: {
        found: true,
        path: 'https://tasktomoney.com/sitemap.xml',
        urlCount: 48
      },
      manifestJson: {
        found: true,
        path: 'https://tasktomoney.com/manifest.json',
        name: 'Task To Money PWA App'
      },
      favicon: {
        found: true,
        path: 'https://tasktomoney.com/favicon.ico'
      }
    },
    security: {
      httpsEnabled: true,
      tlsVersion: 'TLS v1.3',
      headers: {
        hsts: true,
        xFrameOptions: true,
        xContentTypeOptions: true,
        csp: true,
        referrerPolicy: true
      }
    },
    performance: {
      htmlSizeBytes: 34500, // 34.5 KB
      cssFilesCount: 3,
      cssSizeBytes: 78200, // 78.2 KB
      jsFilesCount: 8,
      jsSizeBytes: 245000, // 245 KB
      imageCount: 42,
      imageSizeBytes: 1450000, // 1.45 MB
      loadTimeMs: 420
    }
  },
  {
    id: 'scan-2',
    website_id: 'web-2',
    domain: 'ai-os.io',
    status: 'completed',
    error_type: null,
    scan_date: '2024-07-25T10:15:00.000Z',
    duration_ms: 3120,
    technical: {
      title: 'AI OS - Autonomous AI Workforce Operating System',
      homepageUrl: 'https://ai-os.io',
      finalUrl: 'https://ai-os.io/',
      domain: 'ai-os.io',
      protocol: 'HTTPS',
      statusCode: 200,
      server: 'Vercel / AWS Edge',
      framework: 'React / Vite',
      language: 'en-US',
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1.0',
      generator: 'Vite',
      favicon: 'https://www.google.com/s2/favicons?domain=ai-os.io&sz=64'
    },
    pages: [
      { id: 'p-1', path: '/', url: 'https://ai-os.io/', title: 'AI OS Control Panel', statusCode: 200, loadTimeMs: 180, type: 'Dashboard' },
      { id: 'p-2', path: '/about', url: 'https://ai-os.io/about', title: 'Architecture Overview', statusCode: 200, loadTimeMs: 140, type: 'Docs' },
      { id: 'p-3', path: '/features', url: 'https://ai-os.io/features', title: 'AI Workforce Capabilities', statusCode: 200, loadTimeMs: 160, type: 'Product' }
    ],
    meta: {
      title: 'AI OS - Autonomous AI Workforce Operating System',
      description: 'Enterprise dashboard for controlling autonomous AI agents, monitoring tasks, and executing website governance.',
      keywords: ['AI OS', 'Workforce', 'AI Agents', 'Automation'],
      canonicalUrl: 'https://ai-os.io/',
      ogTitle: 'AI OS Control Panel',
      ogDescription: 'Manage your AI workforce from a single dashboard.',
      ogImage: 'https://ai-os.io/og-image.png',
      ogType: 'website',
      twitterCard: 'summary',
      twitterTitle: 'AI OS Platform',
      robotsMeta: 'index, follow'
    },
    headings: {
      h1: ['Autonomous AI Workforce Control Center'],
      h2: ['Active Agents', 'System Health', 'Task Automation Metrics'],
      h3: ['CEO Agent', 'SEO Agent', 'Growth Agent'],
      totalCount: 14
    },
    images: {
      totalCount: 18,
      missingAltCount: 1,
      withAltCount: 17,
      list: [
        { src: 'https://ai-os.io/assets/logo.svg', alt: 'AI OS Brand Logo', width: 200, height: 60, missingAlt: false }
      ]
    },
    links: {
      internalCount: 35,
      externalCount: 8,
      brokenCount: 0,
      internalLinks: [],
      externalLinks: [],
      brokenLinks: []
    },
    files: {
      robotsTxt: { found: true, path: 'https://ai-os.io/robots.txt', content: 'User-agent: *\nAllow: /' },
      sitemapXml: { found: true, path: 'https://ai-os.io/sitemap.xml', urlCount: 24 },
      manifestJson: { found: true, path: 'https://ai-os.io/manifest.json', name: 'AI OS Web App' },
      favicon: { found: true, path: 'https://ai-os.io/favicon.ico' }
    },
    security: {
      httpsEnabled: true,
      tlsVersion: 'TLS v1.3',
      headers: { hsts: true, xFrameOptions: true, xContentTypeOptions: true, csp: true, referrerPolicy: true }
    },
    performance: {
      htmlSizeBytes: 22000,
      cssFilesCount: 2,
      cssSizeBytes: 52000,
      jsFilesCount: 5,
      jsSizeBytes: 180000,
      imageCount: 18,
      imageSizeBytes: 650000,
      loadTimeMs: 290
    }
  }
];

export interface ScanProgressStep {
  stepIndex: number;
  label: string;
  progressPercent: number;
}

export const SCAN_STEPS = [
  'Connecting...',
  'Reading homepage...',
  'Finding pages...',
  'Reading metadata...',
  'Checking robots.txt...',
  'Checking sitemap.xml...',
  'Collecting assets...',
  'Saving results...',
  'Completed.'
];

// Helper to generate a new comprehensive scan for any website item
export const generateNewScanForWebsite = (website: WebsiteItem, errorType?: string): WebsiteScanResult => {
  const isFailed = Boolean(errorType && errorType !== 'none');
  const now = new Date().toISOString();
  const domain = website.domain || 'example.com';
  const url = website.url || `https://${domain}`;

  if (isFailed) {
    let errorMsg = 'Failed to establish connection to target server.';
    if (errorType === 'offline') errorMsg = `Server ${domain} is currently unreachable or offline.`;
    if (errorType === 'timeout') errorMsg = `HTTP connection timed out after 30,000ms.`;
    if (errorType === 'ssl_error') errorMsg = `SSL Certificate validation error: Hostname mismatch or expired cert on ${domain}.`;
    if (errorType === 'dns_error') errorMsg = `DNS resolution failed: ENOTFOUND for host ${domain}.`;
    if (errorType === 'blocked') errorMsg = `Request blocked by target server firewall or Cloudflare WAF (HTTP 403 Forbidden).`;
    if (errorType === 'http_500') errorMsg = `Internal Server Error returned by upstream server (HTTP 500).`;

    return {
      id: `scan-${Date.now()}`,
      website_id: website.id,
      domain,
      status: 'failed',
      error_type: errorType as any,
      error_message: errorMsg,
      scan_date: now,
      duration_ms: 1250,
      technical: {
        title: 'Connection Failed',
        homepageUrl: url,
        finalUrl: url,
        domain,
        protocol: url.startsWith('https') ? 'HTTPS' : 'HTTP',
        statusCode: errorType === 'blocked' ? 403 : errorType === 'http_500' ? 500 : 0,
        server: 'Unknown / Offline',
        framework: website.framework || 'Unknown',
        language: 'Unknown',
        charset: 'Unknown',
        viewport: 'Unknown',
        generator: 'Unknown',
        favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
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
        robotsMeta: ''
      },
      headings: { h1: [], h2: [], h3: [], totalCount: 0 },
      images: { totalCount: 0, missingAltCount: 0, withAltCount: 0, list: [] },
      links: { internalCount: 0, externalCount: 0, brokenCount: 0, internalLinks: [], externalLinks: [], brokenLinks: [] },
      files: {
        robotsTxt: { found: false, path: `${url}/robots.txt` },
        sitemapXml: { found: false, path: `${url}/sitemap.xml` },
        manifestJson: { found: false, path: `${url}/manifest.json` },
        favicon: { found: false, path: `${url}/favicon.ico` }
      },
      security: { httpsEnabled: url.startsWith('https'), tlsVersion: 'None', headers: { hsts: false, xFrameOptions: false, xContentTypeOptions: false, csp: false, referrerPolicy: false } },
      performance: { htmlSizeBytes: 0, cssFilesCount: 0, cssSizeBytes: 0, jsFilesCount: 0, jsSizeBytes: 0, imageCount: 0, imageSizeBytes: 0, loadTimeMs: 0 }
    };
  }

  // Successful Comprehensive Scan Simulation
  return {
    id: `scan-${Date.now()}`,
    website_id: website.id,
    domain,
    status: 'completed',
    error_type: null,
    scan_date: now,
    duration_ms: Math.floor(Math.random() * 2000) + 2500,
    technical: {
      title: `${website.name} - Official Technical Hub`,
      homepageUrl: url,
      finalUrl: `${url}/`,
      domain,
      protocol: url.startsWith('https') ? 'HTTPS' : 'HTTP',
      statusCode: 200,
      server: 'nginx / Cloudflare Edge',
      framework: website.framework || 'React',
      language: 'en',
      charset: 'UTF-8',
      viewport: 'width=device-width, initial-scale=1.0',
      generator: website.framework || 'Next.js',
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      logo: `${url}/logo.png`
    },
    pages: [
      { id: `p-1-${Date.now()}`, path: '/', url: `${url}/`, title: `${website.name} Homepage`, statusCode: 200, loadTimeMs: 190, type: 'Home' },
      { id: `p-2-${Date.now()}`, path: '/about', url: `${url}/about`, title: `About ${website.name}`, statusCode: 200, loadTimeMs: 160, type: 'About' },
      { id: `p-3-${Date.now()}`, path: '/contact', url: `${url}/contact`, title: 'Contact Us', statusCode: 200, loadTimeMs: 175, type: 'Contact' },
      { id: `p-4-${Date.now()}`, path: '/faq', url: `${url}/faq`, title: 'Frequently Asked Questions', statusCode: 200, loadTimeMs: 140, type: 'FAQ' },
      { id: `p-5-${Date.now()}`, path: '/privacy', url: `${url}/privacy`, title: 'Privacy Policy', statusCode: 200, loadTimeMs: 130, type: 'Legal' },
      { id: `p-6-${Date.now()}`, path: '/terms', url: `${url}/terms`, title: 'Terms of Service', statusCode: 200, loadTimeMs: 135, type: 'Legal' },
      { id: `p-7-${Date.now()}`, path: '/blog', url: `${url}/blog`, title: 'Official Blog', statusCode: 200, loadTimeMs: 210, type: 'Blog' },
      { id: `p-8-${Date.now()}`, path: '/login', url: `${url}/login`, title: 'Sign In', statusCode: 200, loadTimeMs: 185, type: 'Auth' },
      { id: `p-9-${Date.now()}`, path: '/register', url: `${url}/register`, title: 'Create Account', statusCode: 200, loadTimeMs: 195, type: 'Auth' },
      { id: `p-10-${Date.now()}`, path: '/dashboard', url: `${url}/dashboard`, title: 'Dashboard', statusCode: 200, loadTimeMs: 250, type: 'Dashboard' },
      { id: `p-11-${Date.now()}`, path: '/pricing', url: `${url}/pricing`, title: 'Pricing & Plans', statusCode: 200, loadTimeMs: 170, type: 'Pricing' },
      { id: `p-12-${Date.now()}`, path: '/features', url: `${url}/features`, title: 'Key Features', statusCode: 200, loadTimeMs: 180, type: 'Features' },
    ],
    meta: {
      title: `${website.name} - Official Technical Hub`,
      description: website.description || `Welcome to ${website.name}, built with ${website.framework || 'modern tech'}.`,
      keywords: [website.category.toLowerCase(), domain, 'ai-os', website.framework.toLowerCase()],
      canonicalUrl: `${url}/`,
      ogTitle: `${website.name} - Main Portal`,
      ogDescription: website.description || `Connected to AI OS workforce engine.`,
      ogImage: `${url}/og-social.png`,
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: website.name,
      robotsMeta: 'index, follow, max-snippet:-1'
    },
    headings: {
      h1: [`Welcome to ${website.name}`, 'Transform Your Online Operations'],
      h2: ['Main Features Overview', 'Client Case Studies', 'Frequently Asked Questions', 'Get Started Today'],
      h3: ['Fast Execution', 'Secure Infrastructure', '24/7 Monitoring', 'Integrated Analytics'],
      totalCount: 22
    },
    images: {
      totalCount: 26,
      missingAltCount: 2,
      withAltCount: 24,
      list: [
        { src: `${url}/images/hero-banner.webp`, alt: `${website.name} Hero Banner`, width: 1200, height: 630, missingAlt: false },
        { src: `${url}/images/feature-1.png`, alt: 'Feature Diagram', width: 600, height: 400, missingAlt: false },
        { src: `${url}/images/unnamed-icon.svg`, alt: '', width: 64, height: 64, missingAlt: true },
        { src: `${url}/images/footer-logo.png`, alt: `${website.name} Footer Logo`, width: 180, height: 50, missingAlt: false }
      ]
    },
    links: {
      internalCount: 62,
      externalCount: 14,
      brokenCount: 0,
      internalLinks: [
        { url: `${url}/about`, text: 'About Us', isExternal: false, isBroken: false, statusCode: 200 },
        { url: `${url}/contact`, text: 'Contact Us', isExternal: false, isBroken: false, statusCode: 200 },
        { url: `${url}/pricing`, text: 'Pricing', isExternal: false, isBroken: false, statusCode: 200 }
      ],
      externalLinks: [
        { url: 'https://github.com', text: 'GitHub Repo', isExternal: true, isBroken: false, statusCode: 200 },
        { url: 'https://twitter.com', text: 'Twitter', isExternal: true, isBroken: false, statusCode: 200 }
      ],
      brokenLinks: []
    },
    files: {
      robotsTxt: {
        found: true,
        path: `${url}/robots.txt`,
        content: `User-agent: *\nAllow: /\nSitemap: ${url}/sitemap.xml`
      },
      sitemapXml: {
        found: true,
        path: `${url}/sitemap.xml`,
        urlCount: 35
      },
      manifestJson: {
        found: true,
        path: `${url}/manifest.json`,
        name: `${website.name} Web App`
      },
      favicon: {
        found: true,
        path: `${url}/favicon.ico`
      }
    },
    security: {
      httpsEnabled: url.startsWith('https'),
      tlsVersion: 'TLS v1.3',
      headers: {
        hsts: true,
        xFrameOptions: true,
        xContentTypeOptions: true,
        csp: true,
        referrerPolicy: true
      }
    },
    performance: {
      htmlSizeBytes: 28400,
      cssFilesCount: 3,
      cssSizeBytes: 64000,
      jsFilesCount: 6,
      jsSizeBytes: 210000,
      imageCount: 26,
      imageSizeBytes: 980000,
      loadTimeMs: 340
    }
  };
};
