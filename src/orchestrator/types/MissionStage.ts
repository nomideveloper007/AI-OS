export type MissionStageId =
  | "website_added"
  | "scanning"
  | "website_intelligence"
  | "ceo_planning"
  | "task_creation"
  | "collaboration"
  | "execution"
  | "aggregation"
  | "memory_update"
  | "report_generation"
  | "completed";

export const MISSION_STAGE_ORDER: MissionStageId[] = [
  "website_added",
  "scanning",
  "website_intelligence",
  "ceo_planning",
  "task_creation",
  "collaboration",
  "execution",
  "aggregation",
  "memory_update",
  "report_generation",
  "completed",
];

export const MISSION_STAGE_LABELS: Record<MissionStageId, string> = {
  website_added: "Website Added",
  scanning: "Scanning",
  website_intelligence: "Website Intelligence",
  ceo_planning: "CEO Planning",
  task_creation: "Task Creation",
  collaboration: "Collaboration",
  execution: "Execution",
  aggregation: "Aggregation",
  memory_update: "Memory Update",
  report_generation: "Report Generation",
  completed: "Completed",
};
