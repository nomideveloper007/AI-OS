export type NavTab = 
  | 'dashboard' 
  | 'websites' 
  | 'agents' 
  | 'ceo'
  | 'tasks' 
  | 'task_engine'
  | 'agent_runtime'
  | 'seo_agent'
  | 'reports' 
  | 'approvals' 
  | 'activity' 
  | 'ai_engine'
  | 'playground'
  | 'website_intelligence'
  | 'memory'
  | 'workflow'
  | 'settings';

export type TaskStatus = 'Running' | 'Pending' | 'Completed' | 'Failed';

export interface SystemStatus {
  status: 'Operational' | 'Degraded' | 'Offline';
  lastChecked: string;
}

export type WebsiteCategory = 
  | 'Business' 
  | 'Blog' 
  | 'E-commerce' 
  | 'Portfolio' 
  | 'SaaS' 
  | 'Earning Website' 
  | 'News' 
  | 'Other';

export type WebsiteFramework = 
  | 'Next.js' 
  | 'React' 
  | 'Laravel' 
  | 'WordPress' 
  | 'Vue' 
  | 'Angular' 
  | 'Node.js' 
  | 'PHP' 
  | 'Unknown';

export type WebsiteStatus = 'Active' | 'Inactive';

export interface WebsiteItem {
  id: string;
  name: string;
  url: string;
  domain: string;
  framework: WebsiteFramework;
  category: WebsiteCategory;
  description?: string;
  notes?: string;
  status: WebsiteStatus;
  favorite: boolean;
  created_at: string;
  updated_at: string;
  
  // Optional metrics compatibility with dashboard widgets
  healthScore?: number;
  lastScan?: string;
  connectedDate?: string;
  pagesCount?: number;
  serverRegion?: string;
  metrics?: {
    performance: number;
    seo: number;
    security: number;
    accessibility: number;
  };
}

export type WebsiteInfo = WebsiteItem;

// ==========================================
// WEBSITE SCANNER ENGINE TYPES & DATABASE SCHEMAS
// ==========================================

export type ScanStatus = 'completed' | 'failed' | 'in_progress';
export type ScanErrorType = 'offline' | 'timeout' | 'ssl_error' | 'dns_error' | 'blocked' | 'http_404' | 'http_500' | null;

export interface DiscoveredPage {
  id: string;
  path: string;
  url: string;
  title: string;
  statusCode: number;
  loadTimeMs: number;
  type: string;
}

export interface ScanMetaData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  twitterCard: string;
  twitterTitle: string;
  robotsMeta: string;
}

export interface ScanHeadings {
  h1: string[];
  h2: string[];
  h3: string[];
  totalCount: number;
}

export interface ScanImageItem {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  missingAlt: boolean;
}

export interface ScanImagesData {
  totalCount: number;
  missingAltCount: number;
  withAltCount: number;
  list: ScanImageItem[];
}

export interface ScanLinkItem {
  url: string;
  text: string;
  statusCode?: number;
  isExternal: boolean;
  isBroken: boolean;
}

export interface ScanLinksData {
  internalCount: number;
  externalCount: number;
  brokenCount: number;
  internalLinks: ScanLinkItem[];
  externalLinks: ScanLinkItem[];
  brokenLinks: ScanLinkItem[];
}

export interface ScanFilesData {
  robotsTxt: {
    found: boolean;
    path: string;
    content?: string;
  };
  sitemapXml: {
    found: boolean;
    path: string;
    urlCount?: number;
  };
  manifestJson: {
    found: boolean;
    path: string;
    name?: string;
  };
  favicon: {
    found: boolean;
    path: string;
  };
}

export interface ScanSecurityData {
  httpsEnabled: boolean;
  tlsVersion: string;
  headers: {
    hsts: boolean;
    xFrameOptions: boolean;
    xContentTypeOptions: boolean;
    csp: boolean;
    referrerPolicy: boolean;
  };
}

export interface ScanPerformanceData {
  htmlSizeBytes: number;
  cssFilesCount: number;
  cssSizeBytes: number;
  jsFilesCount: number;
  jsSizeBytes: number;
  imageCount: number;
  imageSizeBytes: number;
  loadTimeMs: number;
}

export interface ScanTechnicalData {
  title: string;
  homepageUrl: string;
  finalUrl: string;
  domain: string;
  protocol: 'HTTP' | 'HTTPS';
  statusCode: number;
  server: string;
  framework: string;
  language: string;
  charset: string;
  viewport: string;
  generator: string;
  favicon: string;
  logo?: string;
}

export interface WebsiteScanResult {
  id: string;
  website_id: string;
  domain: string;
  status: ScanStatus;
  error_type: ScanErrorType;
  error_message?: string;
  scan_date: string;
  duration_ms: number;
  
  technical: ScanTechnicalData;
  pages: DiscoveredPage[];
  meta: ScanMetaData;
  headings: ScanHeadings;
  images: ScanImagesData;
  links: ScanLinksData;
  files: ScanFilesData;
  security: ScanSecurityData;
  performance: ScanPerformanceData;
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Idle' | 'Paused';
  lastActivity: string;
  description: string;
  tasksCompleted: number;
  avatarColor: string;
  iconName: string;
}

export interface TaskItem {
  id: string;
  title: string;
  agentName: string;
  status: TaskStatus;
  timeAgo: string;
  website: string;
  progress?: number;
  category: 'SEO' | 'Content' | 'Security' | 'Performance' | 'Growth';
}

export interface PendingApproval {
  id: string;
  title: string;
  agentName: string;
  website: string;
  timeAgo: string;
  details: string;
  impact: 'High' | 'Medium' | 'Low';
  diff?: {
    before: string;
    after: string;
  };
}

export interface ActivityLog {
  id: string;
  agentName: string;
  action: string;
  timeAgo: string;
  status: 'success' | 'warning' | 'info';
  category: string;
  details?: string;
}

export interface TrafficDataPoint {
  date: string;
  visitors: number;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  action: string;
  color: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  type: 'approval' | 'task' | 'system' | 'agent';
}
