import { ConditionEvaluator } from './ConditionEvaluator';
import { ConditionType } from './ConditionTypes';

export class ConditionEngine {
  private static instance: ConditionEngine;

  private constructor() {}

  public static getInstance(): ConditionEngine {
    if (!ConditionEngine.instance) {
      ConditionEngine.instance = new ConditionEngine();
    }
    return ConditionEngine.instance;
  }

  public checkCondition(conditionName: ConditionType): boolean {
    return ConditionEvaluator.evaluate(conditionName);
  }
}
