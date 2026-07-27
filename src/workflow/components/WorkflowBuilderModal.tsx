import React, { useState } from 'react';
import { useWorkflow } from '../hooks/useWorkflow';
import { WorkflowBuilder } from '../builders/WorkflowBuilder';
import { StepBuilder } from '../builders/StepBuilder';
import { WorkflowPriority } from '../types/WorkflowPriority';
import { WorkflowTrigger } from '../types/WorkflowTrigger';
import { WorkflowStep } from '../types/WorkflowStep';
import { X, Plus, Trash2, Layers, Play, CheckCircle2, ArrowDown } from 'lucide-react';

interface WorkflowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkflowBuilderModal: React.FC<WorkflowBuilderModalProps> = ({ isOpen, onClose }) => {
  const { manager, refreshState } = useWorkflow();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('SEO');
  const [priority, setPriority] = useState<WorkflowPriority>('Medium');
  const [trigger, setTrigger] = useState<WorkflowTrigger>('Manual');
  const [website, setWebsite] = useState('ai-os.io');

  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'step-1',
      name: 'Read Target Memory',
      description: 'Fetch configuration data from memory repository.',
      status: 'Ready',
      assignedAgent: 'SEO Specialist Agent',
      action: 'Read Memory',
      condition: 'Memory Exists',
      retryCount: 1,
      timeout: 5000,
      estimatedDuration: 500
    }
  ]);

  if (!isOpen) return null;

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: `New Step ${steps.length + 1}`,
      description: 'Configured workflow step action.',
      status: 'Ready',
      assignedAgent: 'Website Auditor Agent',
      action: 'Call AI Engine',
      condition: 'AI Connected',
      retryCount: 1,
      timeout: 10000,
      estimatedDuration: 1000
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (idx: number) => {
    setSteps(steps.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const builder = new WorkflowBuilder()
      .setName(name)
      .setDescription(description || 'Visual workflow created via mission control builder.')
      .setCategory(category)
      .setPriority(priority)
      .setTrigger(trigger)
      .setWebsite(website);

    steps.forEach((st) => builder.addStep(st));

    const wf = builder.build();
    manager.createWorkflow(wf);
    refreshState();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Visual Workflow Builder</h3>
              <p className="text-xs text-slate-500 font-medium">Compose ordered workflow step pipelines and triggers</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Workflow Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Automated Keyword Rank Audit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                <option value="SEO">SEO</option>
                <option value="Security">Security</option>
                <option value="Reports">Reports</option>
                <option value="Content">Content</option>
                <option value="Analytics">Analytics</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Trigger Event</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value as WorkflowTrigger)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                <option value="Manual">Manual Execution</option>
                <option value="Website Scan Completed">Website Scan Completed</option>
                <option value="Memory Updated">Memory Updated</option>
                <option value="Daily Schedule">Daily Schedule</option>
                <option value="Hourly Schedule">Hourly Schedule</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as WorkflowPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Describe workflow mission objective..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none resize-none"
            ></textarea>
          </div>

          {/* Steps Visual Canvas */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900">Configured Pipeline Steps ({steps.length})</h4>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((st, idx) => (
                <div key={st.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">Step {idx + 1}: {st.name}</span>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 font-bold">Action:</span> {st.action}
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold">Assigned Agent:</span> {st.assignedAgent}
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex justify-center pt-1">
                      <ArrowDown className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              Save Workflow Blueprint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
