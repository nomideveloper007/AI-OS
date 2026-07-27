/**
 * Centralized SEO Agent prompts — never construct prompts in UI components.
 * Keep payloads compact so gateway models (e.g. felo-chat) can return full JSON.
 */

export const SEO_PROMPT_VERSION = 'seo-audit-v2';

export const SEO_SYSTEM_PROMPT = `You are the SEO Agent inside AI OS.
Respond with ONE JSON object only. First character must be { and last must be }.
No markdown. No code fences. No quotes-only replies. No empty strings.
Use only facts from the input. If a signal is missing, score it lower and add an issue.`;

export const SEO_AUDIT_CHECKLIST = [
  'title_tags',
  'meta_descriptions',
  'heading_structure',
  'canonical_urls',
  'robots_txt',
  'sitemap_xml',
  'internal_linking',
  'external_links',
  'image_alt',
  'open_graph',
  'twitter_cards',
  'schema_markup',
  'content_quality',
  'keyword_usage',
  'page_speed',
  'mobile_friendliness',
] as const;

/** Compact example the model must mirror (keeps prompt small). */
export const SEO_OUTPUT_EXAMPLE = {
  overallSeoScore: 72,
  scores: {
    titleTags: 80,
    metaDescriptions: 55,
    headingStructure: 70,
    canonicalUrls: 75,
    robotsTxt: 90,
    sitemapXml: 40,
    internalLinking: 65,
    externalLinks: 70,
    imageAlt: 50,
    openGraph: 60,
    twitterCards: 55,
    schemaMarkup: 45,
    contentQuality: 68,
    keywordUsage: 62,
    pageSpeed: 78,
    mobileFriendliness: 85,
  },
  executiveSummary: 'Short SEO summary grounded in the provided signals.',
  criticalIssues: [
    {
      category: 'sitemap_xml',
      title: 'Missing sitemap',
      description: 'hasSitemap is false',
      evidence: 'hasSitemap=false',
      estimatedImpact: 'high',
      suggestedFix: 'Publish sitemap.xml',
    },
  ],
  warnings: [],
  opportunities: [],
  quickWins: [
    {
      title: 'Add sitemap.xml',
      description: 'Create and submit an XML sitemap',
      priority: 'high',
      estimatedSeoImpact: 'Better crawl coverage',
      effort: 'easy',
    },
  ],
  longTermImprovements: [],
  estimatedSeoImpact: 'High if crawl blockers are fixed',
  priority: 'high',
  generatedTasks: [
    {
      title: 'Publish sitemap.xml',
      description: 'Generate XML sitemap for all indexable URLs',
      priority: 'high',
      category: 'SEO',
      estimatedImpact: 'high',
    },
  ],
};

export function buildCompactWebsitePayload(website: Record<string, unknown>): Record<string, unknown> {
  const profile = (website.profile || {}) as Record<string, unknown>;
  const scores = (website.scores || {}) as Record<string, unknown>;
  const summary = (website.summary || {}) as Record<string, unknown>;
  const meta = (website.meta || {}) as Record<string, unknown>;

  return {
    domain: website.domain,
    name: website.name,
    intelligenceSeoScore: website.seoScore ?? scores.seo,
    metaTitle: profile.metaTitle ?? meta.title,
    metaDescription: profile.metaDescription ?? meta.description,
    hasRobots: profile.hasRobots ?? meta.robots,
    hasSitemap: profile.hasSitemap ?? meta.sitemap,
    hasOpenGraph: profile.hasOpenGraph ?? meta.openGraph,
    hasStructuredDataHint: profile.hasStructuredDataHint,
    brokenLinks: profile.brokenLinks ?? website.brokenLinks,
    internalLinks: profile.internalLinks,
    externalLinks: profile.externalLinks,
    imageCount: profile.imageCount,
    imagesMissingAlt: profile.imagesMissingAlt,
    mobileFriendly: profile.mobileFriendly,
    loadingTimeMs: profile.loadingTimeMs,
    pageCount: profile.pageCount,
    httpsEnabled: profile.httpsEnabled,
    scores: {
      overall: scores.overall,
      seo: scores.seo,
      performance: scores.performance,
      content: scores.content,
      accessibility: scores.accessibility,
    },
    summaryHeadline: summary.headline,
    summaryOverview: typeof summary.overview === 'string' ? summary.overview.slice(0, 280) : undefined,
    checklist: [...SEO_AUDIT_CHECKLIST],
  };
}

/** Primary user message: compact JSON request + tiny example. */
export function buildSEOAuditUserMessage(input: {
  task?: Record<string, unknown>;
  website: Record<string, unknown>;
  memory: Array<Record<string, unknown>>;
  previousReports: Array<Record<string, unknown>>;
}): string {
  return JSON.stringify({
    promptVersion: SEO_PROMPT_VERSION,
    instruction:
      'Audit SEO using website signals. Return ONE JSON object with the SAME keys as exampleOutput. Fill real values for this website.',
    task: input.task || {},
    website: buildCompactWebsitePayload(input.website),
    memory: input.memory.slice(0, 5),
    previousReports: input.previousReports.slice(0, 2),
    exampleOutput: SEO_OUTPUT_EXAMPLE,
  });
}

/** Shorter retry prompt when the first reply is empty or non-JSON. */
export function buildSEOAuditRetryMessage(website: Record<string, unknown>): string {
  const compact = buildCompactWebsitePayload(website);
  return [
    'Return ONLY valid JSON. Start with { end with }. No markdown.',
    'Keys required: overallSeoScore, scores, executiveSummary, criticalIssues, warnings, opportunities, quickWins, longTermImprovements, estimatedSeoImpact, priority, generatedTasks.',
    'scores must include: titleTags, metaDescriptions, headingStructure, canonicalUrls, robotsTxt, sitemapXml, internalLinking, externalLinks, imageAlt, openGraph, twitterCards, schemaMarkup, contentQuality, keywordUsage, pageSpeed, mobileFriendliness.',
    `website=${JSON.stringify(compact)}`,
  ].join('\n');
}
