import { useState, useEffect } from 'react';
import { MemoryManager } from '../core/MemoryManager';
import { MemoryEngine } from '../core/MemoryEngine';
import { MemoryItem, MemoryType } from '../types/Memory';
import { KnowledgeArticle } from '../types/Knowledge';
import { MemorySearchFilter } from '../search/MemorySearch';

export function useMemory() {
  const [manager] = useState(() => MemoryManager.getInstance());
  const [engine] = useState(() => MemoryEngine.getInstance());
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);

  const refreshMemoryState = () => {
    setMemories([...manager.getMemories()]);
    setArticles([...manager.getKnowledgeArticles()]);
  };

  useEffect(() => {
    refreshMemoryState();
  }, [manager]);

  const searchMemories = (filter: MemorySearchFilter) => {
    return engine.searchMemories(filter);
  };

  const createMemory = (params: any) => {
    const item = manager.createMemoryItem(params);
    refreshMemoryState();
    return item;
  };

  const togglePin = (id: string) => {
    const res = manager.togglePin(id);
    refreshMemoryState();
    return res;
  };

  const deleteMemory = (id: string) => {
    const res = manager.deleteMemory(id);
    refreshMemoryState();
    return res;
  };

  return {
    memories,
    articles,
    manager,
    searchMemories,
    createMemory,
    togglePin,
    deleteMemory,
    refreshMemoryState
  };
}
