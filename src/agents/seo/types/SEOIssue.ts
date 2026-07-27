export type SEOIssueSeverity = 'critical' | 'warning' | 'opportunity';

export type SEOIssueCategory =
  | 'title_tags'
  | 'meta_descriptions'
  | 'heading_structure'
  | 'canonical_urls'
  | 'robots_txt'
  | 'sitemap_xml'
  | 'internal_linking'
  | 'external_links'
  | 'image_alt'
  | 'open_graph'
  | 'twitter_cards'
  | 'schema_markup'
  | 'content_quality'
  | 'keyword_usage'
  | 'page_speed'
  | 'mobile_friendliness'
  | 'general';

export interface SEOIssue {
  id: string;
  category: SEOIssueCategory;
  severity: SEOIssueSeverity;
  title: string;
  description: string;
  evidence?: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  suggestedFix?: string;
}
