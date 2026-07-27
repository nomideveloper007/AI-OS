export type ConditionType = 
  | 'Website Exists' 
  | 'Memory Exists' 
  | 'Agent Available' 
  | 'Approval Granted' 
  | 'AI Connected' 
  | 'Workflow Success' 
  | 'Workflow Failed';

export interface WorkflowCondition {
  id: string;
  name: ConditionType;
  description: string;
  parameters?: Record<string, string>;
}
