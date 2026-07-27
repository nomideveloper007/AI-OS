import { 
  WebsiteItem, 
  Agent, 
  TaskItem, 
  PendingApproval, 
  ActivityLog, 
  TrafficDataPoint,
  NotificationItem
} from '../types';

export const initialWebsites: WebsiteItem[] = [
  {
    id: 'web-1',
    name: 'Task To Money',
    url: 'https://tasktomoney.com',
    domain: 'tasktomoney.com',
    framework: 'Next.js',
    category: 'Earning Website',
    description: 'High paying microtasks, offerwall hub, and online earning automation engine.',
    notes: 'Primary revenue generation platform connected to AI OS agents.',
    status: 'Active',
    favorite: true,
    created_at: '2024-05-01T08:00:00.000Z',
    updated_at: '2024-07-25T14:30:00.000Z',
    healthScore: 78,
    lastScan: '10 min ago',
    connectedDate: 'May 01, 2024',
    pagesCount: 48,
    serverRegion: 'US-East (Edge Network)',
    metrics: {
      performance: 85,
      seo: 72,
      security: 90,
      accessibility: 65
    }
  },
  {
    id: 'web-2',
    name: 'AI OS SaaS Platform',
    url: 'https://ai-os.io',
    domain: 'ai-os.io',
    framework: 'React',
    category: 'SaaS',
    description: 'Autonomous AI workforce control center and operating system dashboard.',
    notes: 'Production control panel website.',
    status: 'Active',
    favorite: true,
    created_at: '2024-06-12T10:15:00.000Z',
    updated_at: '2024-07-26T09:20:00.000Z',
    healthScore: 92,
    lastScan: '1 hr ago',
    connectedDate: 'Jun 12, 2024',
    pagesCount: 24,
    serverRegion: 'Global CDN'
  },
  {
    id: 'web-3',
    name: 'Sufian Tech Blog',
    url: 'https://sufian.dev',
    domain: 'sufian.dev',
    framework: 'WordPress',
    category: 'Blog',
    description: 'Personal tech, web development, and AI engineering insights publication.',
    notes: 'Content agent automatically drafts weekly posts for review.',
    status: 'Active',
    favorite: false,
    created_at: '2024-07-04T12:00:00.000Z',
    updated_at: '2024-07-24T18:45:00.000Z',
    healthScore: 84,
    lastScan: '3 hrs ago',
    connectedDate: 'Jul 04, 2024',
    pagesCount: 65,
    serverRegion: 'EU-West (Frankfurt)'
  },
  {
    id: 'web-4',
    name: 'Acme E-Commerce Store',
    url: 'https://shopacme.store',
    domain: 'shopacme.store',
    framework: 'Laravel',
    category: 'E-commerce',
    description: 'Digital downloads and electronics marketplace storefront.',
    notes: 'Currently undergoing catalog restructuring before re-activation.',
    status: 'Inactive',
    favorite: false,
    created_at: '2024-07-15T15:30:00.000Z',
    updated_at: '2024-07-20T11:10:00.000Z',
    healthScore: 68,
    lastScan: '1 day ago',
    connectedDate: 'Jul 15, 2024',
    pagesCount: 120,
    serverRegion: 'US-Central'
  },
  {
    id: 'web-5',
    name: 'Portfolio Showcase',
    url: 'https://sufianali.me',
    domain: 'sufianali.me',
    framework: 'Vue',
    category: 'Portfolio',
    description: 'Personal developer showcase, client testimonials, and case studies.',
    notes: 'Integrated with growth agent lead capturing.',
    status: 'Active',
    favorite: false,
    created_at: '2024-07-20T09:00:00.000Z',
    updated_at: '2024-07-27T08:00:00.000Z',
    healthScore: 90,
    lastScan: '2 hrs ago',
    connectedDate: 'Jul 20, 2024',
    pagesCount: 12,
    serverRegion: 'AP-South (Singapore)'
  }
];

export const initialWebsite = initialWebsites[0];

export const initialAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'SEO Agent',
    type: 'Optimization Specialist',
    status: 'Active',
    lastActivity: '2 min ago',
    description: 'Continuously monitors and optimizes page metadata, keywords, and internal links.',
    tasksCompleted: 142,
    avatarColor: 'bg-blue-500',
    iconName: 'Search'
  },
  {
    id: 'agent-2',
    name: 'Content Agent',
    type: 'Content Writer & Editor',
    status: 'Active',
    lastActivity: '15 min ago',
    description: 'Generates blog posts, updates product descriptions, and drafts newsletters.',
    tasksCompleted: 98,
    avatarColor: 'bg-emerald-500',
    iconName: 'FileText'
  },
  {
    id: 'agent-3',
    name: 'Website Agent',
    type: 'Infrastructure & Auditing',
    status: 'Active',
    lastActivity: '25 min ago',
    description: 'Scans site speed, broken links, SSL certificates, and sitemap health.',
    tasksCompleted: 215,
    avatarColor: 'bg-indigo-500',
    iconName: 'Globe'
  },
  {
    id: 'agent-4',
    name: 'Growth Agent',
    type: 'Marketing & Analytics',
    status: 'Active',
    lastActivity: '1 hr ago',
    description: 'Analyzes user funnel conversions, traffic sources, and growth opportunities.',
    tasksCompleted: 76,
    avatarColor: 'bg-sky-500',
    iconName: 'TrendingUp'
  },
  {
    id: 'agent-5',
    name: 'Task Agent',
    type: 'Workflow Automation',
    status: 'Active',
    lastActivity: '2 hr ago',
    description: 'Orchestrates background task queues, schedules scans, and dispatches approvals.',
    tasksCompleted: 310,
    avatarColor: 'bg-purple-500',
    iconName: 'Cpu'
  },
  {
    id: 'agent-6',
    name: 'Security Agent',
    type: 'Threat & Compliance',
    status: 'Idle',
    lastActivity: '1 day ago',
    description: 'Checks dependencies, header security, and protects against vulnerability exploits.',
    tasksCompleted: 54,
    avatarColor: 'bg-rose-500',
    iconName: 'ShieldAlert'
  }
];

