import type { SEOReport } from './SEOReport';

export type SEOAuditStatus =
  | 'pending'
  | 'gathering_context'
  | 'analyzing'
  | 'generating_report'
  | 'saving'
  | 'completed'
  | 'failed';

export interface SEOAuditInput {
  websiteId?: string;
  domain?: string;
  taskId?: string;
  taskTitle?: string;
  taskDescription?: string;
  requestedBy?: string;
}

export interface SEOAuditContextSnapshot {
  websiteContextLoaded: boolean;
  memoryItemsLoaded: number;
  previousReportsLoaded: number;
  seoIntelligencePayload?: Record<string, unknown>;
  memorySnippets: string[];
}

export interface SEOAudit {
  id: string;
  status: SEOAuditStatus;
  progress: number;
  message: string;
  input: SEOAuditInput;
  domain: string;
  websiteId?: string;
  context?: SEOAuditContextSnapshot;
  reportId?: string;
  report?: SEOReport;
  errorMessage?: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  logs: Array<{
    id: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: string;
  }>;
}
