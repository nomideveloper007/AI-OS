import type { SEOIssue, SEOIssueCategory, SEOIssueSeverity } from '../types/SEOIssue';
import type {
  SEORecommendation,
  SEORecommendationPriority,
  SEORecommendationType,
} from '../types/SEORecommendation';
import type { SEOGeneratedTask } from '../types/SEOReport';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asImpact(value: unknown): 'high' | 'medium' | 'low' {
  const v = String(value || '').toLowerCase();
  if (v === 'high' || v === 'medium' || v === 'low') return v;
  return 'medium';
}

function asPriority(value: unknown): SEORecommendationPriority {
  const v = String(value || '').toLowerCase();
  if (v === 'critical' || v === 'high' || v === 'medium' || v === 'low') return v;
  return 'medium';
}

function asEffort(value: unknown): 'easy' | 'moderate' | 'hard' {
  const v = String(value || '').toLowerCase();
  if (v === 'easy' || v === 'moderate' || v === 'hard') return v;
  return 'moderate';
}

function asCategory(value: unknown): SEOIssueCategory {
  const allowed: SEOIssueCategory[] = [
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
    'general',
  ];
  const v = String(value || 'general') as SEOIssueCategory;
  return allowed.includes(v) ? v : 'general';
}

/**
 * Normalizes AI JSON into typed recommendations / issues / tasks.
 */
export class SEORecommendationEngine {
  public parseIssues(raw: unknown[], severity: SEOIssueSeverity): SEOIssue[] {
    return asArray(raw).map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: uid(`issue-${severity}`),
        category: asCategory(row.category),
        severity,
        title: asString(row.title, `${severity} issue ${index + 1}`),
        description: asString(row.description, 'No description provided'),
        evidence: asString(row.evidence) || undefined,
        estimatedImpact: asImpact(row.estimatedImpact),
        suggestedFix: asString(row.suggestedFix) || undefined,
      };
    });
  }

  public parseRecommendations(
    raw: unknown[],
    type: SEORecommendationType
  ): SEORecommendation[] {
    return asArray(raw).map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: uid(`rec-${type}`),
        type,
        priority: asPriority(row.priority),
        title: asString(row.title, `${type} ${index + 1}`),
        description: asString(row.description, ''),
        estimatedSeoImpact: asString(row.estimatedSeoImpact, 'TBD'),
        effort: asEffort(row.effort),
        relatedIssueIds: [],
        category: asString(row.category) || undefined,
      };
    });
  }

  public parseGeneratedTasks(raw: unknown[]): SEOGeneratedTask[] {
    return asArray(raw).map((item, index) => {
      const row = (item || {}) as Record<string, unknown>;
      return {
        id: uid('seotask'),
        title: asString(row.title, `SEO task ${index + 1}`),
        description: asString(row.description, ''),
        priority: asPriority(row.priority),
        category: asString(row.category, 'SEO'),
        estimatedImpact: asString(row.estimatedImpact, 'medium'),
        status: 'generated',
      };
    });
  }

  public enrich(
    critical: SEOIssue[],
    warnings: SEOIssue[],
    opportunities: SEOIssue[],
    quickWins: SEORecommendation[],
    longTerm: SEORecommendation[],
    tasks: SEOGeneratedTask[]
  ): {
    criticalIssues: SEOIssue[];
    warnings: SEOIssue[];
    opportunities: SEOIssue[];
    quickWins: SEORecommendation[];
    longTermImprovements: SEORecommendation[];
    recommendations: SEORecommendation[];
    generatedTasks: SEOGeneratedTask[];
  } {
    // Ensure every critical issue has at least one quick win if AI omitted them
    const ensuredQuickWins = [...quickWins];
    if (ensuredQuickWins.length === 0 && critical.length > 0) {
      for (const issue of critical.slice(0, 3)) {
        ensuredQuickWins.push({
          id: uid('rec-quick_win'),
          type: 'quick_win',
          priority: 'high',
          title: `Quick fix: ${issue.title}`,
          description: issue.suggestedFix || issue.description,
          estimatedSeoImpact: `${issue.estimatedImpact} impact`,
          effort: 'easy',
          relatedIssueIds: [issue.id],
          category: issue.category,
        });
      }
    }

    const recommendations = [...ensuredQuickWins, ...longTerm].sort((a, b) => {
      const order: Record<SEORecommendationPriority, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      return order[b.priority] - order[a.priority];
    });

    let ensuredTasks = [...tasks];
    if (ensuredTasks.length === 0) {
      ensuredTasks = recommendations.slice(0, 5).map((r) => ({
        id: uid('seotask'),
        title: r.title,
        description: r.description,
        priority: r.priority,
        category: 'SEO',
        estimatedImpact: r.estimatedSeoImpact,
        status: 'generated' as const,
      }));
    }

    return {
      criticalIssues: critical,
      warnings,
      opportunities,
      quickWins: ensuredQuickWins,
      longTermImprovements: longTerm,
      recommendations,
      generatedTasks: ensuredTasks,
    };
  }
}