export const initialTasks: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Optimize homepage for SEO',
    agentName: 'SEO Agent',
    status: 'Running',
    timeAgo: '5 min ago',
    website: 'tasktomoney.com',
    progress: 65,
    category: 'SEO'
  },
  {
    id: 'task-2',
    title: 'Write blog post: Earn Money Online',
    agentName: 'Content Agent',
    status: 'Pending',
    timeAgo: '10 min ago',
    website: 'tasktomoney.com',
    progress: 0,
    category: 'Content'
  },
  {
    id: 'task-3',
    title: 'Scan website for issues',
    agentName: 'Website Agent',
    status: 'Completed',
    timeAgo: '25 min ago',
    website: 'tasktomoney.com',
    progress: 100,
    category: 'Performance'
  },
  {
    id: 'task-4',
    title: 'Find new earning tasks',
    agentName: 'Growth Agent',
    status: 'Running',
    timeAgo: '35 min ago',
    website: 'tasktomoney.com',
    progress: 40,
    category: 'Growth'
  },
  {
    id: 'task-5',
    title: 'Check website speed',
    agentName: 'Website Agent',
    status: 'Pending',
    timeAgo: '50 min ago',
    website: 'tasktomoney.com',
    progress: 0,
    category: 'Performance'
  },
  {
    id: 'task-6',
    title: 'Generate monthly SEO report',
    agentName: 'SEO Agent',
    status: 'Running',
    timeAgo: '1 hr ago',
    website: 'tasktomoney.com',
    progress: 80,
    category: 'SEO'
  },
  {
    id: 'task-7',
    title: 'Audit broken internal links',
    agentName: 'Website Agent',
    status: 'Running',
    timeAgo: '1 hr ago',
    website: 'tasktomoney.com',
    progress: 30,
    category: 'Performance'
  },
  {
    id: 'task-8',
    title: 'Analyze competitor keyword density',
    agentName: 'Growth Agent',
    status: 'Running',
    timeAgo: '2 hrs ago',
    website: 'tasktomoney.com',
    progress: 55,
    category: 'Growth'
  },
  {
    id: 'task-9',
    title: 'Refactor sitemap XML structure',
    agentName: 'Task Agent',
    status: 'Pending',
    timeAgo: '2 hrs ago',
    website: 'tasktomoney.com',
    progress: 0,
    category: 'SEO'
  },
  {
    id: 'task-10',
    title: 'Audit SSL certificate chain',
    agentName: 'Security Agent',
    status: 'Pending',
    timeAgo: '3 hrs ago',
    website: 'tasktomoney.com',
    progress: 0,
    category: 'Security'
  },
  {
    id: 'task-11',
    title: 'Draft landing page newsletter banner',
    agentName: 'Content Agent',
    status: 'Pending',
    timeAgo: '4 hrs ago',
    website: 'tasktomoney.com',
    progress: 0,
    category: 'Content'
  },
  {
    id: 'task-12',
    title: 'Check page accessibility contrast',
    agentName: 'Website Agent',
    status: 'Pending',
    timeAgo: '5 hrs ago',
    website: 'tasktomoney.com',
    progress: 0,
    category: 'Performance'
  }
];

