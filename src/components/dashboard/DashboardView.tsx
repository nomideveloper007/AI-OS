import React from "react";
import { StatusCardRow } from "./StatusCard";
import { WebsiteHealthCard } from "./WebsiteHealthCard";
import { TrafficOverviewCard } from "./TrafficOverviewCard";
import { AiActivityCard } from "./AiActivityCard";
import { RecentTasksCard } from "./RecentTasksCard";
import { PendingApprovalsCard } from "./PendingApprovalsCard";
import { QuickActionsCard } from "./QuickActionsCard";

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <StatusCardRow />

      {/* Middle Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <WebsiteHealthCard />
        <TrafficOverviewCard />
        <AiActivityCard />
      </div>

      {/* Bottom Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <RecentTasksCard />
        <PendingApprovalsCard />
        <QuickActionsCard />
      </div>
    </div>
  );
};
