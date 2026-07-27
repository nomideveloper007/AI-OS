import type { WebsiteScanResult } from '../../types';
import type { WebsiteOpportunity } from '../types/WebsiteOpportunity';
import { WebsiteMetrics } from './WebsiteMetrics';
import { WebsiteScore } from './WebsiteScore';

let oppSeq = 0;
function uid(): string {
  oppSeq += 1;
  return `opp-${Date.now()}-${oppSeq}`;
}

export class WebsiteOpportunityAnalyzer {
  public static analyze(scan: WebsiteScanResult): WebsiteOpportunity[] {
    if (scan.status !== 'completed') return [];

    const opportunities: WebsiteOpportunity[] = [];
    const profile = WebsiteMetrics.buildProfile(scan);
    const scores = WebsiteScore.compute(scan);
    const paths = scan.pages.map((p) => p.path.toLowerCase());

    if (scores.seo < 85) {
      opportunities.push({
        id: uid(),
        category: 'seo_growth',
        impact: 'high',
        title: 'SEO foundation uplift',
        description: 'Improve titles, meta, sitemap/robots, and fix broken links to raise organic visibility.',
        estimatedEffort: 'medium',
        expectedBenefit: 'Higher crawl efficiency and SERP CTR.',
      });
    }

    if (!paths.some((p) => p.includes('blog') || p.includes('guide'))) {
      opportunities.push({
        id: uid(),
        category: 'content_growth',
        impact: 'high',
        title: 'Launch content / blog hub',
        description: 'No content hub detected — a blog or guides section can capture informational demand.',
        estimatedEffort: 'high',
        expectedBenefit: 'Sustainable organic traffic growth.',
      });
    } else {
      opportunities.push({
        id: uid(),
        category: 'content_growth',
        impact: 'medium',
        title: 'Expand topical content clusters',
        description: 'Content surface exists; deepen clusters around primary earning/product keywords.',
        estimatedEffort: 'medium',
        expectedBenefit: 'Stronger topical authority.',
      });
    }

    if (scores.performance < 80 || scan.performance.jsSizeBytes > 400 * 1024) {
      opportunities.push({
        id: uid(),
        category: 'performance',
        impact: 'high',
        title: 'Performance optimization sprint',
        description: 'Reduce JS/CSS weight and improve load time for better engagement.',
        estimatedEffort: 'medium',
        expectedBenefit: 'Improved conversion and Core Web Vitals.',
      });
    }

    if (scan.images.missingAltCount > 0 || !profile.mobileFriendly) {
      opportunities.push({
        id: uid(),
        category: 'user_experience',
        impact: 'medium',
        title: 'Accessibility & mobile UX polish',
        description: 'Fix ALT gaps and ensure responsive viewport/meta for inclusive UX.',
        estimatedEffort: 'low',
        expectedBenefit: 'Broader audience reach and fewer UX friction points.',
      });
    }

    if (!profile.hasOpenGraph) {
      opportunities.push({
        id: uid(),
        category: 'marketing',
        impact: 'medium',
        title: 'Social preview optimization',
        description: 'Complete OpenGraph/Twitter cards for shareable campaigns.',
        estimatedEffort: 'low',
        expectedBenefit: 'Higher social CTR from shared links.',
      });
    }

    if (
      paths.some((p) => p.includes('pricing') || p.includes('register') || p.includes('checkout'))
    ) {
      opportunities.push({
        id: uid(),
        category: 'monetization',
        impact: 'high',
        title: 'Conversion path instrumentation',
        description: 'Monetization/signup paths exist — instrument funnels and landing clarity.',
        estimatedEffort: 'medium',
        expectedBenefit: 'Higher signup/purchase conversion.',
      });
    } else {
      opportunities.push({
        id: uid(),
        category: 'monetization',
        impact: 'medium',
        title: 'Clarify monetization entry points',
        description: 'No obvious pricing/checkout/register funnel pages were detected.',
        estimatedEffort: 'high',
        expectedBenefit: 'Clearer path from visitor to revenue.',
      });
    }

    if (!paths.some((p) => p.includes('faq'))) {
      opportunities.push({
        id: uid(),
        category: 'marketing',
        impact: 'low',
        title: 'Add FAQ for trust & long-tail SEO',
        description: 'FAQ content reduces support load and captures question-style queries.',
        estimatedEffort: 'low',
        expectedBenefit: 'Better trust signals and featured-snippet potential.',
      });
    }

    return opportunities;
  }
}
