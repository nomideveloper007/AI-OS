export type MetricCategory =
  | 'seo'
  | 'performance'
  | 'security'
  | 'accessibility'
  | 'content'
  | 'structure'
  | 'technical';

export interface WebsiteMetric {
  id: string;
  key: string;
  label: string;
  category: MetricCategory;
  value: number | string | boolean;
  unit?: string;
  score?: number;
  note?: string;
}
