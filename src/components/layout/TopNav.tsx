import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Menu, 
  Search, 
  Sun, 
  Bell, 
  ChevronDown 
} from 'lucide-react';

export const TopNav: React.FC = () => {
  const { 
    activeTab, 
    toggleSidebar, 
    toggleDarkMode, 
    setIsSearchOpen, 
    isNotificationsOpen, 
    setIsNotificationsOpen,
    notifications 
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length || 3;

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview of your AI OS' },
    websites: { title: 'Websites', subtitle: 'Manage connected websites & domains' },
    agents: { title: 'Agents', subtitle: 'AI Employee fleet & autonomous agents' },
    tasks: { title: 'Tasks', subtitle: 'Task queue, background jobs & execution logs' },
    reports: { title: 'Reports', subtitle: 'Website health, traffic, SEO & performance audits' },
    approvals: { title: 'Approvals', subtitle: 'Pending changes requiring administrator review' },
    activity: { title: 'Activity Logs', subtitle: 'System audit trail and platform event history' },
    ai_engine: { title: 'AI Engine', subtitle: 'Enterprise AI subsystem facade, model router & prompt manager' },
    playground: { title: 'AI Playground', subtitle: 'Interactive prompt testbed for OmniRoute AI Engine' },
    memory: { title: 'Knowledge & Memory', subtitle: 'Single source of truth knowledge repository & long-term memory' },
    workflow: { title: 'Workflows Mission Control', subtitle: 'Orchestrate, execute, track, and monitor automated workflow pipelines' },
    settings: { title: 'Settings', subtitle: 'System preferences, API keys & account management' }
  };

  const currentTab = tabTitles[activeTab] || { title: 'AI OS', subtitle: 'AI Website Operating System' };

  return (
    <header className="h-16 px-4 md:px-6 border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between transition-colors">
      {/* Left Title & Collapse Button */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              {currentTab.title}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {currentTab.subtitle}
          </p>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div
          onClick={() => setIsSearchOpen(true)}
          className="relative flex items-center w-full px-3.5 py-1.5 rounded-xl bg-[#F1F5F9] border border-slate-200/60 text-slate-400 text-xs font-medium cursor-pointer hover:bg-slate-200/60 transition-all shadow-2xs"
        >
          <Search className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" />
          <span className="flex-1 text-slate-400">Search anything...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle Button (Sun icon in Light Mode) */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Light Mode Active"
        >
          <Sun className="w-5 h-5 text-slate-600" />
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4F46E5] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* User Profile Thumbnail */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" 
            alt="Sufian Ali" 
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

