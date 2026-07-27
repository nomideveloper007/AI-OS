import React from 'react';
import { MemoryItem } from '../types/Memory';
import { useMemory } from '../hooks/useMemory';
import { 
  Pin, 
  Trash2, 
  Tag, 
  Globe, 
  Calendar, 
  Eye, 
  ShieldCheck, 
  FileText,
  Clock
} from 'lucide-react';

interface MemoryCardProps {
  memory: MemoryItem;
  onSelect?: (memory: MemoryItem) => void;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({ memory, onSelect }) => {
  const { togglePin, deleteMemory } = useMemory();

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getVisibilityStyle = (vis: string) => {
    switch (vis) {
      case 'Global':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Team':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Agent-Only':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className={`p-5 rounded-2xl bg-white border shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-4 ${
      memory.isPinned ? 'border-indigo-300 ring-2 ring-indigo-500/10' : 'border-slate-200/80'
    }`}>
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
              {memory.type}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
              {memory.category}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getVisibilityStyle(memory.visibility)}`}>
              {memory.visibility}
            </span>
          </div>

          <h3 
            onClick={() => onSelect && onSelect(memory)}
            className="font-extrabold text-slate-900 text-sm mt-2 truncate hover:text-[#4F46E5] cursor-pointer transition-colors"
          >
            {memory.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => togglePin(memory.id)}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              memory.isPinned ? 'bg-indigo-100 text-[#4F46E5]' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title={memory.isPinned ? 'Unpin Memory' : 'Pin Memory'}
          >
            <Pin className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => deleteMemory(memory.id)}
            className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Delete Memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {memory.description}
      </p>

      {/* Tags & Website */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {memory.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-600 font-bold text-[10px] flex items-center gap-1">
              <Tag className="w-2.5 h-2.5 text-slate-400" />
              {tag}
            </span>
          ))}
        </div>

        {memory.website && (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
            <Globe className="w-3.5 h-3.5 text-indigo-500" />
            <span>Target Website: {memory.website}</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(memory.createdAt)}</span>
        </div>

        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getPriorityStyle(memory.priority)}`}>
          {memory.priority} Priority
        </span>
      </div>
    </div>
  );
};
