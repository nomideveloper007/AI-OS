import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import { 
  LayoutDashboard, 
  Globe, 
  Bot, 
  CheckSquare, 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  Settings, 
  ChevronDown,
  Cpu,
  Database,
  Zap,
  Workflow,
  Crown,
  Brain,
  Network
} from 'lucide-react';

interface NavItemDef {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    isSidebarCollapsed, 
    approvals, 
    tasks 
  } = useApp();

  const pendingApprovalsCount = approvals.length;
  const runningTasksCount = tasks.filter(t => t.status === 'Running').length;

  const navItems: NavItemDef[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'websites', label: 'Websites', icon: Globe },
    { id: 'website_intelligence', label: 'Website Intelligence', icon: Brain },
    { id: 'agents', label: 'Agents', icon: Bot },
    { id: 'ceo', label: 'CEO Agent', icon: Crown },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, badge: runningTasksCount > 0 ? runningTasksCount : undefined },
    { id: 'task_engine', label: 'Task Engine', icon: Network },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'approvals', label: 'Approvals', icon: ShieldCheck, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'ai_engine', label: 'AI Engine', icon: Cpu },
    { id: 'playground', label: 'AI Playground', icon: Zap },
    { id: 'memory', label: 'Memory System', icon: Database },
    { id: 'workflow', label: 'Workflows', icon: Workflow },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`
        fixed top-0 left-0 z-30 h-screen transition-all duration-300 flex flex-col justify-between
        bg-white border-r border-slate-200/80 text-slate-700
        ${isSidebarCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Top Header & Brand */}
      <div>
        <div className="p-4 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs flex-shrink-0">
            <Cpu className="w-6 h-6 stroke-[2]" />
          </div>

          {!isSidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-lg leading-tight tracking-tight text-slate-900">
                AI OS
              </h1>
              <p className="text-[11px] font-medium text-slate-400 truncate">
                AI Website Operating System
              </p>
            </div>
          )}
        </div>

        {/* Main Navigation Menu */}
        <div className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer
                  ${isActive
                    ? 'bg-[#EEF2FF] text-[#4F46E5]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-[#4F46E5]' : 'text-slate-400'
                  }`} 
                />
                {!isSidebarCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <span className={`
                    px-2 py-0.5 text-xs font-bold rounded-full
                    ${isActive 
                      ? 'bg-[#4F46E5] text-white' 
                      : 'bg-indigo-100 text-indigo-700'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sidebar Footer Cards */}
      <div className="p-3 space-y-3">
        {/* Promotional / AI Agent Assistant Card */}
        {!isSidebarCollapsed && (
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-indigo-50/40 border border-slate-100/90 text-center space-y-3 relative overflow-hidden shadow-2xs">
            {/* Robot Avatar Art */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-white p-1 shadow-sm border border-slate-100 flex items-center justify-center relative">
              <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="14" y="16" width="36" height="30" rx="10" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2" />
                <path d="M32 16V8M32 8A3 3 0 1032 2a3 3 0 000 6z" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="25" cy="28" r="4" fill="#3B82F6" />
                <circle cx="39" cy="28" r="4" fill="#3B82F6" />
                <circle cx="26" cy="27" r="1.5" fill="#FFFFFF" />
                <circle cx="40" cy="27" r="1.5" fill="#FFFFFF" />
                <path d="M26 37C28 39.5 36 39.5 38 37" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="8" y="24" width="6" height="14" rx="3" fill="#818CF8" />
                <rect x="50" y="24" width="6" height="14" rx="3" fill="#818CF8" />
              </svg>
            </div>

            <div>
              <h3 className="font-bold text-xs text-slate-900 leading-snug">
                Powerful AI Agents Working for You 24/7
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Automate, Optimize and Grow your website with AI Employees.
              </p>
            </div>

            <button 
              onClick={() => alert("Upgrade to AI OS Pro to unlock unlimited autonomous agent workers!")}
              className="w-full py-2.5 px-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm shadow-indigo-600/30 flex items-center justify-center cursor-pointer"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* User Profile Block */}
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120" 
            alt="Sufian Ali Avatar" 
            className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
          />
          {!isSidebarCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Sufian Ali</p>
                <p className="text-[11px] font-medium text-slate-400 truncate">Administrator</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

