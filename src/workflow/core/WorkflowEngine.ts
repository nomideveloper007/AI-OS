import { WorkflowManager } from './WorkflowManager';
import { QueueManager } from '../queue/QueueManager';
import { ApprovalManager } from '../approval/ApprovalManager';
import { ActionRegistry } from '../actions/ActionRegistry';
import { WorkflowLogger } from './WorkflowLogger';

export class WorkflowEngine {
  private static instance: WorkflowEngine;

  public readonly manager = WorkflowManager.getInstance();
  public readonly queue = QueueManager.getInstance();
  public readonly approval = ApprovalManager.getInstance();
  public readonly actions = ActionRegistry.getInstance();
  public readonly logger = new WorkflowLogger();

  private constructor() {
    this.logger.log('info', 'wf-core', 'Workflow Engine Mission Control Architecture initialized.');
  }

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }
}
