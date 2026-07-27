import type { WebsiteInsight } from './WebsiteInsight';
import type { WebsiteRisk } from './WebsiteRisk';
import type { WebsiteOpportunity } from './WebsiteOpportunity';
import type { WebsiteMetric } from './WebsiteMetric';

export type HealthGrade = 'excellent' | 'good' | 'fair' | 'poor' | 'critical';

export interface WebsiteScores {
  overall: number;
  seo: number;
  performance: number;
  security: number;
  accessibility: number;
  content: number;
  maintainability: number;
  grade: HealthGrade;
}

export interface WebsiteProfile {
  websiteName: string;
  domain: string;
  description: string;
  technologyStack: string[];
  framework: string;
  cms: string | null;
  protocol: string;
  server: string;
  language: string;
  mobileFriendly: boolean;
  pageCount: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: number;
  imageCount: number;
  imagesMissingAlt: number;
  hasRobots: boolean;
  hasSitemap: boolean;
  hasOpenGraph: boolean;
  hasStructuredDataHint: boolean;
  metaTitle: string;
  metaDescription: string;
  loadingTimeMs: number;
  httpsEnabled: boolean;
}

export interface WebsiteSummaryData {
  headline: string;
  overview: string;
  strengths: string[];
  weaknesses: string[];
  priorityActions: string[];
}

export interface WebsiteSnapshotData {
  id: string;
  websiteId: string;
  scanId: string;
  domain: string;
  createdAt: string;
  scores: WebsiteScores;
  insightCount: number;
  riskCount: number;
  opportunityCount: number;
  overallHealth: number;
}

/**
 * Single source of truth about a website — consumed by agents, reports, workflows, memory.
 * Built ONLY from scanner results (never crawled, never AI-generated).
 */
export interface WebsiteContext {
  id: string;
  websiteId: string;
  scanId: string;
  domain: string;
  name: string;
  analyzedAt: string;
  profile: WebsiteProfile;
  scores: WebsiteScores;
  summary: WebsiteSummaryData;
  metrics: WebsiteMetric[];
  insights: WebsiteInsight[];
  risks: WebsiteRisk[];
  opportunities: WebsiteOpportunity[];
  snapshot: WebsiteSnapshotData;
}
