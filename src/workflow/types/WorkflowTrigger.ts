export type WorkflowTrigger = 
  | 'Manual' 
  | 'Website Scan Completed' 
  | 'Memory Updated' 
  | 'Agent Finished' 
  | 'Daily Schedule' 
  | 'Hourly Schedule' 
  | 'API Event' 
  | 'Webhook' 
  | 'Custom Event';
