import React, { useState } from 'react';
import { useMemory } from '../hooks/useMemory';
import { BookOpen, Search, Tag, User, Calendar, Eye } from 'lucide-react';

export const KnowledgeView: React.FC = () => {
  const { articles } = useMemory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredArticles = articles.filter((art) => {
    if (searchQuery && !art.title.toLowerCase().includes(searchQuery.toLowerCase()) && !art.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && art.category !== selectedCategory) return false;
    return true;
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Knowledge Base articles by title, tag, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Categories</option>
          <option value="SEO">SEO</option>
          <option value="Security">Security</option>
          <option value="Marketing">Marketing</option>
          <option value="Content">Content</option>
          <option value="Website">Website</option>
        </select>
      </div>

      {/* Knowledge Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredArticles.map((art) => (
          <div key={art.id} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full font-extrabold text-[10px] bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                  {art.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {art.readCount} views
                </span>
              </div>

              <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{art.title}</h3>
              <p className="text-slate-600 font-medium leading-relaxed line-clamp-3">{art.summary}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5 flex-wrap">
                {art.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-[10px] rounded">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {art.author}
                </span>
                <span>{formatDate(art.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
