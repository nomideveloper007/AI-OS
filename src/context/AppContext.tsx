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
  
  addWebsiteItem: (payload: AddWebsitePayload) => { success: boolean; error?: string };
  updateWebsiteItem: (id: string, payload: Partial<WebsiteItem>) => { success: boolean; error?: string };
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
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const [websites, setWebsites] = useState<WebsiteItem[]>(initialWebsites);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(null);
  const [editingWebsite, setEditingWebsite] = useState<WebsiteItem | null>(null);
  const [deletingWebsite, setDeletingWebsite] = useState<WebsiteItem | null>(null);

  // Scanner Engine States
  const [scans, setScans] = useState<WebsiteScanResult[]>(() => {
    const stored = WebsiteScanner.getInstance().getRepository().listProcessed();
    return stored.length > 0 ? stored : initialScans;
  });
  const [activeScanningWebsite, setActiveScanningWebsite] = useState<WebsiteItem | null>(null);
  const [scanningStepIndex, setScanningStepIndex] = useState<number>(0);
  const [activeReportScan, setActiveReportScan] = useState<WebsiteScanResult | null>(null);

  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [approvals, setApprovals] = useState<PendingApproval[]>(initialApprovals);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const [isAddWebsiteOpen, setIsAddWebsiteOpen] = useState(false);
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active website for dashboard views
  const website = websites[0] || initialWebsites[0];

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

  // Add website action with duplicate domain validation
  const addWebsiteItem = (payload: AddWebsitePayload): { success: boolean; error?: string } => {
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

  // Update website action with duplicate check
  const updateWebsiteItem = (id: string, payload: Partial<WebsiteItem>): { success: boolean; error?: string } => {
    const existing = websites.find((w) => w.id === id);
    if (!existing) {
      return { success: false, error: 'Website not found.' };
    }

    if (payload.name !== undefined && !payload.name.trim()) {
      return { success: false, error: 'Website Name cannot be empty.' };
    }

    let formattedUrl = existing.url;
    let domain = existing.domain;

    if (payload.url !== undefined) {
      if (!payload.url.trim()) {
        return { success: false, error: 'Website URL cannot be empty.' };
      }
      formattedUrl = formatCleanUrl(payload.url);
      domain = extractDomain(payload.url);

      if (!domain || domain.length < 3 || !domain.includes('.')) {
        return { success: false, error: 'Please enter a valid website URL or domain.' };
      }

      // Check duplicate excluding self
      const isDuplicate = websites.some(
        (w) => w.id !== id && (w.domain.toLowerCase() === domain.toLowerCase() || w.url.toLowerCase() === formattedUrl.toLowerCase())
      );
      if (isDuplicate) {
        return { success: false, error: `Another website with domain "${domain}" already exists.` };
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
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    setApprovals((prev) => prev.filter((a) => a.id !== id));

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      agentName: item.agentName,
      action: `Approved: ${item.title}`,
      timeAgo: 'Just now',
      status: 'success',
      category: 'Approvals',
      details: item.details
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    showToast(`Approved "${item.title}" successfully`);
  };

  const rejectItem = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    setApprovals((prev) => prev.filter((a) => a.id !== id));

    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      agentName: item.agentName,
      action: `Rejected: ${item.title}`,
      timeAgo: 'Just now',
      status: 'warning',
      category: 'Approvals',
      details: item.details
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    showToast(`Rejected "${item.title}"`);
  };

  const addAgent = (newAgentData: Partial<Agent>) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: newAgentData.name || 'Custom Agent',
      type: newAgentData.type || 'Automated Assistant',
      status: 'Active',
      lastActivity: 'Just now',
      description: newAgentData.description || 'Custom configured agent.',
      tasksCompleted: 0,
      avatarColor: newAgentData.avatarColor || 'bg-blue-600',
      iconName: 'Bot'
    };
    setAgents((prev) => [...prev, newAgent]);
    showToast(`Agent "${newAgent.name}" created successfully`);
  };

  const addTask = (taskData: Partial<TaskItem>) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'New Task',
      agentName: taskData.agentName || 'SEO Agent',
      status: 'Running',
      timeAgo: 'Just now',
      website: website.domain,
      progress: 10,
      category: taskData.category || 'SEO'
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" queued and running`);
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

