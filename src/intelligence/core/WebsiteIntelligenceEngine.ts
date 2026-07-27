import type { WebsiteScanResult, WebsiteItem } from '../../types';
import type { WebsiteContext } from '../types/WebsiteContext';
import { WebsiteAnalyzer } from './WebsiteAnalyzer';
import { WebsiteContextBuilder } from './WebsiteContextBuilder';
import { WebsiteHistory, type SnapshotComparison } from './WebsiteHistory';
import { WebsiteLogger } from './WebsiteLogger';
import { WebsiteContextRepository } from '../repositories/WebsiteContextRepository';
import { WebsiteInsightsRepository } from '../repositories/WebsiteInsightsRepository';

/**
 * Website Intelligence Engine — facade.
 * Input: Website Scanner results only.
 * Output: Structured WebsiteContext for agents / memory / reports / workflows.
 * Never crawls. Never calls AI.
 */
export class WebsiteIntelligenceEngine {
  private static instance: WebsiteIntelligenceEngine;
  private analyzer = new WebsiteAnalyzer();
  private contextRepo = WebsiteContextRepository.getInstance();
  private insightsRepo = WebsiteInsightsRepository.getInstance();
  private logger = WebsiteLogger.getInstance();

  private constructor() {
    this.logger.info('Website Intelligence Engine ready', 'WebsiteIntelligenceEngine');
  }

  public static getInstance(): WebsiteIntelligenceEngine {
    if (!WebsiteIntelligenceEngine.instance) {
      WebsiteIntelligenceEngine.instance = new WebsiteIntelligenceEngine();
    }
    return WebsiteIntelligenceEngine.instance;
  }

  /**
   * Transform a completed (or failed) scanner result into structured business knowledge.
   */
  public analyzeScan(scan: WebsiteScanResult, website?: WebsiteItem): WebsiteContext {
    const context = this.analyzer.analyze(scan, website);
    this.contextRepo.save(context);
    this.insightsRepo.saveInsights(
      context.id,
      context.websiteId,
      context.domain,
      context.analyzedAt,
      context.insights
    );
    this.insightsRepo.saveSnapshot(context.snapshot);
    this.logger.info(`Stored intelligence snapshot ${context.snapshot.id}`, 'WebsiteIntelligenceEngine');
    return context;
  }

  /**
   * Analyze the newest completed scan for a website.
   */
  public analyzeLatestScan(
    scans: WebsiteScanResult[],
    websiteId: string,
    website?: WebsiteItem
  ): WebsiteContext | null {
    const latest = scans
      .filter((s) => s.website_id === websiteId)
      .sort((a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime())[0];

    if (!latest) {
      this.logger.warn(`No scans found for website ${websiteId}`, 'WebsiteIntelligenceEngine');
      return null;
    }

    return this.analyzeScan(latest, website);
  }

  public getContext(contextId: string): WebsiteContext | undefined {
    return this.contextRepo.getById(contextId);
  }

  public getLatestContext(websiteId: string): WebsiteContext | undefined {
    return this.contextRepo.getLatestForWebsite(websiteId);
  }

  public getHistory(websiteId: string) {
    return WebsiteHistory.timeline(this.insightsRepo.getSnapshotsForWebsite(websiteId));
  }

  public compareLatest(websiteId: string): SnapshotComparison | null {
    const history = this.getHistory(websiteId);
    if (history.length < 2) return null;
    return WebsiteHistory.compare(history[0], history[1]);
  }

  public buildAgentContext(context: WebsiteContext) {
    return WebsiteContextBuilder.forAgents(context);
  }

  public buildCeoContext(context: WebsiteContext) {
    return WebsiteContextBuilder.forCeo(context);
  }

  public buildSeoContext(context: WebsiteContext) {
    return WebsiteContextBuilder.forSeoAgent(context);
  }

  public buildContentContext(context: WebsiteContext) {
    return WebsiteContextBuilder.forContentAgent(context);
  }

  public buildGrowthContext(context: WebsiteContext) {
    return WebsiteContextBuilder.forGrowthAgent(context);
  }

  public buildMemoryPayload(context: WebsiteContext) {
    return WebsiteContextBuilder.forMemory(context);
  }

  public getLogger(): WebsiteLogger {
    return this.logger;
  }
}
