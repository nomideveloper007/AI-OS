import React, { useState } from 'react';
import { useMemory } from '../hooks/useMemory';
import { MemoryCard } from './MemoryCard';
import { MemoryTimeline } from './MemoryTimeline';
import { KnowledgeView } from './KnowledgeView';
import { KnowledgeCategory } from '../types/MemoryCategory';
import { MemoryType, MemoryItem } from '../types/Memory';
import { MemoryPriority } from '../types/MemoryPriority';
import { MemoryVisibility } from '../types/MemoryVisibility';
import { 
  Database, 
  Plus, 
  Search, 
  Pin, 
  BookOpen, 
  Clock, 
  Layers, 
  X, 
  Filter,
  CheckCircle2,
  Calendar,
  Globe,
  Tag
} from 'lucide-react';

export const MemoryView: React.FC = () => {
  const { memories, articles, createMemory, searchMemories } = useMemory();
  const [activeTab, setActiveTab] = useState<'recent' | 'knowledge' | 'categories' | 'timeline' | 'pinned'>('recent');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [websiteFilter, setWebsiteFilter] = useState<string>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryType>('Website Memory');
  const [newCategory, setNewCategory] = useState<KnowledgeCategory>('Website');
  const [newPriority, setNewPriority] = useState<MemoryPriority>('Medium');
  const [newVisibility, setNewVisibility] = useState<MemoryVisibility>('Global');
  const [newWebsite, setNewWebsite] = useState('');
  const [newTagsStr, setNewTagsStr] = useState('');

  const filteredMemories = searchMemories({
    query: searchQuery,
    category: categoryFilter as any,
    priority: priorityFilter as any,
    website: websiteFilter !== 'all' ? websiteFilter : undefined,
    pinnedOnly: activeTab === 'pinned'
  }).filter((m) => typeFilter === 'all' || m.type === typeFilter);

  const pinnedCount = memories.filter((m) => m.isPinned).length;
  const categoriesCount = new Set(memories.map((m) => m.category)).size;

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const tagsArr = newTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    createMemory({
      title: newTitle,
      description: newDescription,
      content: newContent,
      type: newType,
      category: newCategory,
      priority: newPriority,
      visibility: newVisibility,
      website: newWebsite.trim() || undefined,
      tags: tagsArr.length > 0 ? tagsArr : ['Memory', newCategory],
      source: 'User Administrator'
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewContent('');
    setNewWebsite('');
    setNewTagsStr('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] flex-shrink-0 shadow-2xs">
            <Database className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Knowledge & Memory System</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Long-term single source of truth for all connected websites, tasks, reports, and AI Agent memory.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Memory Item
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-1">
          <p className="text-xs font-bold text-slate-400">Total Memories</p>
          <p className="text-2xl font-extrabold text-slate-900">{memories.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
          <p className="text-xs font-bold text-indigo-700">Knowledge Articles</p>
          <p className="text-2xl font-extrabold text-indigo-800">{articles.length}</p>
        </div>
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
          <p className="text-xs font-bold text-amber-700">Pinned Memories</p>
          <p className="text-2xl font-extrabold text-amber-800">{pinnedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
          <p className="text-xs font-bold text-slate-500">Categories Active</p>
          <p className="text-2xl font-extrabold text-slate-800">{categoriesCount}</p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search memory title, tag, source, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Categories</option>
            <option value="Website">Website</option>
            <option value="SEO">SEO</option>
            <option value="Marketing">Marketing</option>
            <option value="Content">Content</option>
            <option value="Security">Security</option>
            <option value="Settings">Settings</option>
            <option value="Tasks">Tasks</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Memory Types</option>
            <option value="Website Memory">Website Memory</option>
            <option value="Project Memory">Project Memory</option>
            <option value="Global Memory">Global Memory</option>
            <option value="Agent Memory">Agent Memory</option>
            <option value="Long Term Memory">Long Term Memory</option>
          </select>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 pb-1 overflow-x-auto custom-scrollbar">
        {[
          { id: 'recent', label: `Recent Memories (${filteredMemories.length})`, icon: Database },
          { id: 'knowledge', label: `Knowledge Base (${articles.length})`, icon: BookOpen },
          { id: 'pinned', label: `Pinned Items (${pinnedCount})`, icon: Pin },
          { id: 'categories', label: 'Categories Overview', icon: Layers },
          { id: 'timeline', label: 'Audit Timeline Log', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#EEF2FF] text-[#4F46E5] shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 text-slate-400" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      {(activeTab === 'recent' || activeTab === 'pinned') && (
        filteredMemories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredMemories.map((mem) => (
              <MemoryCard key={mem.id} memory={mem} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <Database className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-extrabold text-slate-800">No memory items match your filter.</p>
            <p className="text-xs font-semibold text-slate-400">Try adjusting your search terms or filters.</p>
          </div>
        )
      )}

      {activeTab === 'knowledge' && <KnowledgeView />}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {['Website', 'SEO', 'Marketing', 'Content', 'Tasks', 'Security', 'Settings'].map((cat) => {
            const catMemories = memories.filter((m) => m.category === cat);
            return (
              <div key={cat} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm">{cat}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-[#4F46E5]">
                    {catMemories.length} Items
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs">
                  {catMemories.slice(0, 4).map((m) => (
                    <li key={m.id} className="font-semibold text-slate-700 truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      {m.title}
                    </li>
                  ))}
                  {catMemories.length === 0 && <li className="text-slate-400 italic">No memories stored.</li>}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'timeline' && <MemoryTimeline />}

      {/* Add Memory Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Memory Item</h3>
                  <p className="text-xs text-slate-500 font-medium">Store structured memory record in AI OS brain</p>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMemory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Routing Strategy & API Specs"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Memory Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MemoryType)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Website Memory">Website Memory</option>
                    <option value="Project Memory">Project Memory</option>
                    <option value="Global Memory">Global Memory</option>
                    <option value="Agent Memory">Agent Memory</option>
                    <option value="Long Term Memory">Long Term Memory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as KnowledgeCategory)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Website">Website</option>
                    <option value="SEO">SEO</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Content">Content</option>
                    <option value="Security">Security</option>
                    <option value="Settings">Settings</option>
                    <option value="Tasks">Tasks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as MemoryPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Website (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. tasktomoney.com"
                    value={newWebsite}
                    onChange={(e) => setNewWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Short summary of knowledge or specification..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Architecture, SEO"
                  value={newTagsStr}
                  onChange={(e) => setNewTagsStr(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Save Memory Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
