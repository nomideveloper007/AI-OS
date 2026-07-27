export type CEOActionType = 
  | 'Read Website' 
  | 'Read Scanner' 
  | 'Read Reports' 
  | 'Read Memory' 
  | 'Read Workflows' 
  | 'Read Agents' 
  | 'Create Tasks' 
  | 'Create Reports' 
  | 'Create Recommendations' 
  | 'Store Memory' 
  | 'Request Approval';

export type CEODeniedAction = 
  | 'Edit Website' 
  | 'Deploy Code' 
  | 'Delete Files' 
  | 'Execute Terminal' 
  | 'Modify Database' 
  | 'Send Emails' 
  | 'Publish Content' 
  | 'Approve Self' 
  | 'Run Background Automation';

export class CEOPermissions {
  private static readonly ALLOWED_ACTIONS: Set<string> = new Set([
    'Read Website',
    'Read Scanner',
    'Read Reports',
    'Read Memory',
    'Read Workflows',
    'Read Agents',
    'Create Tasks',
    'Create Reports',
    'Create Recommendations',
    'Store Memory',
    'Request Approval'
  ]);

  public static isAllowed(action: string): boolean {
    return CEOPermissions.ALLOWED_ACTIONS.has(action);
  }

  public static assertAllowed(action: string): void {
    if (!CEOPermissions.isAllowed(action)) {
      throw new Error(`[CEO Security Violation] CEO Agent is NOT permitted to perform: ${action}. Action strictly denied.`);
    }
  }
}
