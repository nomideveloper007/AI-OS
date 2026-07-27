export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';
export type RiskCategory =
  | 'security'
  | 'seo'
  | 'performance'
  | 'accessibility'
  | 'reliability'
  | 'compliance'
  | 'content';

export interface WebsiteRisk {
  id: string;
  severity: RiskSeverity;
  category: RiskCategory;
  title: string;
  description: string;
  impact: string;
  mitigation?: string;
}
