import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { Footer } from './components/layout/Footer';

import { DashboardView } from './components/dashboard/DashboardView';
import { WebsitesView } from './components/websites/WebsitesView';
import { AgentsView } from './components/agents/AgentsView';
import { TasksView } from './components/tasks/TasksView';
import { ReportsView } from './components/reports/ReportsView';
import { ApprovalsView } from './components/approvals/ApprovalsView';
import { ActivityView } from './components/activity/ActivityView';
import { SettingsView } from './components/settings/SettingsView';

import { AddWebsiteModal } from './components/websites/AddWebsiteModal';
import { AddAgentModal } from './components/agents/AddAgentModal';
import { CreateTaskModal } from './components/tasks/CreateTaskModal';
import { SearchModal } from './components/ui/SearchModal';
import { NotificationPopover } from './components/ui/NotificationPopover';
import { Toast } from './components/ui/Toast';

import { ErrorBoundary } from './components/ui/ErrorBoundary';

import { AIEngineTestView } from './components/ai/AIEngineTestView';
import { MemoryView } from './memory/components/MemoryView';

const MainContent: React.FC = () => {
  const { activeTab, isSidebarCollapsed } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'websites':
        return <WebsitesView />;
      case 'agents':
        return <AgentsView />;
      case 'tasks':
        return <TasksView />;
      case 'reports':
        return <ReportsView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'activity':
        return <ActivityView />;
      case 'ai_engine':
        return <AIEngineTestView />;
      case 'memory':
        return <MemoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200 bg-[#F4F6FB] text-slate-900">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main App Canvas */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
        <TopNav />

        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          <ErrorBoundary fallbackTitle="Error loading active view">
            {renderActiveView()}
          </ErrorBoundary>
        </main>

        <Footer />
      </div>

      {/* Global Modals & Overlays */}
      <AddWebsiteModal />
      <AddAgentModal />
      <CreateTaskModal />
      <SearchModal />
      <NotificationPopover />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
