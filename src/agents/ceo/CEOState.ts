export type CEOAgentStatus = 'Idle' | 'Reading Context' | 'Analyzing AI' | 'Generating Report' | 'Creating Tasks' | 'Waiting Approval' | 'Completed' | 'Error';

export interface CEOStateData {
  status: CEOAgentStatus;
  lastAnalysisTimestamp?: string;
  currentProgressPercent: number;
  currentStepMessage: string;
  totalAnalysesRun: number;
  activeReportId?: string;
}
