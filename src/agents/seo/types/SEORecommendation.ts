export type SEORecommendationType = 'quick_win' | 'long_term';
export type SEORecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface SEORecommendation {
  id: string;
  type: SEORecommendationType;
  priority: SEORecommendationPriority;
  title: string;
  description: string;
  estimatedSeoImpact: string;
  effort: 'easy' | 'moderate' | 'hard';
  relatedIssueIds: string[];
  category?: string;
}
