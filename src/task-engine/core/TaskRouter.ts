import { AgentRegistry } from '../../agents/core/AgentRegistry';
import { AgentManager } from '../../agents/core/AgentManager';
import type { BaseAgent } from '../../agents/core/BaseAgent';
import type { Task } from '../types/Task';
import type { TaskCategory } from '../types/TaskCategory';
import type { TaskAssignment } from '../types/TaskAssignment';
import type { CapabilityRouteHint } from '../types/AgentCapability';
import { TaskLogger } from './TaskLogger';

const ROUTE_HINTS: CapabilityRouteHint[] = [
  {
    capability: 'seo',
    preferredRoles: ['SEO Specialist'],
    keywords: ['meta', 'title', 'seo', 'sitemap', 'robots', 'canonical', 'keyword', 'schema', 'alt'],
  },
  {
    capability: 'content',
    preferredRoles: ['Content Strategist', 'Growth Marketing'],
    keywords: ['write', 'faq', 'blog', 'content', 'copy', 'article', 'page copy'],
  },
  {
    capability: 'website_audit',
    preferredRoles: ['Website Auditor'],
    keywords: ['website', 'scan', 'broken link', 'ssl', 'domain', 'review website', 'audit'],
  },
  {
    capability: 'security',
    preferredRoles: ['Security Sentinel', 'Website Auditor'],
    keywords: ['security', 'https', 'csp', 'hsts', 'vulnerability', 'tls'],
  },
  {
    capability: 'performance',
    preferredRoles: ['Website Auditor'],
    keywords: ['performance', 'speed', 'bundle', 'load time', 'core web vitals', 'latency'],
  },
  {
    capability: 'growth',
    preferredRoles: ['Growth Marketing'],
    keywords: ['growth', 'conversion', 'funnel', 'user growth', 'retention'],
  },
  {
    capability: 'marketing',
    preferredRoles: ['Growth Marketing'],
    keywords: ['marketing', 'campaign', 'social', 'opengraph', 'og '],
  },
  {
    capability: 'analytics',
    preferredRoles: ['Growth Marketing', 'Executive Director'],
    keywords: ['analytics', 'metrics', 'traffic', 'report'],
  },
  {
    capability: 'orchestration',
    preferredRoles: ['Executive Director'],
    keywords: ['strategy', 'delegate', 'executive', 'plan', 'business'],
  },
];

const CATEGORY_ROLES: Record<TaskCategory, string[]> = {
  SEO: ['SEO Specialist'],
  Content: ['Content Strategist', 'Growth Marketing'],
  Website: ['Website Auditor'],
  Security: ['Security Sentinel', 'Website Auditor'],
  Performance: ['Website Auditor'],
  Marketing: ['Growth Marketing'],
  Analytics: ['Growth Marketing', 'Executive Director'],
  Growth: ['Growth Marketing'],
  Support: ['Custom Workforce', 'Executive Director'],
  Development: ['Custom Workforce', 'Website Auditor'],
  Business: ['Executive Director'],
  General: ['Executive Director', 'Custom Workforce'],
};

/**
 * Routes tasks to agents via Agent Registry — never hardcodes agent IDs.
 * Future registered agents become eligible automatically by role/capability match.
 */
export class TaskRouter {
  private registry = AgentRegistry.getInstance();
  private logger = TaskLogger.getInstance();

  constructor() {
    // Ensure seeded agents exist without depending on UI having opened Agents view
    AgentManager.getInstance();
  }

  public route(task: Task): TaskAssignment {
    const agents = this.registry.getAll();
    if (agents.length === 0) {
      throw new Error('No agents registered in Agent Registry.');
    }

    const text = `${task.title} ${task.description}`.toLowerCase();
    const preferredRoles = this.resolvePreferredRoles(task, text);

    let selected = this.pickByRoles(agents, preferredRoles);

    if (!selected) {
      selected = this.pickByKeywords(agents, text);
    }

    if (!selected) {
      selected = agents[0];
    }

    const reason = preferredRoles.length
      ? `Matched preferred roles [${preferredRoles.join(', ')}] for category ${task.category}`
      : `Fallback assignment to ${selected.name} (${selected.role})`;

    this.logger.info(
      `Routed task "${task.title}" → ${selected.name}`,
      'TaskRouter',
      task.id,
      { agentId: selected.id, role: selected.role, reason }
    );

    return {
      taskId: task.id,
      agentId: selected.id,
      agentName: selected.name,
      agentRole: selected.role,
      reason,
      assignedAt: new Date().toISOString(),
      category: task.category,
      priority: task.priority,
    };
  }

  public listRoutableAgents(): Array<{ id: string; name: string; role: string; capabilities: string[] }> {
    AgentManager.getInstance();
    return this.registry.getAll().map((a) => ({
      id: a.id,
      name: a.name,
      role: a.role,
      capabilities: [...a.capabilities],
    }));
  }

  private resolvePreferredRoles(task: Task, text: string): string[] {
    const fromCategory = CATEGORY_ROLES[task.category] || [];
    const fromKeywords: string[] = [];

    for (const hint of ROUTE_HINTS) {
      if (hint.keywords.some((kw) => text.includes(kw))) {
        fromKeywords.push(...hint.preferredRoles);
      }
    }

    return Array.from(new Set([...fromKeywords, ...fromCategory]));
  }

  private pickByRoles(agents: BaseAgent[], roles: string[]): BaseAgent | undefined {
    for (const role of roles) {
      const match = agents.find((a) => a.role === role);
      if (match) return match;
    }
    return undefined;
  }

  private pickByKeywords(agents: BaseAgent[], text: string): BaseAgent | undefined {
    let best: BaseAgent | undefined;
    let bestScore = -1;

    for (const agent of agents) {
      let score = 0;
      for (const hint of ROUTE_HINTS) {
        if (!hint.preferredRoles.includes(agent.role)) continue;
        for (const kw of hint.keywords) {
          if (text.includes(kw)) score += 2;
        }
      }
      // Capability soft boosts
      if (agent.capabilities.includes('Write Content') && /write|content|faq|blog/.test(text)) score += 3;
      if (agent.capabilities.includes('Website Scan') && /scan|website|ssl|broken/.test(text)) score += 3;
      if (agent.capabilities.includes('Analyze Data') && /analy|growth|metric/.test(text)) score += 2;

      if (score > bestScore) {
        bestScore = score;
        best = agent;
      }
    }

    return bestScore > 0 ? best : undefined;
  }
}
