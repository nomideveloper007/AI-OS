import { CEOTaskRecommendation, CEORiskItem, CEOOpportunityItem } from './CEOContext';

export class CEOTaskGenerator {
  public static generateTasks(risks: CEORiskItem[], opportunities: CEOOpportunityItem[]): CEOTaskRecommendation[] {
    const tasks: CEOTaskRecommendation[] = [
      {
        id: `ceotask-${Date.now()}-1`,
        title: 'Improve Homepage Meta Title & Description',
        description: 'Optimize page title tag to include target primary keywords and craft a compelling 155-character meta description.',
        priority: 'High',
        category: 'SEO',
        estimatedImpact: 'High',
        estimatedDifficulty: 'Easy',
        suggestedAgent: 'SEO Specialist Agent',
        reason: 'Current homepage title lacks target keyword focus for search rankings.',
        status: 'Pending Approval',
        approvalRequired: true
      },
      {
        id: `ceotask-${Date.now()}-2`,
        title: 'Create Missing FAQ & Support Page',
        description: 'Add a dedicated FAQ section with JSON-LD schema markup to capture long-tail user search queries.',
        priority: 'Medium',
        category: 'Content',
        estimatedImpact: 'High',
        estimatedDifficulty: 'Moderate',
        suggestedAgent: 'Growth Marketing Agent',
        reason: 'Reduces support friction and improves search rich snippet eligibility.',
        status: 'Pending Approval',
        approvalRequired: true
      },
      {
        id: `ceotask-${Date.now()}-3`,
        title: 'Optimize Large Hero Images to WebP',
        description: 'Convert PNG hero graphics to WebP and set explicit width/height dimensions to prevent layout shifts.',
        priority: 'Medium',
        category: 'Performance',
        estimatedImpact: 'Medium',
        estimatedDifficulty: 'Easy',
        suggestedAgent: 'Website Auditor Agent',
        reason: 'Decreases Mobile Core Web Vitals LCP by ~350ms.',
        status: 'Pending Approval',
        approvalRequired: true
      },
      {
        id: `ceotask-${Date.now()}-4`,
        title: 'Improve Internal Cross-Linking Structure',
        description: 'Add contextual internal links between blog articles and core product feature pages.',
        priority: 'Low',
        category: 'UX',
        estimatedImpact: 'Medium',
        estimatedDifficulty: 'Moderate',
        suggestedAgent: 'SEO Specialist Agent',
        reason: 'Distributes PageRank authority evenly across site pages.',
        status: 'Pending Approval',
        approvalRequired: true
      }
    ];

    return tasks;
  }
}
