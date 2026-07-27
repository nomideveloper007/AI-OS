export type InsightSeverity = 'info' | 'warning' | 'important' | 'critical';
export type InsightCategory =
  | 'seo'
  | 'performance'
  | 'accessibility'
  | 'security'
  | 'content'
  | 'structure'
  | 'technical';

export interface WebsiteInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  description: string;
  evidence?: string;
  recommendation?: string;
}
