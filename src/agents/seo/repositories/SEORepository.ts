import type { SEOReport } from '../types/SEOReport';
import type { SEOGeneratedTask } from '../types/SEOReport';

const REPORT_KEY = 'aios.seo.reports';
const TASK_KEY = 'aios.seo.generated_tasks';

export class SEORepository {
  private static instance: SEORepository;
  private reports: Map<string, SEOReport> = new Map();
  private generatedTasks: SEOGeneratedTask[] = [];

  private constructor() {
    this.load();
  }

  public static getInstance(): SEORepository {
    if (!SEORepository.instance) SEORepository.instance = new SEORepository();
    return SEORepository.instance;
  }

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(REPORT_KEY);
      if (raw) {
        const list = JSON.parse(raw) as SEOReport[];
        if (Array.isArray(list)) for (const r of list) this.reports.set(r.id, r);
      }
      const taskRaw = window.localStorage.getItem(TASK_KEY);
      if (taskRaw) {
        const list = JSON.parse(taskRaw) as SEOGeneratedTask[];
        if (Array.isArray(list)) this.generatedTasks = list.slice(0, 300);
      }
    } catch {
      // ignore
    }
  }

  private persistReports(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(REPORT_KEY, JSON.stringify(this.listReports().slice(0, 100)));
    } catch {
      // ignore
    }
  }

  private persistTasks(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(TASK_KEY, JSON.stringify(this.generatedTasks.slice(0, 300)));
    } catch {
      // ignore
    }
  }

  public saveReport(report: SEOReport): SEOReport {
    this.reports.set(report.id, report);
    this.persistReports();
    return report;
  }

  public getReport(id: string): SEOReport | undefined {
    return this.reports.get(id);
  }

  public listReports(domain?: string): SEOReport[] {
    const all = Array.from(this.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return domain ? all.filter((r) => r.domain.toLowerCase() === domain.toLowerCase()) : all;
  }

  public getLatestReport(domain?: string): SEOReport | undefined {
    return this.listReports(domain)[0];
  }

  public saveGeneratedTasks(tasks: SEOGeneratedTask[]): void {
    this.generatedTasks = [...tasks, ...this.generatedTasks].slice(0, 300);
    this.persistTasks();
  }

  public listGeneratedTasks(): SEOGeneratedTask[] {
    return [...this.generatedTasks];
  }

  public clear(): void {
    this.reports.clear();
    this.generatedTasks = [];
    this.persistReports();
    this.persistTasks();
  }
}
