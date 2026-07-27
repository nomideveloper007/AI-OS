import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { WebsiteItem, WebsiteCategory, WebsiteFramework, WebsiteStatus } from '../../types';
import { WebsiteCard } from './WebsiteCard';
import { WebsiteModal } from './WebsiteModal';
import { DeleteDialog } from './DeleteDialog';
import { WebsiteDetailsPage } from './WebsiteDetailsPage';
import { EmptyState } from './EmptyState';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  List as ListIcon, 
  Star, 
  X,
  Globe
} from 'lucide-react';

export const WebsitesView: React.FC = () => {
  const { 
    websites, 
    selectedWebsiteId, 
    selectWebsiteForDetails, 
    isAddWebsiteOpen, 
    setIsAddWebsiteOpen,
    editingWebsite,
    setEditingWebsite,
    deletingWebsite,
    setDeletingWebsite
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [frameworkFilter, setFrameworkFilter] = useState<string>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical' | 'updated'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // If a website is selected for detail view, show WebsiteDetailsPage!
  const selectedWebsite = useMemo(() => {
    if (!selectedWebsiteId) return null;
    return websites.find((w) => w.id === selectedWebsiteId) || null;
  }, [websites, selectedWebsiteId]);

  // Filter & Search Logic
  const filteredWebsites = useMemo(() => {
    return websites
      .filter((w) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = w.name.toLowerCase().includes(q);
          const matchDomain = w.domain.toLowerCase().includes(q);
          const matchCategory = w.category.toLowerCase().includes(q);
          const matchFramework = w.framework.toLowerCase().includes(q);
          if (!matchName && !matchDomain && !matchCategory && !matchFramework) {
            return false;
          }
        }

        // Status Filter
        if (statusFilter !== 'all' && w.status !== statusFilter) {
          return false;
        }

        // Category Filter
        if (categoryFilter !== 'all' && w.category !== categoryFilter) {
          return false;
        }

        // Framework Filter
        if (frameworkFilter !== 'all' && w.framework !== frameworkFilter) {
          return false;
        }

        // Favorites Only
        if (favoritesOnly && !w.favorite) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'alphabetical') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'updated') {
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        }
        return 0;
      });
  }, [websites, searchQuery, statusFilter, categoryFilter, frameworkFilter, favoritesOnly, sortBy]);

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || categoryFilter !== 'all' || frameworkFilter !== 'all' || favoritesOnly;

  if (selectedWebsite) {
    return (
      <div className="space-y-6">
        <WebsiteDetailsPage 
          website={selectedWebsite} 
          onBack={() => selectWebsiteForDetails(null)} 
        />

        <WebsiteModal
          isOpen={isAddWebsiteOpen || editingWebsite !== null}
          onClose={() => {
            setIsAddWebsiteOpen(false);
            setEditingWebsite(null);
          }}
          editingWebsite={editingWebsite}
        />

        <DeleteDialog
          website={deletingWebsite}
          onClose={() => setDeletingWebsite(null)}
        />
      </div>
    );
  }

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setFrameworkFilter('all');
    setFavoritesOnly(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Websites</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage every website connected to AI OS.
          </p>
        </div>

        <button
          onClick={() => setIsAddWebsiteOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Website
        </button>
      </div>

      {/* Search, Filters, Sort & View Toggle Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, domain, framework, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4F46E5] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Category: All</option>
              <option value="Business">Business</option>
              <option value="Blog">Blog</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Portfolio">Portfolio</option>
              <option value="SaaS">SaaS</option>
              <option value="Earning Website">Earning Website</option>
              <option value="News">News</option>
              <option value="Other">Other</option>
            </select>

            {/* Framework Filter */}
            <select
              value={frameworkFilter}
              onChange={(e) => setFrameworkFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">Framework: All</option>
              <option value="Next.js">Next.js</option>
              <option value="React">React</option>
              <option value="Laravel">Laravel</option>
              <option value="WordPress">WordPress</option>
              <option value="Vue">Vue</option>
              <option value="Angular">Angular</option>
              <option value="Node.js">Node.js</option>
              <option value="PHP">PHP</option>
              <option value="Unknown">Unknown</option>
            </select>

            {/* Favorites Toggle */}
            <button
              onClick={() => setFavoritesOnly(!favoritesOnly)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                favoritesOnly 
                  ? 'bg-amber-50 border-amber-300 text-amber-700' 
                  : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${favoritesOnly ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
              Favorites
            </button>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="alphabetical">Sort: Alphabetical</option>
              <option value="updated">Sort: Recently Updated</option>
            </select>

            {/* Grid / List View Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#4F46E5] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-[#4F46E5] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
            <span className="text-xs font-bold text-slate-400">Active Filters:</span>
            {searchQuery && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                Status: {statusFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
              </span>
            )}
            {categoryFilter !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                Category: {categoryFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
              </span>
            )}
            {frameworkFilter !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                Framework: {frameworkFilter}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFrameworkFilter('all')} />
              </span>
            )}
            {favoritesOnly && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 flex items-center gap-1">
                Favorites Only
                <X className="w-3 h-3 cursor-pointer" onClick={() => setFavoritesOnly(false)} />
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-rose-600 hover:underline ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Website List / Grid */}
      {websites.length === 0 ? (
        <EmptyState />
      ) : filteredWebsites.length === 0 ? (
        <EmptyState isFilterEmpty onClearFilters={handleClearFilters} />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' 
            : 'space-y-3'
        }>
          {filteredWebsites.map((web) => (
            <WebsiteCard key={web.id} website={web} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* Modals & Dialogs */}
      <WebsiteModal
        isOpen={isAddWebsiteOpen || editingWebsite !== null}
        onClose={() => {
          setIsAddWebsiteOpen(false);
          setEditingWebsite(null);
        }}
        editingWebsite={editingWebsite}
      />

      <DeleteDialog
        website={deletingWebsite}
        onClose={() => setDeletingWebsite(null)}
      />
    </div>
  );
};
