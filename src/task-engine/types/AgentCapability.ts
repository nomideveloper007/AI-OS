/**
 * Task-engine view of agent routing capabilities.
 * Mapped dynamically onto Agent Registry roles — never hardcodes agent IDs.
 */
export type TaskAgentCapability =
  | 'seo'
  | 'content'
  | 'website_audit'
  | 'security'
  | 'performance'
  | 'growth'
  | 'marketing'
  | 'analytics'
  | 'support'
  | 'development'
  | 'business'
  | 'general'
  | 'orchestration';

export interface CapabilityRouteHint {
  capability: TaskAgentCapability;
  preferredRoles: string[];
  keywords: string[];
}
