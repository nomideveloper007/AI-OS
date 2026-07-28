import { CEOTaskRecommendation, CEORiskItem, CEOOpportunityItem } from './CEOContext';

export class CEOTaskGenerator {
  public static generateTasks(risks: CEORiskItem[], opportunities: CEOOpportunityItem[]): CEOTaskRecommendation[] {
    const tasks: CEOTaskRecommendation[] = [];

    // Real tasks generated dynamically from risk audit
    risks.forEach((risk, i) => {
      tasks.push({
        id: `ceotask-risk-${Date.now()}-${i}`,
        title: `Address Risk: ${risk.title}`,
        description: `${risk.description} Mitigation Strategy: ${risk.mitigationStrategy}`,
        priority: risk.severity === 'Critical' ? 'Critical' : risk.severity === 'High' ? 'High' : 'Medium',
        category: 'Architecture',
        estimatedImpact: 'Risk Reduction',
        estimatedDifficulty: 'Moderate',
        suggestedAgent: 'Website Auditor Agent',
        reason: `Automated risk mitigation: ${risk.mitigationStrategy}`,
        status: 'Pending Approval',
        approvalRequired: true
      });
    });

    // Real tasks generated dynamically from growth opportunities
    opportunities.forEach((opp, i) => {
      tasks.push({
        id: `ceotask-opp-${Date.now()}-${i}`,
        title: `Pursue: ${opp.title}`,
        description: `${opp.description} Action Plan: ${opp.actionPlan}`,
        priority: 'High',
        category: 'Growth',
        estimatedImpact: opp.potentialGrowth,
        estimatedDifficulty: 'Hard',
        suggestedAgent: 'Growth Marketing Agent',
        reason: `Targeted growth strategy: ${opp.potentialGrowth}`,
        status: 'Pending Approval',
        approvalRequired: true
      });
    });

    // Baseline SEO & Content Tasks if empty
    if (tasks.length === 0) {
      tasks.push(
        {
          id: `ceotask-seo-1`,
          title: 'Improve Homepage Meta Title & H1 Hierarchy',
          description: 'Optimize homepage title tag with target primary keywords and structure H1-H3 heading hierarchy.',
          priority: 'High',
          category: 'SEO',
          estimatedImpact: 'High — CTR & ranking relevance',
          estimatedDifficulty: 'Moderate',
          suggestedAgent: 'SEO Specialist Agent',
          reason: 'Homepage meta title is missing targeted search keywords.',
          status: 'Pending Approval',
          approvalRequired: true
        },
        {
          id: `ceotask-seo-2`,
          title: 'Fix Missing ALT Text & Image Compression',
          description: 'Add descriptive ALT text to hero graphics and compress PNG assets to WebP.',
          priority: 'Medium',
          category: 'SEO',
          estimatedImpact: 'Medium — accessibility + image search',
          estimatedDifficulty: 'Moderate',
          suggestedAgent: 'SEO Specialist Agent',
          reason: 'Multiple images lack ALT text attributes.',
          status: 'Pending Approval',
          approvalRequired: true
        },
        {
          id: `ceotask-content-1`,
          title: 'Create Dedicated FAQ & Help Center Page',
          description: 'Publish structured FAQ content with JSON-LD schema to capture long-tail search queries.',
          priority: 'High',
          category: 'Content',
          estimatedImpact: 'High — organic + support deflection',
          estimatedDifficulty: 'Hard',
          suggestedAgent: 'Growth Marketing Agent',
          reason: 'Captures high-intent organic search volume.',
          status: 'Pending Approval',
          approvalRequired: true
        },
        {
          id: `ceotask-seo-3`,
          title: 'Optimize XML Sitemap & Robots.txt Protocol',
          description: 'Ensure all indexable URLs are included in XML sitemap and clean disallow directives.',
          priority: 'Medium',
          category: 'SEO',
          estimatedImpact: 'Medium — crawl efficiency',
          estimatedDifficulty: 'Hard',
          suggestedAgent: 'SEO Specialist Agent',
          reason: 'Crawl budget optimization for search indexing.',
          status: 'Pending Approval',
          approvalRequired: true
        },
        {
          id: `ceotask-content-2`,
          title: 'Publish 3 Targeted SEO Blog Articles',
          description: 'Ship 3 high-intent articles aligned to business goals and primary search terms.',
          priority: 'High',
          category: 'Content',
          estimatedImpact: 'High — compounding organic growth',
          estimatedDifficulty: 'Hard',
          suggestedAgent: 'Growth Marketing Agent',
          reason: 'Expands site keyword footprint and topical authority.',
          status: 'Pending Approval',
          approvalRequired: true
        },
        {
          id: `ceotask-perf-1`,
          title: 'Optimize Core Web Vitals & LCP Path',
          description: 'Reduce LCP/CLS and optimize critical rendering path for key landing pages.',
          priority: 'Critical',
          category: 'Performance',
          estimatedImpact: 'High — rankings + conversion UX',
          estimatedDifficulty: 'Moderate',
          suggestedAgent: 'Website Auditor Agent',
          reason: 'Core Web Vitals impact Google search ranking signals.',
          status: 'Pending Approval',
          approvalRequired: true
        }
      );
    }

    return tasks;
  }
}
