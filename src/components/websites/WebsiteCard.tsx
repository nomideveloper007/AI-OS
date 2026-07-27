import React, { useState } from 'react';
import { WebsiteItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  Globe, 
  Star, 
  ExternalLink, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Trash2, 
  Calendar, 
  Clock, 
  Eye,
  Layers,
  Code
} from 'lucide-react';

interface WebsiteCardProps {
  website: WebsiteItem;
  viewMode: 'grid' | 'list';
}

export const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, viewMode }) => {
  const { 
    selectWebsiteForDetails, 
    setEditingWebsite, 
    setDeletingWebsite, 
    duplicateWebsiteItem, 
    toggleFavoriteWebsite 
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getFrameworkColor = (framework: string) => {
    switch (framework) {
      case 'Next.js':
        return 'bg-slate-900 text-white';
      case 'React':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'Laravel':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'WordPress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Vue':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Angular':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Node.js':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Favicon / Logo */}
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/60 p-2 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            {!imgError ? (
              <img 
                src={faviconUrl} 
                alt={website.name} 
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <Globe className="w-5 h-5 text-indigo-600" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 
                onClick={() => selectWebsiteForDetails(website.id)}
                className="font-extrabold text-slate-900 text-sm truncate hover:text-[#4F46E5] cursor-pointer"
              >
                {website.name}
              </h3>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFavoriteWebsite(website.id); }}
                className="text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
                title={website.favorite ? "Remove favorite" : "Mark as favorite"}
              >
                <Star className={`w-4 h-4 ${website.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            </div>

            <a 
              href={website.url}
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-medium text-slate-500 hover:text-[#4F46E5] flex items-center gap-1 truncate mt-0.5"
            >
              {website.domain}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Badges & Info */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getFrameworkColor(website.framework)}`}>
            {website.framework}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            {website.category}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
            website.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            {website.status}
          </span>
        </div>

        {/* Timestamps & Actions */}
        <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <span className="text-[11px] text-slate-400 font-medium hidden lg:block">
            Updated {formatDate(website.updated_at)}
          </span>

          <div className="flex items-center gap-1 relative">
            <button
              onClick={() => selectWebsiteForDetails(website.id)}
              className="p-2 rounded-xl text-slate-600 hover:text-[#4F46E5] hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Open Details"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Details</span>
            </button>

            <button
              onClick={() => setEditingWebsite(website)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              onClick={() => duplicateWebsiteItem(website.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDeletingWebsite(website)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 relative group">
      {/* Top Card Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 p-2.5 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-2xs">
            {!imgError ? (
              <img 
                src={faviconUrl} 
                alt={website.name} 
                onError={() => setImgError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <Globe className="w-6 h-6 text-[#4F46E5]" />
            )}
          </div>
          <div className="min-w-0">
            <h3 
              onClick={() => selectWebsiteForDetails(website.id)}
              className="font-extrabold text-slate-900 text-base truncate hover:text-[#4F46E5] cursor-pointer transition-colors"
            >
              {website.name}
            </h3>
            <a 
              href={website.url}
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-semibold text-slate-400 hover:text-[#4F46E5] flex items-center gap-1 truncate mt-0.5"
            >
              {website.domain}
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </a>
          </div>
        </div>

        {/* Favorite & Dropdown Menu */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => toggleFavoriteWebsite(website.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title={website.favorite ? "Remove favorite" : "Mark as favorite"}
          >
            <Star className={`w-4 h-4 ${website.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 space-y-0.5 text-xs font-semibold">
                  <button
                    onClick={() => { setMenuOpen(false); selectWebsiteForDetails(website.id); }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    Open Details
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setEditingWebsite(website); }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    Edit
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); duplicateWebsiteItem(website.id); }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    Duplicate
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); toggleFavoriteWebsite(website.id); }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-slate-400" />
                    {website.favorite ? 'Unfavorite' : 'Favorite'}
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => { setMenuOpen(false); setDeletingWebsite(website); }}
                    className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Description if present */}
      {website.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {website.description}
        </p>
      )}

      {/* Meta Badges */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getFrameworkColor(website.framework)}`}>
          {website.framework}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
          {website.category}
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
          website.status === 'Active' ? 'bg-[#ECFDF5] text-[#059669] border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {website.status}
        </span>
      </div>

      {/* Footer Info & Details Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{formatDate(website.created_at)}</span>
        </div>

        <button
          onClick={() => selectWebsiteForDetails(website.id)}
          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#EEF2FF] text-slate-700 hover:text-[#4F46E5] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
