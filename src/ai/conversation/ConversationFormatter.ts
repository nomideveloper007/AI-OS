import { AIChatMessage } from '../core/types';

export class ConversationFormatter {
  public static toMarkdown(messages: AIChatMessage[]): string {
    return messages
      .map((msg) => {
        const roleName = msg.role.toUpperCase();
        return `### **${roleName}** (${msg.timestamp})\n${msg.content}\n`;
      })
      .join('\n---\n\n');
  }

  public static toJSON(messages: AIChatMessage[]): string {
    return JSON.stringify(messages, null, 2);
  }
}
