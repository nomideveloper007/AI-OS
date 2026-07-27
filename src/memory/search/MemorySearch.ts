import { MemoryItem } from '../types/Memory';
import { KnowledgeCategory } from '../types/MemoryCategory';
import { MemoryPriority } from '../types/MemoryPriority';

export interface MemorySearchFilter {
  query?: string;
  tag?: string;
  category?: KnowledgeCategory | 'all';
  website?: string | 'all';
  priority?: MemoryPriority | 'all';
  dateFrom?: string;
  dateTo?: string;
  pinnedOnly?: boolean;
}

export class MemorySearch {
  public static filterMemories(memories: MemoryItem[], filter: MemorySearchFilter = {}): MemoryItem[] {
    return memories.filter((m) => {
      // Query match (title, description, tags, website, source)
      if (filter.query && filter.query.trim().length > 0) {
        const q = filter.query.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        const matchesTags = m.tags.some((t) => t.toLowerCase().includes(q));
        const matchesWeb = m.website ? m.website.toLowerCase().includes(q) : false;
        const matchesSource = m.source.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesTags && !matchesWeb && !matchesSource) {
          return false;
        }
      }

      // Tag filter
      if (filter.tag && filter.tag !== 'all') {
        if (!m.tags.includes(filter.tag)) return false;
      }

      // Category filter
      if (filter.category && filter.category !== 'all') {
        if (m.category !== filter.category) return false;
      }

      // Website filter
      if (filter.website && filter.website !== 'all') {
        if (m.website !== filter.website) return false;
      }

      // Priority filter
      if (filter.priority && filter.priority !== 'all') {
        if (m.priority !== filter.priority) return false;
      }

      // Pinned filter
      if (filter.pinnedOnly && !m.isPinned) return false;

      // Date range filter
      if (filter.dateFrom) {
        if (new Date(m.createdAt) < new Date(filter.dateFrom)) return false;
      }
      if (filter.dateTo) {
        if (new Date(m.createdAt) > new Date(filter.dateTo)) return false;
      }

      return true;
    });
  }
}
