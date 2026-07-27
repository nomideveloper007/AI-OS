export interface MissionResult {
  executiveSummary: string;
  scanId?: string;
  intelligenceContextId?: string;
  ceoReportId?: string;
  collaborationSessionId?: string;
  collaborationReportId?: string;
  taskIds: string[];
  memoryItemIds: string[];
  reportMemoryId?: string;
  keyFindings: string[];
  recommendations: string[];
  confidenceScore: number;
  generatedAt: string;
}
