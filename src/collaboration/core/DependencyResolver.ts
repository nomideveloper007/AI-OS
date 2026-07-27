import type { BaseAgent } from '../../agents/core/BaseAgent';
import type { CollaborationTask } from '../types/CollaborationTask';
import { CollaborationLogger } from './CollaborationLogger';

/**
 * Selects and orders agents from Agent Registry — never hardcodes agent IDs.
 * Future registered agents participate automatically via role/capability match.
 */
export class DependencyResolver {
  private logger = CollaborationLogger.getInstance();

  /** Role priority for organic-traffic style objectives (lower = earlier). */
  private roleOrder(role: string): number {
    const r = role.toLowerCase();
    if (r.includes('executive') || r.includes('director')) return 10;
    if (r.includes('seo')) return 20;
    if (r.includes('website') || r.includes('auditor')) return 30;
    if (r.includes('content')) return 40;
    if (r.includes('growth') || r.includes('marketing')) return 50;
    if (r.includes('security')) return 60;
    return 100;
  }

  public selectAgents(all: BaseAgent[], task: CollaborationTask): BaseAgent[] {
    if (all.length === 0) return [];

    const preferred = (task.preferredRoles || []).map((r) => r.toLowerCase());
    const requiredCaps = (task.requiredCapabilities || []).map((c) => c.toLowerCase());
    const objective = `${task.title} ${task.objective}`.toLowerCase();

    const scored = all.map((agent) => {
      let score = 1;
      const role = String(agent.role).toLowerCase();
      const caps = agent.capabilities.map((c) => String(c).toLowerCase());

      if (preferred.some((p) => role.includes(p) || p.includes(role))) score += 50;
      for (const need of requiredCaps) {
        if (caps.some((c) => c.includes(need) || need.includes(c))) score += 20;
      }

      // Keyword affinity from objective — not hardcoded IDs
      if (/seo|organic|traffic|search|meta|sitemap|alt/.test(objective) && role.includes('seo')) {
        score += 30;
      }
      if (/content|blog|faq|article|copy/.test(objective) && (role.includes('content') || caps.includes('write content'))) {
        score += 25;
      }
      if (/growth|promotion|funnel|conversion|marketing/.test(objective) && (role.includes('growth') || role.includes('marketing'))) {
        score += 25;
      }
      if (/security|risk|https|ssl/.test(objective) && role.includes('security')) {
        score += 25;
      }
      if (/website|performance|vitals|broken/.test(objective) && (role.includes('website') || role.includes('auditor'))) {
        score += 20;
      }
      if (role.includes('executive')) score += 8;

      return { agent, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // Include all agents with meaningful affinity; always keep at least 2 if available
    let selected = scored.filter((s) => s.score >= 20).map((s) => s.agent);
    if (selected.length < 2) {
      selected = scored.slice(0, Math.min(4, scored.length)).map((s) => s.agent);
    }

    // Cap session size for clarity
    selected = selected.slice(0, 8);

    this.logger.info(
      `Selected ${selected.length}/${all.length} agents for collaboration`,
      undefined,
      { agents: selected.map((a) => a.name) }
    );

    return selected;
  }

  public orderAgents(agents: BaseAgent[]): BaseAgent[] {
    return [...agents].sort((a, b) => {
      const d = this.roleOrder(String(a.role)) - this.roleOrder(String(b.role));
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
  }

  public resolveOrder(all: BaseAgent[], task: CollaborationTask): BaseAgent[] {
    return this.orderAgents(this.selectAgents(all, task));
  }
}
