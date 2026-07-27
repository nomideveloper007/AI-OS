import { KnowledgeCategory } from './MemoryCategory';

export interface KnowledgeArticle {
  id: string;
  title: string;
  summary: string;
  category: KnowledgeCategory;
  tags: string[];
  sourceUrl?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  readCount: number;
}
