export type ActionType = 
  | 'Read Memory' 
  | 'Read Scan' 
  | 'Call AI Engine' 
  | 'Generate Report' 
  | 'Create Task' 
  | 'Notify Admin' 
  | 'Wait Approval' 
  | 'Save Memory' 
  | 'Run Agent' 
  | 'Complete Workflow';

export interface WorkflowAction {
  id: string;
  name: ActionType;
  description: string;
  target?: string;
  parameters?: Record<string, string>;
}
