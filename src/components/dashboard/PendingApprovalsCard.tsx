import React from "react";
import { useApp } from "../../context/AppContext";
import { FileCode, FileText, Globe, Image } from "lucide-react";

export const PendingApprovalsCard: React.FC = () => {
  const { approvals, approveItem, rejectItem, setActiveTab } = useApp();

  const getItemIcon = (title: string) => {
    if (title.toLowerCase().includes("title"))
      return <FileCode className="w-4 h-4 text-rose-500" />;
    if (
      title.toLowerCase().includes("post") ||
      title.toLowerCase().includes("blog")
    )
      return <FileText className="w-4 h-4 text-indigo-500" />;
    if (title.toLowerCase().includes("page"))
      return <Globe className="w-4 h-4 text-blue-500" />;
    return <Image className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base">
          Pending Approvals
        </h3>
        <button
          onClick={() => setActiveTab("approvals")}
          className="text-xs font-bold text-[#4F46E5] hover:underline px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {/* Approvals List */}
      <div className="space-y-2">
        {approvals.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-medium">
            No pending approvals. All agent actions are up to date!
          </div>
        ) : (
          approvals.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
                  {getItemIcon(item.title)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 truncate">
                    {item.agentName}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => approveItem(item.id)}
                  className="px-3 py-1 rounded-lg border border-emerald-200 bg-[#ECFDF5] hover:bg-emerald-100 text-[#059669] font-bold text-xs transition-colors cursor-pointer"
                >
                  Approve
                </button>
                <button
                  onClick={() => rejectItem(item.id)}
                  className="px-3 py-1 rounded-lg border border-rose-200 bg-[#FEF2F2] hover:bg-rose-100 text-[#DC2626] font-bold text-xs transition-colors cursor-pointer"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
