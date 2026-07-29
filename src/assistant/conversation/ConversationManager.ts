import { ConversationMessage } from '../types';
import { AssistantSession } from '../core/AssistantSession';
import { MemoryManager } from '../../memory/core/MemoryManager';
import { AssistantLogger } from '../core/AssistantLogger';

export class ConversationManager {
  private static instance: ConversationManager;
  private session = AssistantSession.getInstance();
  private logger = AssistantLogger.getInstance();

  private constructor() {}

  public static getInstance(): ConversationManager {
    if (!ConversationManager.instance) {
      ConversationManager.instance = new ConversationManager();
    }
    return ConversationManager.instance;
  }

  public addMessage(role: 'user' | 'assistant' | 'system', content: string): ConversationMessage {
    const msg = this.session.addMessage(role, content);
    
    // Save to the existing AI OS Memory System on each assistant reply
    if (role === 'assistant') {
      try {
        MemoryManager.getInstance().createMemoryItem({
          title: `Saira Voice interaction: ${content.substring(0, 40)}...`,
          description: `User interaction transcript saved to AI OS memory.`,
          content: `User prompt: "${this.getLastUserMessage()}"\nSaira reply: "${content}"`,
          type: 'User Memory',
          category: 'Business',
          priority: 'Low',
          tags: ['Saira', 'Voice Assistant', 'Chat Logs']
        });
        this.logger.info('Saved conversation turn to AI OS Memory system', 'ConversationManager');
      } catch (err) {
        this.logger.error('Failed to save chat log to AI OS Memory system', err, 'ConversationManager');
      }
    }
    return msg;
  }

  public getMessages(): ConversationMessage[] {
    return this.session.getMessages();
  }

  public getLastUserMessage(): string {
    const msgs = this.getMessages();
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') return msgs[i].content;
    }
    return '';
  }

  /** Recent turns handed to the LLM so Saira keeps the thread instead of re-greeting. */
  public getRecentHistory(limit = 8): ConversationMessage[] {
    return this.getMessages()
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-limit);
  }

  /**
   * Auto-detects if the spoken language is Urdu, Roman Urdu, or English.
   */
  public detectLanguage(text: string): 'en-US' | 'ur-PK' {
    // Check Urdu Arabic characters
    const hasUrduScript = /[\u0600-\u06FF]/.test(text);
    if (hasUrduScript) return 'ur-PK';

    const tokens = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean);

    if (tokens.length === 0) return 'en-US';

    const urduScore = tokens.filter((token) => ROMAN_URDU_KEYWORDS.has(token)).length;

    // A single unmistakable marker is enough on short utterances ("kia kr rahi ho"),
    // longer sentences need roughly a fifth of the words to look Roman Urdu.
    if (tokens.length <= 4 ? urduScore >= 1 : urduScore / tokens.length >= 0.2) {
      return 'ur-PK';
    }

    return 'en-US';
  }
}

const ROMAN_URDU_KEYWORDS = new Set([
  'aap', 'ap', 'aaj', 'aj', 'acha', 'achha', 'assalam', 'salam', 'batao', 'bata', 'btao',
  'bohat', 'bahut', 'bht', 'chal', 'chahiye', 'dikhao', 'dekho', 'dhoondo',
  'gi', 'ga', 'haan', 'han', 'hai', 'hain', 'hay', 'ho', 'hoon', 'hun', 'hy', 'jee', 'ji',
  'kaam', 'kam', 'kaise', 'kaisay', 'kese', 'kesa', 'kaisa', 'kahan', 'kab', 'kyun', 'kyu',
  'kia', 'kya', 'kar', 'karo', 'kro', 'kr', 'karna', 'krna', 'karni', 'karunga', 'karungi',
  'kuch', 'lekin', 'mai', 'main', 'mein', 'mera', 'meri', 'mujhe', 'mujy', 'nahi', 'nai',
  'nhi', 'phir', 'raha', 'rahi', 'rha', 'rhi', 'rahe', 'sab', 'shukriya', 'sunao', 'sunayen',
  'sunaein', 'theek', 'thek', 'thk', 'tum', 'tumhara', 'wala', 'wali', 'ye', 'yeh', 'zara',
  'maaf', 'madad', 'banao', 'bnao', 'bana', 'chahta', 'chahti', 'sakta', 'sakti', 'hota',
  'hoti', 'wapas', 'abhi', 'jaldi', 'kholo', 'khol', 'band', 'karke', 'krke'
]);
