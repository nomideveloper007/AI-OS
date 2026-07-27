export class TokenCounter {
  /**
   * Simple character & word ratio token estimator (~4 chars per token for English text)
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    const cleanText = text.trim();
    if (cleanText.length === 0) return 0;

    // Approx 4 characters per token calculation
    const charEstimate = Math.ceil(cleanText.length / 4);
    
    // Word based check (~0.75 words per token)
    const words = cleanText.split(/\s+/).length;
    const wordEstimate = Math.ceil(words * 1.3);

    return Math.max(charEstimate, wordEstimate);
  }

  public static estimateMessageTokens(messages: Array<{ role: string; content: string }>): number {
    let total = 0;
    for (const msg of messages) {
      total += 4; // overhead per message
      total += TokenCounter.estimateTokens(msg.content);
    }
    return total + 2; // base overhead
  }
}
