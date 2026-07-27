import type { StrategicPlan } from './planTypes';

const STORAGE_KEY = 'aios.ceo.strategic_plans';

export class PlanningHistory {
  private static instance: PlanningHistory;
  private plans: StrategicPlan[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): PlanningHistory {
    if (!PlanningHistory.instance) PlanningHistory.instance = new PlanningHistory();
    return PlanningHistory.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const list = JSON.parse(raw) as StrategicPlan[];
      if (Array.isArray(list)) this.plans = list.slice(0, 50);
    } catch {
      // ignore
    }
  }

  private persist(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.plans.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  public record(plan: StrategicPlan): StrategicPlan {
    this.plans.unshift(plan);
    if (this.plans.length > 50) this.plans.pop();
    this.persist();
    return plan;
  }

  public list(domain?: string): StrategicPlan[] {
    if (!domain) return [...this.plans];
    return this.plans.filter((p) => p.domain.toLowerCase() === domain.toLowerCase());
  }

  public latest(domain?: string): StrategicPlan | undefined {
    return this.list(domain)[0];
  }

  public clear(): void {
    this.plans = [];
    this.persist();
  }
}
