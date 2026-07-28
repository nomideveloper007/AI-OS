import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  NavTab, 
  WebsiteItem, 
  Agent, 
  TaskItem, 
  PendingApproval, 
  ActivityLog, 
  NotificationItem,
  WebsiteCategory,
  WebsiteFramework,
  WebsiteStatus,
  WebsiteScanResult
} from '../types';
import { 
  initialWebsites, 
  initialAgents, 
  initialTasks, 
  initialApprovals, 
  initialActivityLogs, 
  initialNotifications 
} from '../data/mockData';
import { initialScans, SCAN_STEPS } from '../data/scannerEngine';
import { WebsiteScanner } from '../scanner';
import { AgentManager } from '../agents/core/AgentManager';
import { AgentEvents } from '../agents/core/AgentEvents';
import { TaskEngine } from '../task-engine/core/TaskEngine';
import { TaskEvents } from '../task-engine/core/TaskEvents';
import { GitHubManager } from '../github/core/GitHubManager';
import { ApprovalManager } from '../workflow/approval/ApprovalManager';
import { TaskRepository } from '../task-engine/repositories/TaskRepository';


interface AddWebsitePayload {
  name: string;
  url: string;
  category: WebsiteCategory;
  framework: WebsiteFramework;
  status: WebsiteStatus;
  favorite: boolean;
  description?: string;
  notes?: string;
}

