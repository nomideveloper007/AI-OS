export interface SEOScoreBreakdown {
  overall: number;
  titleTags: number;
  metaDescriptions: number;
  headingStructure: number;
  canonicalUrls: number;
  robotsTxt: number;
  sitemapXml: number;
  internalLinking: number;
  externalLinks: number;
  imageAlt: number;
  openGraph: number;
  twitterCards: number;
  schemaMarkup: number;
  contentQuality: number;
  keywordUsage: number;
  pageSpeed: number;
  mobileFriendliness: number;
}

export type SEOGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface SEOScore {
  breakdown: SEOScoreBreakdown;
  grade: SEOGrade;
  previousOverall?: number;
  delta?: number;
}
