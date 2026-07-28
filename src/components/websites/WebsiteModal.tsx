import React, { useState, useEffect } from 'react';
import { WebsiteItem, WebsiteCategory, WebsiteFramework, WebsiteStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Globe, AlertCircle, Check, RefreshCw } from 'lucide-react';

interface WebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWebsite?: WebsiteItem | null;
}

const CATEGORIES: WebsiteCategory[] = [
  'Business',
  'Blog',
  'E-commerce',
  'Portfolio',
  'SaaS',
  'Earning Website',
  'News',
  'Other'
];

const FRAMEWORKS: WebsiteFramework[] = [
  'Next.js',
  'React',
  'Laravel',
  'WordPress',
  'Vue',
  'Angular',
  'Node.js',
  'PHP',
  'Unknown'
];

export const WebsiteModal: React.FC<WebsiteModalProps> = ({
  isOpen,
  onClose,
  editingWebsite
}) => {
  const { addWebsiteItem, updateWebsiteItem } = useApp();

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<WebsiteCategory>('SaaS');
  const [framework, setFramework] = useState<WebsiteFramework>('Next.js');
  const [status, setStatus] = useState<WebsiteStatus>('Active');
  const [favorite, setFavorite] = useState(false);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [touched, setTouched] = useState({ name: false, url: false });
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (editingWebsite) {
      setName(editingWebsite.name);
      setUrl(editingWebsite.url);
      setCategory(editingWebsite.category);
      setFramework(editingWebsite.framework);
      setStatus(editingWebsite.status);
      setFavorite(editingWebsite.favorite);
      setDescription(editingWebsite.description || '');
      setNotes(editingWebsite.notes || '');
    } else {
      setName('');
      setUrl('');
      setCategory('SaaS');
      setFramework('Next.js');
      setStatus('Active');
      setFavorite(false);
      setDescription('');
      setNotes('');
    }
    setErrorMsg(null);
    setTouched({ name: false, url: false });
  }, [editingWebsite, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, url: true });
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Website Name is required.');
      return;
    }
    if (!url.trim()) {
      setErrorMsg('Website URL is required.');
      return;
    }

    setIsVerifying(true);
    try {
      if (editingWebsite) {
        const res = await updateWebsiteItem(editingWebsite.id, {
          name,
          url,
          category,
          framework,
          status,
          favorite,
          description,
          notes
        });
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to update website.');
          setIsVerifying(false);
          return;
        }
      } else {
        const res = await addWebsiteItem({
          name,
          url,
          category,
          framework,
          status,
          favorite,
          description,
          notes
        });
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to add website.');
          setIsVerifying(false);
          return;
        }
      }
      onClose();
    } catch (err) {
      setErrorMsg('An unexpected error occurred during repository verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                {editingWebsite ? 'Edit Website' : 'Add Website'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {editingWebsite ? 'Update website connection settings' : 'Register a new website in your AI OS workspace'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-bounce-in">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Website Name & URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Website Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Task To Money"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched({ ...touched, name: true })}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                  touched.name && !name.trim() 
                    ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50/50 focus:border-[#4F46E5] focus:ring-indigo-500/20'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Website URL <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. https://tasktomoney.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => setTouched({ ...touched, url: true })}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 transition-all ${
                  touched.url && !url.trim() 
                    ? 'border-rose-300 bg-rose-50/30 focus:ring-rose-500' 
                    : 'border-slate-200 bg-slate-50/50 focus:border-[#4F46E5] focus:ring-indigo-500/20'
                }`}
              />
            </div>
          </div>

          {/* Category & Framework Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as WebsiteCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4F46E5]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Framework
              </label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as WebsiteFramework)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4F46E5]"
              >
                {FRAMEWORKS.map((fw) => (
                  <option key={fw} value={fw}>
                    {fw}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Favorite Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Status
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('Active')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    status === 'Active'
                      ? 'bg-[#ECFDF5] border-emerald-300 text-[#059669]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Inactive')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    status === 'Inactive'
                      ? 'bg-slate-200 border-slate-300 text-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={favorite}
                  onChange={(e) => setFavorite(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4F46E5] focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Favorite Website</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of the website's purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4F46E5] resize-none"
            ></textarea>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Internal technical notes, credentials info, or operational directives..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-[#4F46E5] resize-none"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className={`px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ${
                isVerifying ? 'opacity-75 cursor-wait' : 'cursor-pointer'
              }`}
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Repository...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>{editingWebsite ? 'Save Changes' : 'Connect Website'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