export const initialApprovals: PendingApproval[] = [
  {
    id: 'app-1',
    title: 'Update homepage title',
    agentName: 'SEO Agent',
    website: 'tasktomoney.com',
    timeAgo: '5 min ago',
    details: 'Change <title> tag to "Task To Money - High Paying Online Microtasks & Work from Home"',
    impact: 'High',
    diff: {
      before: '<title>Task To Money - Earn Online</title>',
      after: '<title>Task To Money - High Paying Online Microtasks & Work from Home</title>'
    }
  },
  {
    id: 'app-2',
    title: 'Publish blog post',
    agentName: 'Content Agent',
    website: 'tasktomoney.com',
    timeAgo: '15 min ago',
    details: 'Draft article "Top 10 Proven Strategies to Earn Money Online in 2024" ready for publication.',
    impact: 'Medium',
    diff: {
      before: 'Draft status: In Review',
      after: 'Publish status: Live Public URL (/blog/top-10-earn-money-online)'
    }
  },
  {
    id: 'app-3',
    title: 'Add new page: About Us',
    agentName: 'Website Agent',
    website: 'tasktomoney.com',
    timeAgo: '25 min ago',
    details: 'Create new static /about page with team story, trust badges, and compliance links.',
    impact: 'Medium',
    diff: {
      before: '404 Page Not Found (/about)',
      after: 'New Route Created: /about (React Component + Metadata)'
    }
  },
  {
    id: 'app-4',
    title: 'Optimize images',
    agentName: 'SEO Agent',
    website: 'tasktomoney.com',
    timeAgo: '35 min ago',
    details: 'Convert 14 PNG hero banners to Next-gen WebP format, saving ~2.4MB payload.',
    impact: 'Low',
    diff: {
      before: '14 PNG files (3.8 MB total)',
      after: '14 WebP files (1.4 MB total, -63% size)'
    }
  },
  {
    id: 'app-5',
    title: 'Update robots.txt directives',
    agentName: 'SEO Agent',
    website: 'tasktomoney.com',
    timeAgo: '1 hr ago',
    details: 'Allow search bots indexing access to new landing pages.',
    impact: 'Medium',
    diff: {
      before: 'Disallow: /landing/',
      after: 'Allow: /landing/'
    }
  },
  {
    id: 'app-6',
    title: 'Enable Cloudflare HSTS security headers',
    agentName: 'Security Agent',
    website: 'tasktomoney.com',
    timeAgo: '2 hrs ago',
    details: 'Enforce strict HTTPS routing on all subdomains.',
    impact: 'High',
    diff: {
      before: 'HSTS: Disabled',
      after: 'HSTS: max-age=31536000; includeSubDomains'
    }
  },
  {
    id: 'app-7',
    title: 'Publish customer testimonial section',
    agentName: 'Content Agent',
    website: 'tasktomoney.com',
    timeAgo: '3 hrs ago',
    details: 'Insert 5 verified user testimonials on homepage.',
    impact: 'Low',
    diff: {
      before: 'Hidden Testimonials Section',
      after: 'Visible Grid Component'
    }
  },
  {
    id: 'app-8',
    title: 'Pre-load critical Web Fonts',
    agentName: 'Website Agent',
    website: 'tasktomoney.com',
    timeAgo: '4 hrs ago',
    details: 'Preload Inter font family to eliminate layout shift.',
    impact: 'Low',
    diff: {
      before: '<link rel="stylesheet" ...>',
      after: '<link rel="preload" as="font" ...>'
    }
  }
];

export const initialActivityLogs: ActivityLog[] = [
  {
    id: 'act-1',
    agentName: 'SEO Agent',
    action: 'Optimized 3 pages',
    timeAgo: '2 min ago',
    status: 'success',
    category: 'SEO',
    details: 'Updated meta descriptions and OpenGraph tags for /features, /pricing, and /contact.'
  },
  {
    id: 'act-2',
    agentName: 'Content Agent',
    action: 'Published new article',
    timeAgo: '15 min ago',
    status: 'success',
    category: 'Content',
    details: 'Published "How to maximize daily task earnings" with 1,200 words and custom illustrations.'
  },
  {
    id: 'act-3',
    agentName: 'Website Agent',
    action: 'Completed website scan',
    timeAgo: '25 min ago',
    status: 'success',
    category: 'Performance',
    details: 'Scanned 48 pages. Zero critical broken links. Average response time: 210ms.'
  },
  {
    id: 'act-4',
    agentName: 'Growth Agent',
    action: 'Found 12 growth ideas',
    timeAgo: '1 hr ago',
    status: 'info',
    category: 'Growth',
    details: 'Analyzed competitor keywords and identified high-traffic longtail search terms.'
  },
  {
    id: 'act-5',
    agentName: 'Task Agent',
    action: 'Added 18 new tasks',
    timeAgo: '2 hr ago',
    status: 'info',
    category: 'Tasks',
    details: 'Generated automated task list for upcoming weekly SEO & site health optimization cycle.'
  }
];

export const trafficData: TrafficDataPoint[] = [
  { date: 'May 12', visitors: 250 },
  { date: 'May 13', visitors: 500 },
  { date: 'May 14', visitors: 600 },
  { date: 'May 15', visitors: 550 },
  { date: 'May 16', visitors: 812 },
  { date: 'May 17', visitors: 780 },
  { date: 'May 18', visitors: 920 }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: '8 Pending Approvals',
    message: 'SEO and Content agents generated updates requiring your sign-off.',
    timeAgo: '10 min ago',
    read: false,
    type: 'approval'
  },
  {
    id: 'notif-2',
    title: 'Website Health Scan Complete',
    message: 'Overall health score is 78/100. Performance boosted by +5 points.',
    timeAgo: '25 min ago',
    read: false,
    type: 'system'
  },
  {
    id: 'notif-3',
    title: 'New Article Drafted',
    message: 'Content Agent drafted "Top 10 Proven Strategies to Earn Money Online".',
    timeAgo: '1 hr ago',
    read: false,
    type: 'agent'
  }
];

