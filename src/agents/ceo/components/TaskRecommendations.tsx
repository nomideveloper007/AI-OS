import React, { useState } from 'react';
import { CEOTaskRecommendation } from '../CEOContext';
import { ApprovalManager } from '../../../workflow/approval/ApprovalManager';
import { useApp } from '../../../context/AppContext';
import { CheckSquare, ShieldCheck, ArrowUpRight, Bot, Check, Play } from 'lucide-react';

interface TaskRecommendationsProps {
  tasks: CEOTaskRecommendation[];
}

export const TaskRecommendations: React.FC<TaskRecommendationsProps> = ({ tasks: initialTasks }) => {
  const { showToast, setActiveTab } = useApp();
  const approvalManager = ApprovalManager.getInstance();
  const [tasks, setTasks] = useState(initialTasks);

  const handleApprove = (taskId: string, title: string, agent: string) => {
    // Approve matching request in ApprovalManager
    const pendingReqs = approvalManager.getPendingRequests();
    const match = pendingReqs.find((r) => r.stepName === title || r.id.includes(taskId));
    if (match) {
      approvalManager.approve(match.id, 'Administrator', 'Approved directly from CEO Dashboard.');
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'Approved' } : t))
    );

    showToast(`Task Approved! Handed over to ${agent} for execution.`);
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">CEO Task Recommendations</h3>
          <p className="text-slate-500 font-medium mt-0.5">
            Tasks are safe recommendations requiring Admin sign-off. Click <strong>Approve & Execute</strong> to send to AI Employees.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('approvals')}
          className="px-3.5 py-2 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-extrabold text-xs hover:bg-indigo-50 cursor-pointer shadow-2xs flex items-center gap-1.5 whitespace-nowrap self-start sm:self-auto"
        >
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          View Approvals Queue ({approvalManager.getPendingRequests().length})
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const matchingReq = approvalManager.getAllRequests().find(
            (r) => r.id.includes(task.id) || r.stepName === task.title
          );
          const isApproved = task.status === 'Approved' || (matchingReq && matchingReq.status === 'Approved');
          return (
            <div key={task.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{task.title}</span>
                  <span className={`px-2.5 py-0.5 rounded font-extrabold text-[10px] ${
                    isApproved
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {isApproved ? 'Approved & Queued' : task.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-indigo-50 text-indigo-700">
                    {task.category}
                  </span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700">
                    {task.priority} Priority
                  </span>
                </div>
              </div>

              <p className="text-slate-600 font-medium">{task.description}</p>

              <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] font-semibold text-slate-500">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-slate-800 font-bold">
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                    Assigned Employee: {task.suggestedAgent}
                  </span>
                  <span>Impact: <strong className="text-slate-900">{task.estimatedImpact}</strong></span>
                  <span>Difficulty: <strong className="text-slate-900">{task.estimatedDifficulty}</strong></span>
                </div>

                {isApproved ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-lg flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Executing in Workflow Queue
                  </span>
                ) : (
                  <button
                    onClick={() => handleApprove(task.id, task.title, task.suggestedAgent)}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs self-end sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Approve & Execute Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
