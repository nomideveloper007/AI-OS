import React from 'react';
import { useApp } from '../../context/AppContext';
import { Globe, Plus, SearchX } from 'lucide-react';

interface EmptyStateProps {
  isFilterEmpty?: boolean;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isFilterEmpty, onClearFilters }) => {
  const { setIsAddWebsiteOpen } = useApp();

  if (isFilterEmpty) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-4 max-w-lg mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mx-auto">
          <SearchX className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div>
          <h3 className="text-lg font-extrabold text-slate-900">
            No matching websites
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            No websites match your current search query or active filter criteria. Try adjusting your parameters.
          </p>
        </div>

        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl shadow-2xs space-y-5 max-w-xl mx-auto my-8">
      {/* Graphic / SVG */}
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] mx-auto shadow-sm">
        <Globe className="w-10 h-10 stroke-[1.5]" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-xl font-extrabold text-slate-900">
          No websites connected
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          Connect your first website to start building your AI workforce.
        </p>
      </div>

      <button
        onClick={() => setIsAddWebsiteOpen(true)}
        className="px-6 py-3 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Website
      </button>
    </div>
  );
};
