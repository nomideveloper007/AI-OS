import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Search, Globe, Bot, CheckSquare, BarChart3, ArrowRight } from 'lucide-react';
import { NavTab } from '../../types';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveTab, tasks, agents, approvals } = useApp();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const navigateTo = (tab: NavTab) => {
    setActiveTab(tab);
    setIsSearchOpen(false);
    setQuery('');
  };

  const filteredTasks = tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()));
  const filteredAgents = agents.filter((a) => a.name.toLowerCase().includes(query.toLowerCase()));
  const filteredApprovals = approvals.filter((a) => a.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input 
            type="text" 
            autoFocus
            placeholder="Search agents, tasks, approvals, reports..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!query ? (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Quick Navigation
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => navigateTo('websites')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-500" />
                    Websites Management
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button 
                  onClick={() => navigateTo('agents')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 group"
                >
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    AI Agent Fleet
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button 
                  onClick={() => navigateTo('tasks')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 group"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-500" />
                    Background Tasks
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button 
                  onClick={() => navigateTo('reports')}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-slate-800 text-left transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 group"
                >
                  <span className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" />
                    Analytics & Reports
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Tasks ({filteredTasks.length})
                  </p>
                  <div className="space-y-1">
                    {filteredTasks.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => navigateTo('tasks')}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{t.title}</span>
                        <span className="text-[11px] text-slate-400">{t.agentName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredAgents.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Agents ({filteredAgents.length})
                  </p>
                  <div className="space-y-1">
                    {filteredAgents.map((a) => (
                      <div 
                        key={a.id} 
                        onClick={() => navigateTo('agents')}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{a.name}</span>
                        <span className="text-[11px] text-indigo-500 font-medium">{a.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredApprovals.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Pending Approvals ({filteredApprovals.length})
                  </p>
                  <div className="space-y-1">
                    {filteredApprovals.map((ap) => (
                      <div 
                        key={ap.id} 
                        onClick={() => navigateTo('approvals')}
                        className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-xs cursor-pointer"
                      >
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{ap.title}</span>
                        <span className="text-[11px] text-amber-500 font-medium">{ap.agentName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
