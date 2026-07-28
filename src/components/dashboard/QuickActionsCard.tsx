import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  PlusSquare,
  UserPlus,
  FileText,
  TrendingUp,
  Settings,
} from "lucide-react";

export const QuickActionsCard: React.FC = () => {
  const { setIsAddAgentOpen, setIsCreateTaskOpen, setActiveTab, showToast } =
    useApp();

  const handleScanWebsite = () => {
    showToast("Initiated deep website scan for tasktomoney.com...");
  };

  const handleGenerateReport = () => {
    setActiveTab("reports");
    showToast("Generating AI OS executive summary report...");
  };

  const actions = [
    {
      title: "Scan Website",
      icon: Search,
      action: handleScanWebsite,
      color: "text-[#2563EB]",
    },
    {
      title: "Create New Task",
      icon: PlusSquare,
      action: () => setIsCreateTaskOpen(true),
      color: "text-[#4F46E5]",
    },
    {
      title: "Add New Agent",
      icon: UserPlus,
      action: () => setIsAddAgentOpen(true),
      color: "text-[#2563EB]",
    },
    {
      title: "Generate Report",
      icon: FileText,
      action: handleGenerateReport,
      color: "text-[#7C3AED]",
    },
    {
      title: "View Analytics",
      icon: TrendingUp,
      action: () => setActiveTab("reports"),
      color: "text-[#4F46E5]",
    },
    {
      title: "Settings",
      icon: Settings,
      action: () => setActiveTab("settings"),
      color: "text-[#4F46E5]",
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-base">
          Quick Actions
        </h3>
      </div>

      {/* Grid of 6 Action Cards */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((act, i) => {
          const Icon = act.icon;
          return (
            <button
              key={i}
              onClick={act.action}
              className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 text-left transition-all border border-slate-100 group cursor-pointer"
            >
              <Icon
                className={`w-4 h-4 ${act.color} flex-shrink-0 group-hover:scale-110 transition-transform`}
              />
              <span className="text-xs font-bold text-slate-900 truncate">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
