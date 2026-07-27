export type OpportunityCategory =
  | 'seo_growth'
  | 'content_growth'
  | 'performance'
  | 'user_experience'
  | 'marketing'
  | 'monetization';

export type OpportunityImpact = 'high' | 'medium' | 'low';

export interface WebsiteOpportunity {
  id: string;
  category: OpportunityCategory;
  impact: OpportunityImpact;
  title: string;
  description: string;
  estimatedEffort?: 'low' | 'medium' | 'high';
  expectedBenefit?: string;
}
