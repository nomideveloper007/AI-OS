import { MemoryItem } from '../types/Memory';

export class MemoryValidator {
  public static validateMemory(item: Partial<MemoryItem>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!item.title || item.title.trim().length === 0) {
      errors.push('Memory title is required.');
    }
    if (!item.type) {
      errors.push('Memory type must be specified.');
    }
    if (!item.category) {
      errors.push('Knowledge category must be specified.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