interface AppContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  
  // Websites Module State & Actions
  websites: WebsiteItem[];
  website: WebsiteItem; // active single website for dashboard widgets
  selectedWebsiteId: string | null;
  selectWebsiteForDetails: (id: string | null) => void;
  
  isAddWebsiteOpen: boolean;
  setIsAddWebsiteOpen: (open: boolean) => void;
  editingWebsite: WebsiteItem | null;
  setEditingWebsite: (web: WebsiteItem | null) => void;
  deletingWebsite: WebsiteItem | null;
  setDeletingWebsite: (web: WebsiteItem | null) => void;
  
  addWebsiteItem: (payload: AddWebsitePayload) => Promise<{ success: boolean; error?: string }>;
  updateWebsiteItem: (id: string, payload: Partial<WebsiteItem>) => Promise<{ success: boolean; error?: string }>;
  deleteWebsiteItem: (id: string) => void;
  duplicateWebsiteItem: (id: string) => void;
  toggleFavoriteWebsite: (id: string) => void;
  addWebsite: (domain: string, name: string) => void;

  // Scanner Engine State & Actions
  scans: WebsiteScanResult[];
  activeScanningWebsite: WebsiteItem | null;
  scanningStepIndex: number;
  activeReportScan: WebsiteScanResult | null;
  setActiveReportScan: (scan: WebsiteScanResult | null) => void;
  startWebsiteScan: (websiteId: string, errorTypeToSimulate?: string) => void;
  cancelScan: () => void;
  deleteScan: (scanId: string) => void;
  getScansForWebsite: (websiteId: string) => WebsiteScanResult[];

  agents: Agent[];
  tasks: TaskItem[];
  approvals: PendingApproval[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  
  // Modals state
  isAddAgentOpen: boolean;
  setIsAddAgentOpen: (open: boolean) => void;
  isCreateTaskOpen: boolean;
  setIsCreateTaskOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  
  // Actions
  approveItem: (id: string) => void;
  rejectItem: (id: string) => void;
  addAgent: (agent: Partial<Agent>) => void;
  addTask: (task: Partial<TaskItem>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to extract clean domain from URL
export const extractDomain = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim().toLowerCase();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
};

// Helper to format clean URL
export const formatCleanUrl = (rawUrl: string): string => {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('github');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [websites, setWebsites] = useState<WebsiteItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('aios.websites');
      if (stored) {
        try {
          const list = JSON.parse(stored);
          if (Array.isArray(list)) return list;
        } catch {
          // ignore
        }
      }
    }
    return [];
  });
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [editingWebsite, setEditingWebsite] = useState<WebsiteItem | null>(null);
  const [deletingWebsite, setDeletingWebsite] = useState<WebsiteItem | null>(null);

  // Scanner Engine States
  const [scans, setScans] = useState<WebsiteScanResult[]>(() => {
    const stored = WebsiteScanner.getInstance().getRepository().listProcessed();
    return stored.length > 0 ? stored : [];
  });
  const [activeScanningWebsite, setActiveScanningWebsite] = useState<WebsiteItem | null>(null);
  const [scanningStepIndex, setScanningStepIndex] = useState<number>(0);
  const [activeReportScan, setActiveReportScan] = useState<WebsiteScanResult | null>(null);

  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active website for dashboard views
  const website = websites[0] || {
    id: '',
    name: 'No connected website',
    url: '',
    domain: 'Connect a website to begin',
    framework: 'Unknown',
    category: 'Other',
    status: 'Inactive',
    favorite: false,
    created_at: '',
    updated_at: '',
    healthScore: 0,
    lastScan: 'Never',
    metrics: {
      performance: 0,
      seo: 0,
      security: 0,
      accessibility: 0
    }
  };

  // Always keep in light/white mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  // Keyboard shortcut ⌘K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save websites list to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('aios.websites', JSON.stringify(websites));
    }
  }, [websites]);

  const refreshFromEngines = () => {
    // 1. Fetch real agents
    const realAgents = AgentManager.getInstance().listAgents().map((a) => {
      const statusMap: Record<string, Agent['status']> = {
        Idle: 'Idle',
        Running: 'Active',
        Paused: 'Paused',
        Stopped: 'Paused',
      };
      const avatarColors: Record<string, string> = {
        'CEO Agent': 'bg-indigo-600',
        'Project Manager Agent': 'bg-violet-600',
        'SEO Agent': 'bg-blue-600',
        'Website Agent': 'bg-emerald-600',
        'Growth Agent': 'bg-amber-600',
      };
      return {
        id: a.id,
        name: a.name,
        type: a.role,
        status: statusMap[a.status] || 'Idle',
        lastActivity: a.getLogs()[0]?.timestamp || 'Just now',
        description: a.description,
        tasksCompleted: a.getMetrics().successCount,
        avatarColor: avatarColors[a.name] || 'bg-slate-600',
        iconName: 'Bot',
      };
    });
    setAgents(realAgents);

    // 2. Fetch real tasks
    const realTasksList = TaskEngine.getInstance().listTasks();
    const mappedTasks = realTasksList.map((t) => {
      const statusMap: Record<string, TaskItem['status']> = {
        running: 'Running',
        assigned: 'Running',
        waiting_assignment: 'Pending',
        waiting_approval: 'Pending',
        paused: 'Pending',
        idle: 'Pending',
        completed: 'Completed',
        failed: 'Failed',
        cancelled: 'Failed',
      };
      const timeElapsed = Date.now() - new Date(t.updatedAt).getTime();
      const minutes = Math.floor(timeElapsed / 60000);
      let timeAgo = 'Just now';
      if (minutes >= 1 && minutes < 60) timeAgo = `${minutes} min ago`;
      else if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        if (hours < 24) timeAgo = `${hours} hrs ago`;
        else timeAgo = new Date(t.updatedAt).toLocaleDateString();
      }
      return {
        id: t.id,
        title: t.title,
        agentName: t.assignedAgentName || 'Unassigned',
        status: statusMap[t.status] || 'Pending',
        timeAgo,
        website: t.websiteDomain || '',
        progress: t.status === 'completed' ? 100 : (t.status === 'running' ? 45 : 10),
        category: (t.category || 'SEO') as TaskItem['category'],
      };
    });
    setTasks(mappedTasks);

    // 3. Fetch real approvals from both TaskEngine AND ApprovalManager
    const taskApprovals = realTasksList
      .filter((t) => t.status === 'waiting_approval')
      .map((t) => {
        return {
          id: t.id,
          title: t.title,
          agentName: t.assignedAgentName || 'Unassigned',
          website: t.websiteDomain || '',
          timeAgo: 'Just now',
          details: t.description || 'Action requires administrator approval.',
          impact: (t.priority === 'critical' || t.priority === 'high' ? 'High' : 'Medium') as 'High' | 'Medium' | 'Low',
        };
      });

    const workflowApprovals = ApprovalManager.getInstance()
       .getPendingRequests()
       .map((r) => {
         return {
           id: r.id,
           title: r.stepName,
           agentName: r.requester,
           website: r.website || 'tasktomoney.com',
           timeAgo: 'Just now',
           details: r.reason,
           impact: 'High' as const,
         };
       });

    setApprovals([...taskApprovals, ...workflowApprovals]);

    // 4. Fetch real activity logs from all agent logs + task logs
    const realLogs: ActivityLog[] = [];
    AgentManager.getInstance().listAgents().forEach((agent) => {
      agent.getLogs().forEach((log) => {
        const statusMap: Record<string, ActivityLog['status']> = {
          info: 'info',
          warn: 'warning',
          error: 'warning',
          debug: 'info',
        };
        realLogs.push({
          id: log.id,
          agentName: agent.name,
          action: log.message,
          timeAgo: log.timestamp,
          status: statusMap[log.level] || 'info',
          category: 'Agent Activity',
        });
      });
    });
    realTasksList.forEach((task) => {
      task.logs.forEach((log) => {
        realLogs.push({
          id: log.id,
          agentName: log.agentName || task.assignedAgentName || 'Task Engine',
          action: log.message,
          timeAgo: new Date(log.timestamp).toLocaleTimeString(),
          status: log.level === 'error' ? 'warning' : 'info',
          category: 'Task Activity',
        });
      });
    });

    realLogs.sort((a, b) => b.id.localeCompare(a.id));
    setActivityLogs(realLogs.slice(0, 100));
  };

  // Synchronize state with background engines
  useEffect(() => {
    refreshFromEngines();

    const unsubAgents = AgentEvents.subscribe(() => {
      refreshFromEngines();
    });
    
    const unsubTasks = TaskEvents.getInstance().subscribe(() => {
      refreshFromEngines();
    });

    return () => {
      unsubAgents();
      unsubTasks();
    };
  }, []);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(false);
  };

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const selectWebsiteForDetails = (id: string | null) => {
    setSelectedWebsiteId(id);
  };

  // Helper to normalize and check if website name/domain is present in connected GitHub repository names
  const checkIfSourceCodeExists = (websiteName: string, websiteUrl: string, repos: any[]): boolean => {
    const normalize = (str: string) => {
      return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
    };

    const getLevenshteinDistance = (a: string, b: string): number => {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) matrix[i] = [i];
      for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
            );
          }
        }
      }
      return matrix[b.length][a.length];
    };

    const normalizedWebName = normalize(websiteName);
    const domain = extractDomain(websiteUrl);
    const normalizedDomain = normalize(domain.split('.')[0] || domain);

    return repos.some((repo) => {
      const normalizedRepoName = normalize(repo.name);

      // Match conditions:
      // 1. Repo name matches website name or domain (exact or substring)
      // 2. Fuzzy match (edit distance <= 2) to handle slight spelling/naming discrepancies (e.g. PromptVault vs promptsvault)
      return (
        normalizedRepoName === normalizedWebName ||
        normalizedRepoName.includes(normalizedWebName) ||
        normalizedWebName.includes(normalizedRepoName) ||
        normalizedRepoName === normalizedDomain ||
        normalizedRepoName.includes(normalizedDomain) ||
        normalizedDomain.includes(normalizedRepoName) ||
        getLevenshteinDistance(normalizedRepoName, normalizedWebName) <= 2 ||
        getLevenshteinDistance(normalizedRepoName, normalizedDomain) <= 2
      );
    });
  };

  // Add website action with duplicate domain validation and GitHub source code verification
  const addWebsiteItem = async (payload: AddWebsitePayload): Promise<{ success: boolean; error?: string }> => {
    const name = payload.name.trim();
    const formattedUrl = formatCleanUrl(payload.url);
    const domain = extractDomain(payload.url);

    if (!name) {
      return { success: false, error: 'Website Name is required.' };
    }
    if (!payload.url.trim()) {
      return { success: false, error: 'Website URL is required.' };
    }
    if (!domain || domain.length < 3 || !domain.includes('.')) {
      return { success: false, error: 'Please enter a valid website URL or domain (e.g. example.com).' };
    }

    // 1. Check if a GitHub account is connected first
    const gitUsername = localStorage.getItem('ai_os_github_username');
    if (!gitUsername) {
      return { 
        success: false, 
        error: 'Please connect your GitHub account first in the "Git Repositories" tab.' 
      };
    }

    // 2. Fetch repos to verify source code
    let repos: any[] = [];
    try {
      repos = await GitHubManager.getInstance().getRepositories();
    } catch (err) {
      return { 
        success: false, 
        error: 'Failed to fetch repositories. Please make sure your GitHub token is valid.' 
      };
    }

    if (!repos || repos.length === 0) {
      return { 
        success: false, 
        error: 'No repositories found in your GitHub account. Connect or create a repo first.' 
      };
    }

    // 3. Verify if website's source code exists in connected repos
    const hasSourceCode = checkIfSourceCodeExists(name, formattedUrl, repos);
    if (!hasSourceCode) {
      return { 
        success: false, 
        error: `Could not verify source code. No connected repository name matches website name "${name}" or domain "${domain}".` 
      };
    }

    // Check for duplicate URL / domain
    const isDuplicate = websites.some(
      (w) => w.domain.toLowerCase() === domain.toLowerCase() || w.url.toLowerCase() === formattedUrl.toLowerCase()
    );
    if (isDuplicate) {
      return { success: false, error: `A website with domain "${domain}" is already connected.` };
    }

    const now = new Date().toISOString();
    const newWeb: WebsiteItem = {
      id: `web-${Date.now()}`,
      name,
      url: formattedUrl,
      domain,
      framework: payload.framework,
      category: payload.category,
      description: payload.description?.trim() || '',
      notes: payload.notes?.trim() || '',
      status: payload.status,
      favorite: payload.favorite,
      created_at: now,
      updated_at: now,
      healthScore: 85,
      lastScan: 'Just now',
      connectedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      pagesCount: 1,
      serverRegion: 'Global Edge',
      metrics: {
        performance: 88,
        seo: 82,
        security: 90,
        accessibility: 80
      }
    };

    setWebsites((prev) => [newWeb, ...prev]);
    showToast(`Website "${newWeb.name}" added successfully`);
    return { success: true };
  };

  // Update website action with duplicate check and GitHub source code verification
  const updateWebsiteItem = async (id: string, payload: Partial<WebsiteItem>): Promise<{ success: boolean; error?: string }> => {
    const existing = websites.find((w) => w.id === id);
    if (!existing) {
      return { success: false, error: 'Website not found.' };
    }

    if (payload.name !== undefined && !payload.name.trim()) {
      return { success: false, error: 'Website Name cannot be empty.' };
    }

    let formattedUrl = existing.url;
    let domain = existing.domain;
    let hasNameOrUrlChanged = false;

    if (payload.url !== undefined) {
      if (!payload.url.trim()) {
        return { success: false, error: 'Website URL cannot be empty.' };
      }
      formattedUrl = formatCleanUrl(payload.url);
      domain = extractDomain(payload.url);

      if (!domain || domain.length < 3 || !domain.includes('.')) {
        return { success: false, error: 'Please enter a valid website URL or domain.' };
      }

      if (formattedUrl !== existing.url || domain !== existing.domain) {
        hasNameOrUrlChanged = true;
      }

      // Check duplicate excluding self
      const isDuplicate = websites.some(
        (w) => w.id !== id && (w.domain.toLowerCase() === domain.toLowerCase() || w.url.toLowerCase() === formattedUrl.toLowerCase())
      );
      if (isDuplicate) {
        return { success: false, error: `Another website with domain "${domain}" already exists.` };
      }
    }

    if (payload.name !== undefined && payload.name.trim() !== existing.name) {
      hasNameOrUrlChanged = true;
    }

    // Run verification if name or URL changed
    if (hasNameOrUrlChanged) {
      const gitUsername = localStorage.getItem('ai_os_github_username');
      if (!gitUsername) {
        return { 
          success: false, 
          error: 'Please connect your GitHub account first in the "Git Repositories" tab.' 
        };
      }

      let repos: any[] = [];
      try {
        repos = await GitHubManager.getInstance().getRepositories();
      } catch (err) {
        return { 
          success: false, 
          error: 'Failed to fetch repositories. Please make sure your GitHub token is valid.' 
        };
      }

      const checkName = payload.name !== undefined ? payload.name.trim() : existing.name;
      const hasSourceCode = checkIfSourceCodeExists(checkName, formattedUrl, repos);
      if (!hasSourceCode) {
        return { 
          success: false, 
          error: `Could not verify source code. No connected repository name matches website name "${checkName}" or domain "${domain}".` 
        };
      }
    }

    const updatedWebsites = websites.map((w) => {
      if (w.id === id) {
        return {
          ...w,
          ...payload,
          url: formattedUrl,
          domain,
          updated_at: new Date().toISOString()
        };
      }
      return w;
    });

    setWebsites(updatedWebsites);
    showToast(`Website "${payload.name || existing.name}" updated`);
    return { success: true };
  };

  // Delete website action
  const deleteWebsiteItem = (id: string) => {
    const item = websites.find((w) => w.id === id);
    if (!item) return;

    setWebsites((prev) => prev.filter((w) => w.id !== id));
    if (selectedWebsiteId === id) {
      setSelectedWebsiteId(null);
    }
    setDeletingWebsite(null);
    showToast(`Deleted website "${item.name}"`);
  };

  // Duplicate website action
  const duplicateWebsiteItem = (id: string) => {
    const original = websites.find((w) => w.id === id);
    if (!original) return;

    const now = new Date().toISOString();
    let newDomain = `copy-${original.domain}`;
    let newUrl = original.url.replace(original.domain, newDomain);

    const cloned: WebsiteItem = {
      ...original,
      id: `web-${Date.now()}`,
      name: `${original.name} (Copy)`,
      url: newUrl,
      domain: newDomain,
      created_at: now,
      updated_at: now,
      favorite: false
    };

    setWebsites((prev) => [cloned, ...prev]);
    showToast(`Duplicated "${original.name}"`);
  };

  // Scanner Engine Methods
  const getScansForWebsite = (websiteId: string): WebsiteScanResult[] => {
    return scans.filter((s) => s.website_id === websiteId).sort(
      (a, b) => new Date(b.scan_date).getTime() - new Date(a.scan_date).getTime()
    );
  };

  const deleteScan = (scanId: string) => {
    setScans((prev) => prev.filter((s) => s.id !== scanId));
    if (activeReportScan?.id === scanId) {
      setActiveReportScan(null);
    }
    showToast('Scan record deleted');
  };

  const cancelScan = () => {
    setActiveScanningWebsite(null);
    setScanningStepIndex(0);
  };

  const startWebsiteScan = (websiteId: string, _errorTypeToSimulate?: string) => {
    const targetWeb = websites.find((w) => w.id === websiteId);
    if (!targetWeb) return;

    setActiveScanningWebsite(targetWeb);
    setScanningStepIndex(0);

    const scanner = WebsiteScanner.getInstance();

    void (async () => {
      try {
        const scanResult = await scanner.scan(targetWeb, (stepIndex) => {
          setScanningStepIndex(Math.min(stepIndex, SCAN_STEPS.length - 1));
        });

        setScans((prev) => [scanResult, ...prev.filter((s) => s.id !== scanResult.id)]);

        const healthScore =
          scanResult.status === 'completed'
            ? Math.max(
                20,
                Math.min(
                  100,
                  100 -
                    scanResult.links.brokenCount * 5 -
                    scanResult.images.missingAltCount * 2 -
                    (scanResult.files.robotsTxt.found ? 0 : 8) -
                    (scanResult.files.sitemapXml.found ? 0 : 8)
                )
              )
            : 25;

        setWebsites((prev) =>
          prev.map((w) =>
            w.id === websiteId
              ? {
                  ...w,
                  lastScan: 'Just now',
                  updated_at: new Date().toISOString(),
                  healthScore,
                  metrics: scanResult.status === 'completed'
                    ? {
                        performance: Math.max(
                          10,
                          100 - Math.min(80, Math.round(scanResult.performance.loadTimeMs / 40))
                        ),
                        seo: Math.max(
                          10,
                          100 -
                            (scanResult.meta.title ? 0 : 20) -
                            (scanResult.meta.description ? 0 : 15) -
                            (scanResult.files.sitemapXml.found ? 0 : 15)
                        ),
                        security: scanResult.security.httpsEnabled
                          ? 70 +
                            (scanResult.security.headers.hsts ? 8 : 0) +
                            (scanResult.security.headers.csp ? 8 : 0)
                          : 30,
                        accessibility: Math.max(
                          10,
                          100 - scanResult.images.missingAltCount * 4
                        ),
                      }
                    : w.metrics,
                }
              : w
          )
        );

        if (scanResult.status === 'completed') {
          showToast(`Real scan completed for ${targetWeb.domain}`);
        } else {
          showToast(`Scan failed for ${targetWeb.domain}: ${scanResult.error_message || 'error'}`);
        }
      } catch (err) {
        showToast(
          `Scan error: ${err instanceof Error ? err.message : 'Unknown scanner failure'}`
        );
      } finally {
        setActiveScanningWebsite(null);
        setScanningStepIndex(0);
      }
    })();
  };

  // Toggle favorite website
  const toggleFavoriteWebsite = (id: string) => {
    setWebsites((prev) =>
      prev.map((w) => {
        if (w.id === id) {
          const nextFav = !w.favorite;
          showToast(nextFav ? `Marked "${w.name}" as favorite` : `Removed "${w.name}" from favorites`);
          return { ...w, favorite: nextFav, updated_at: new Date().toISOString() };
        }
        return w;
      })
    );
  };

  // Legacy quick add website compatibility
  const addWebsite = (domain: string, name: string) => {
    addWebsiteItem({
      name: name || domain,
      url: `https://${domain}`,
      category: 'SaaS',
      framework: 'React',
      status: 'Active',
      favorite: false
    });
  };

  const approveItem = (id: string) => {
    try {
      if (id.startsWith('appr-')) {
        ApprovalManager.getInstance().approve(id, 'Administrator', 'Approved from Approvals Queue.');
        showToast(`Approved request successfully`);

        // If this is a Pull Request merge approval, log the merge to TaskEngine
        if (id.startsWith('appr-pr-')) {
          const taskId = id.replace('appr-pr-', '');
          const task = TaskRepository.getInstance().get(taskId);
          if (task) {
            task.logs.unshift({
              id: `tl-merge-${Date.now()}`,
              level: 'info',
              message: `PR Approved by Administrator. Merged branch feature/task-${taskId.slice(-5)} into main. Live changes deployed to production.`,
              timestamp: new Date().toISOString(),
              agentId: 'agent-pm-orchestrator',
              agentName: 'Project Manager Agent',
            });
            TaskRepository.getInstance().save(task);
          }
        }
      } else {
        TaskEngine.getInstance().approve(id);
        showToast(`Approved task successfully`);
      }
      refreshFromEngines();
    } catch (err) {
      showToast(`Failed to approve: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const rejectItem = (id: string) => {
    try {
      if (id.startsWith('appr-')) {
        ApprovalManager.getInstance().reject(id, 'Administrator', 'Rejected from Approvals Queue.');
        showToast(`Rejected request`);
      } else {
        TaskEngine.getInstance().cancel(id);
        showToast(`Rejected task`);
      }
      refreshFromEngines();
    } catch (err) {
      showToast(`Failed to reject: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const addAgent = (newAgentData: Partial<Agent>) => {
    try {
      AgentManager.getInstance().createAgent({
        name: newAgentData.name || 'Custom Agent',
        description: newAgentData.description || 'Custom configured agent.',
        role: (newAgentData.type || 'Custom Workforce') as any,
        priority: 'Medium',
        capabilities: ['Analyze Data', 'Read Reports'],
      });
      showToast(`Agent "${newAgentData.name}" created successfully`);
      refreshFromEngines();
    } catch (err) {
      showToast(`Failed to create agent: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const addTask = (taskData: Partial<TaskItem>) => {
    try {
      TaskEngine.getInstance().createTask({
        title: taskData.title || 'New Task',
        category: (taskData.category || 'SEO') as any,
        websiteDomain: website.domain,
        websiteId: website.id,
        requestedBy: 'CEO Agent',
        approvalRequired: false,
      });
      showToast(`Task "${taskData.title}" queued successfully`);
      refreshFromEngines();
    } catch (err) {
      showToast(`Failed to create task: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleDarkMode,
        isSidebarCollapsed,
        toggleSidebar,
        websites,
        website,
        selectedWebsiteId,
        selectWebsiteForDetails,
        isAddWebsiteOpen,
        setIsAddWebsiteOpen,
        editingWebsite,
        setEditingWebsite,
        deletingWebsite,
        setDeletingWebsite,
        addWebsiteItem,
        updateWebsiteItem,
        deleteWebsiteItem,
        duplicateWebsiteItem,
        toggleFavoriteWebsite,
        addWebsite,
        scans,
        activeScanningWebsite,
        scanningStepIndex,
        activeReportScan,
        setActiveReportScan,
        startWebsiteScan,
        cancelScan,
        deleteScan,
        getScansForWebsite,
        agents,
        tasks,
        approvals,
        activityLogs,
        notifications,
        isAddAgentOpen,
        setIsAddAgentOpen,
        isCreateTaskOpen,
        setIsCreateTaskOpen,
        isSearchOpen,
        setIsSearchOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,
        approveItem,
        rejectItem,
        addAgent,
        addTask,
        markNotificationRead,
        markAllNotificationsRead,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

