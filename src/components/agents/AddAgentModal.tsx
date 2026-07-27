import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bot, Plus, Sparkles } from 'lucide-react';

export const AddAgentModal: React.FC = () => {
  const { isAddAgentOpen, setIsAddAgentOpen, addAgent } = useApp();
  const [name, setName] = useState('');
  const [type, setType] = useState('Optimization Specialist');
  const [description, setDescription] = useState('');

  if (!isAddAgentOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addAgent({
      name: name.trim(),
      type,
      description: description.trim() || 'Custom AI Agent worker.'
    });
    setName('');
    setDescription('');
    setIsAddAgentOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Deploy AI Agent</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add an autonomous worker to your AI OS fleet</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddAgentOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agent Name <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Speed Optimization Agent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agent Type / Specialty
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="Optimization Specialist">SEO & Optimization</option>
              <option value="Content Writer & Editor">Content & Copywriting</option>
              <option value="Infrastructure & Auditing">Site Health & Performance</option>
              <option value="Marketing & Analytics">Growth & Analytics</option>
              <option value="Security Auditor">Security & Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Agent Instructions / Scope
            </label>
            <textarea 
              rows={3}
              placeholder="Describe what this AI agent should monitor and execute..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddAgentOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-600/30"
            >
              <Sparkles className="w-4 h-4" />
              Deploy Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
