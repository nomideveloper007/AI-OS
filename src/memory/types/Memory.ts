import { KnowledgeCategory } from './MemoryCategory';
import { MemoryPriority } from './MemoryPriority';
import { MemoryVisibility } from './MemoryVisibility';

export type MemoryType = 
  | 'Website Memory' 
  | 'Project Memory' 
  | 'Global Memory' 
  | 'Agent Memory' 
  | 'User Memory' 
  | 'Temporary Memory' 
  | 'Long Term Memory';

export interface MemoryTimelineEntry {
  id: string;
  event: string;
  details: string;
  timestamp: string;
}

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: MemoryType;
  category: KnowledgeCategory;
  priority: MemoryPriority;
  tags: string[];
  source: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  visibility: MemoryVisibility;
  status: 'Active' | 'Archived' | 'Draft';
  isPinned?: boolean;
  timeline: MemoryTimelineEntry[];
}
