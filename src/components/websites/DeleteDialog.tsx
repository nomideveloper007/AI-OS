import React from 'react';
import { WebsiteItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteDialogProps {
  website: WebsiteItem | null;
  onClose: () => void;
}

export const DeleteDialog: React.FC<DeleteDialogProps> = ({ website, onClose }) => {
  const { deleteWebsiteItem } = useApp();

  if (!website) return null;

  const handleDelete = () => {
    deleteWebsiteItem(website.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
              Delete Website
            </h3>
            <p className="text-xs font-semibold text-rose-600 truncate mt-0.5">
              {website.name} ({website.domain})
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-slate-700 space-y-1">
          <p className="font-semibold text-slate-900">
            Are you sure you want to delete <span className="font-bold text-rose-700">{website.name}</span>?
          </p>
          <p className="text-slate-500 leading-relaxed">
            This action cannot be undone. All configured rules, preferences, and associated tasks for this domain will be deleted.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Website
          </button>
        </div>
      </div>
    </div>
  );
};
