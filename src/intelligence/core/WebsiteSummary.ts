import type { WebsiteScanResult } from '../../types';
import type { WebsiteScores, WebsiteSummaryData } from '../types/WebsiteContext';
import type { WebsiteInsight } from '../types/WebsiteInsight';
import type { WebsiteRisk } from '../types/WebsiteRisk';
import type { WebsiteOpportunity } from '../types/WebsiteOpportunity';
import { WebsiteMetrics } from './WebsiteMetrics';

export class WebsiteSummary {
  public static build(
    scan: WebsiteScanResult,
    scores: WebsiteScores,
    insights: WebsiteInsight[],
    risks: WebsiteRisk[],
    opportunities: WebsiteOpportunity[]
  ): WebsiteSummaryData {
    const profile = WebsiteMetrics.buildProfile(scan);
    const criticalRisks = risks.filter((r) => r.severity === 'critical' || r.severity === 'high');
    const topInsights = insights
      .filter((i) => i.severity === 'important' || i.severity === 'critical' || i.severity === 'warning')
      .slice(0, 4);

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (scores.security >= 80) strengths.push('Solid security baseline (HTTPS/headers).');
    if (scores.seo >= 80) strengths.push('Strong SEO foundations detected.');
    if (profile.hasSitemap) strengths.push('XML sitemap present.');
    if (profile.mobileFriendly) strengths.push('Mobile-friendly viewport configured.');
    if (profile.pageCount >= 8) strengths.push(`Healthy page coverage (${profile.pageCount} pages).`);
    if (scores.performance >= 80) strengths.push('Performance metrics look healthy.');

    if (scores.seo < 70) weaknesses.push('SEO score needs improvement.');
    if (scores.performance < 70) weaknesses.push('Performance is below target.');
    if (profile.brokenLinks > 0) weaknesses.push(`${profile.brokenLinks} broken link(s) found.`);
    if (profile.imagesMissingAlt > 0) {
      weaknesses.push(`${profile.imagesMissingAlt} image(s) missing ALT text.`);
    }
    if (!profile.hasSitemap) weaknesses.push('Sitemap missing.');
    if (criticalRisks.length > 0) {
      weaknesses.push(`${criticalRisks.length} high/critical risk(s) require attention.`);
    }

    if (strengths.length === 0) strengths.push('Baseline scan completed — continue hardening key areas.');
    if (weaknesses.length === 0) weaknesses.push('No major structural weaknesses flagged from scanner data.');

    const priorityActions = [
      ...criticalRisks.slice(0, 2).map((r) => r.mitigation || r.title),
      ...topInsights.slice(0, 2).map((i) => i.recommendation || i.title),
      ...opportunities.slice(0, 2).map((o) => o.title),
    ].filter(Boolean).slice(0, 5) as string[];

    const headline = `${profile.websiteName} · Health ${scores.overall}/100 (${scores.grade})`;
    const overview = [
      `${profile.domain} runs on ${profile.framework}${profile.cms ? ` / ${profile.cms}` : ''}.`,
      `Scanner found ${profile.pageCount} pages, ${profile.internalLinks} internal links, and load time ${profile.loadingTimeMs}ms.`,
      `Intelligence derived ${insights.length} insights, ${risks.length} risks, and ${opportunities.length} opportunities from the latest scan — no AI inference used.`,
    ].join(' ');

    return {
      headline,
      overview,
      strengths,
      weaknesses,
      priorityActions,
    };
  }
}
