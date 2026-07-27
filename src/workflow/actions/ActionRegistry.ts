import { WorkflowAction, ActionType } from './ActionTypes';

export class ActionRegistry {
  private static instance: ActionRegistry;
  private actions: Map<string, WorkflowAction> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  public static getInstance(): ActionRegistry {
    if (!ActionRegistry.instance) {
      ActionRegistry.instance = new ActionRegistry();
    }
    return ActionRegistry.instance;
  }

  private registerDefaults(): void {
    const list: ActionType[] = [
      'Read Memory', 'Read Scan', 'Call AI Engine', 'Generate Report',
      'Create Task', 'Notify Admin', 'Wait Approval', 'Save Memory',
      'Run Agent', 'Complete Workflow'
    ];

    list.forEach((name, i) => {
      this.actions.set(name, {
        id: `act-${i + 1}`,
        name,
        description: `Architecture action template for ${name}.`
      });
    });
  }

  public getAction(name: string): WorkflowAction | undefined {
    return this.actions.get(name);
  }

  public getAllActions(): WorkflowAction[] {
    return Array.from(this.actions.values());
  }
}
