import { AIEngine } from '../../ai/core/AIEngine';
import { AssistantEvents } from '../core/AssistantEvents';
import { AssistantLogger } from '../core/AssistantLogger';
import { AssistantContext } from '../core/AssistantContext';
import { CEOAgent } from '../../agents/ceo/CEOAgent';
import { TaskEngine } from '../../task-engine/core/TaskEngine';
import { ProjectKnowledgeEngine } from '../../project-knowledge/core/ProjectKnowledgeEngine';
import { ConversationMessage } from '../types';

export class AssistantRouter {
  private static instance: AssistantRouter;
  private logger = AssistantLogger.getInstance();
  private events = AssistantEvents.getInstance();
  private assistantContext = AssistantContext.getInstance();

  private constructor() {}

  public static getInstance(): AssistantRouter {
    if (!AssistantRouter.instance) {
      AssistantRouter.instance = new AssistantRouter();
    }
    return AssistantRouter.instance;
  }

  public async routeQuery(
    query: string,
    isUrdu: boolean,
    history: ConversationMessage[] = []
  ): Promise<string> {
    const qLower = query.toLowerCase().trim();
    this.logger.info(`Routing user query: "${query}"`, 'AssistantRouter');

    // 1. Direct Regex / Keyword Command Matching
    
    // Open Dashboard / Navigation commands
    if (qLower.includes('open dashboard') || qLower.includes('dashboard kholo')) {
      this.events.emit('navigate', 'dashboard');
      return isUrdu 
        ? 'Ji, main dashboard khol rahi hoon. ||| جی، میں ڈیش بورڈ کھول رہی ہوں۔' 
        : 'Opening your dashboard now.';
    }

    if (qLower.includes('open memory') || qLower.includes('memory kholo')) {
      this.events.emit('navigate', 'memory');
      return isUrdu 
        ? 'Ji, main memory module open kar rahi hoon. ||| جی، میں میموری ماڈیول اوپن کر رہی ہوں۔' 
        : 'Opening the Memory System interface.';
    }

    if (qLower.includes('open reports') || qLower.includes('show today\'s reports') || qLower.includes('reports dikhao')) {
      this.events.emit('navigate', 'reports');
      return isUrdu 
        ? 'Reports tab open kar rahi hoon. ||| رپورٹ ٹیب اوپن کر رہی ہوں۔' 
        : 'Displaying today\'s strategic reports.';
    }

    if (qLower.includes('open github') || qLower.includes('repo explorer kholo') || qLower.includes('open repository')) {
      this.events.emit('navigate', 'github');
      return isUrdu 
        ? 'GitHub Repository Explorer open kar rahi hoon. ||| گٹ ہب ریپوزٹری ایکسپلورر اوپن کر رہی ہوں۔' 
        : 'Navigating to the Repository Explorer.';
    }

    if (qLower.includes('open task engine') || qLower.includes('tasks board kholo')) {
      this.events.emit('navigate', 'task_engine');
      return isUrdu 
        ? 'Ji, active tasks board open kar rahi hoon. ||| جی، ایکٹیو ٹاسکس بورڈ اوپن کر رہی ہوں۔' 
        : 'Opening Task Engine Kanban board.';
    }

    // Run CEO Strategic Analysis
    if (qLower.includes('run ceo analysis') || qLower.includes('run strategic planning') || qLower.includes('ceo analysis run kro')) {
      this.events.emit('navigate', 'ceo');
      const ctx = await this.assistantContext.harvestContext();
      const domain = ctx.activeWebsite?.domain || 'tasktomoney.com';
      // Trigger background CEO analysis asynchronously
      setTimeout(() => {
        CEOAgent.getInstance().runExecutiveAnalysis(domain).catch((err) => {
          this.logger.error('Failed CEO strategic run', err);
        });
      }, 500);
      return isUrdu 
        ? `CEO strategic analysis ${domain} ke liye shuru ho rahi hai. ||| سی ای او اسٹرٹیجک انیلیسس شروع ہو رہی ہے۔` 
        : `Launching the CEO strategic analysis workflow for ${domain} now.`;
    }

    // Run SEO Optimization Scan
    if (qLower.includes('run seo') || qLower.includes('improve seo') || qLower.includes('seo run kro')) {
      this.events.emit('navigate', 'task_engine');
      const ctx = await this.assistantContext.harvestContext();
      const domain = ctx.activeWebsite?.domain || 'tasktomoney.com';
      
      // Seed a background SEO Audit Task inside the TaskEngine Facade
      setTimeout(() => {
        TaskEngine.getInstance().createTask({
          title: `SEO Audit Scan for ${domain}`,
          description: `Analyze header structures, sitemaps, meta data coverage, and image ALT attributes.`,
          category: 'SEO',
          priority: 'high',
          websiteDomain: domain,
          websiteId: ctx.activeWebsite?.id || undefined,
          assignedAgentId: 'agent-seo-01'
        });
      }, 500);

      return isUrdu 
        ? `CEO strategic objectives ke mutabik SEO Agent ke liye naya audit task queue me daal diya hai. ||| ایس ای او ایجنٹ کے لئے نیا آڈٹ ٹاسک کیو میں ڈال دیا ہے۔` 
        : `Routing SEO request to SEO Agent. Created a high-priority SEO Audit Task for ${domain} in the Task Engine.`;
    }

    // Find File / Component in Project Knowledge
    if (qLower.startsWith('find ') || qLower.startsWith('search ') || qLower.includes('dhoondo') || qLower.includes('kahan hy')) {
      const searchTerm = qLower.replace(/^(find|search)\s+/i, '').replace(/\s+(dhoondo|kahan hy).*$/i, '').trim();
      const ctx = await this.assistantContext.harvestContext();
      const repoId = ctx.activeWebsite?.name || 'default-repo';
      const searchResults = ProjectKnowledgeEngine.getInstance().searchKnowledge(repoId, searchTerm);

      if (searchResults && searchResults.length > 0) {
        const topResult = searchResults[0];
        return isUrdu
          ? `Mujhe aapke project me "${topResult.name}" mila hai, iska path ye hai: ${topResult.filePath} ||| مجھے آپ کے پروجیکٹ میں مل گیا ہے، اس کا پاتھ یہ ہے۔`
          : `I found "${topResult.name}" (${topResult.type}) located at: ${topResult.filePath}`;
      } else {
        return isUrdu
          ? `Maaf kijiyega, mujhe code base me "${searchTerm}" ke mutabik kuch nahi mila. ||| معاف کیجئے گا، مجھے کوڈ بیس میں کچھ نہیں ملا۔`
          : `Sorry, I couldn't find any file or component matching "${searchTerm}" in the Project Knowledge repository.`;
      }
    }

    // Pause / Stop / Control commands
    if (qLower.includes('pause agent') || qLower.includes('stop agent')) {
      return isUrdu 
        ? 'Agent operations pause kar di hain. ||| ایجنٹ آپریشن پاز کر دیئے گئے ہیں۔' 
        : 'Requested agents have been set to Paused state.';
    }

    // 2. Fall back to LLM Semantic Routing with Live Context
    const systemContext = await this.assistantContext.harvestContext();
    
    try {
      let accumulatedContent = '';
      this.events.emit('saira_stream_start');
      await AIEngine.getInstance().stream({
        modelId: 'auto/best-chat',
        messages: [
          {
            id: `msg-${Date.now()}-sys`,
            timestamp: new Date().toISOString(),
            role: 'system',
            content: this.buildSystemPrompt(isUrdu, systemContext)
          },
          ...history.map((m, index) => ({
            id: `msg-${Date.now()}-h${index}`,
            timestamp: m.timestamp,
            role: m.role as 'user' | 'assistant',
            content: m.content
          })),
          {
            id: `msg-${Date.now()}-usr`,
            timestamp: new Date().toISOString(),
            role: 'user' as const,
            content: query
          }
        ],
        temperature: 0.5,
        maxTokens: 220,
        metadata: { taskType: 'general_chat' }
      }, (chunk) => {
        if (chunk.delta?.content) {
          accumulatedContent += chunk.delta.content;
          this.events.emit('saira_stream_chunk', chunk.delta.content);
        }
      });

      const replyText = this.polishReply(
        accumulatedContent.trim() || 'I didn\'t catch that. Can you repeat?',
        isUrdu
      );

      // If Saira wants to assign a task
      if (replyText.startsWith('[ASSIGN_TASK]:')) {
        const titleMatch = replyText.match(/title="([^"]+)"/);
        const assigneeMatch = replyText.match(/assignee="([^"]+)"/);
        const explanationMatch = replyText.match(/explanation="([^"]+)"/);

        const title = titleMatch ? titleMatch[1] : 'New Task';
        const assigneeName = assigneeMatch ? assigneeMatch[1] : 'SEO Agent';
        const explanation = explanationMatch ? explanationMatch[1] : 'Task assigned.';

        const agentId = this.resolveAgentId(assigneeName);
        const ctx = await this.assistantContext.harvestContext();

        setTimeout(() => {
          TaskEngine.getInstance().createTask({
            title,
            description: `Assigned by Saira Voice Assistant to ${assigneeName}.`,
            priority: 'medium',
            category: 'General',
            websiteDomain: ctx.activeWebsite?.domain || 'tasktomoney.com',
            websiteId: ctx.activeWebsite?.id || undefined,
            assignedAgentId: agentId
          });
        }, 500);

        return explanation;
      }

      return replyText;
    } catch (err) {
      this.logger.error('Failed LLM routing fallback', err);
      return isUrdu 
        ? 'Maaf kijiyega, system me error hai. ||| معاف کیجئے گا، سسٹم میں ایرر ہے۔' 
        : 'Sorry, I encountered an issue accessing the AI engine.';
    }
  }

  /**
   * Smaller models routinely ignore the persona instructions, so the parts that
   * users notice most - markdown noise and Saira speaking about herself in the
   * masculine - are corrected here instead of being left to the prompt.
   */
  private polishReply(reply: string, isUrdu: boolean): string {
    let text = reply
      .replace(/^\s*(saira|assistant|response|jawab)\s*:\s*/i, '')
      .replace(/\*\*/g, '')
      .replace(/^[-*]\s+/gm, '')
      .trim();

    if (isUrdu) {
      text = this.enforceFeminineVoice(text);
    }

    return text;
  }

  private enforceFeminineVoice(text: string): string {
    return (
      text
        // Roman Urdu: "kar raha hoon" -> "kar rahi hoon", "sakta hoon" -> "sakti hoon"
        .replace(/\b([a-z]+)ha (hoon|hun|hoo)\b/gi, '$1hi $2')
        .replace(/\b([a-z]+)ta (hoon|hun|hoo)\b/gi, '$1ti $2')
        .replace(/\b([a-z]+)unga\b/gi, '$1ungi')
        // Urdu script equivalents
        .replace(/رہا ہوں/g, 'رہی ہوں')
        .replace(/رہا ہُوں/g, 'رہی ہُوں')
        .replace(/سکتا ہوں/g, 'سکتی ہوں')
        .replace(/کرتا ہوں/g, 'کرتی ہوں')
        .replace(/چاہتا ہوں/g, 'چاہتی ہوں')
        .replace(/دیکھتا ہوں/g, 'دیکھتی ہوں')
        .replace(/ہوں گا/g, 'ہوں گی')
        .replace(/وں گا/g, 'وں گی')
    );
  }

  private buildSystemPrompt(isUrdu: boolean, systemContext: any): string {
    const languageRules = isUrdu
      ? `The user is speaking Urdu or Roman Urdu, so you MUST answer in Urdu:
         - Left of "|||": clean Roman Urdu written with English letters, the way Pakistanis chat (e.g., "Main aaj aapki websites monitor kar rahi hoon").
         - Right of "|||": the SAME sentence in pure Urdu script with Arabic characters (e.g., "میں آج آپ کی ویب سائٹس مانیٹر کر رہی ہوں۔").
         - The right side is mandatory and must never be empty, never Roman letters, and never a translation into a different meaning.
         - Never answer an Urdu question in English.`
      : `The user is speaking English, so answer in natural English on both sides of "|||" with the same sentence repeated.`;

    return `You are Saira, the female personal assistant of AI OS. You are having a live spoken conversation with the user.

      OUTPUT FORMAT (mandatory, every single reply):
      "Bubble text ||| Speech text"
      - Left of "|||": the text shown in the chat bubble.
      - Right of "|||": the text that the speech synthesizer will read out loud.
      - Output exactly one "|||" separator. Never omit it. Never add labels, quotes or prefixes around your reply.

      LANGUAGE RULES:
      ${languageRules}

      GRAMMAR:
      - You are female. Always use feminine Urdu verb forms: "kar rahi hoon", "karungi", "kar sakti hoon", "rahi hoon". Never "kar raha hoon" or "karunga".
      - Address the user politely with "aap".

      CONVERSATION RULES:
      1. Reply in 1 to 2 short sentences. This is speech, not an article.
      2. The previous turns of this conversation are provided to you. Continue the conversation and answer the newest message. Never repeat an earlier reply and never greet the user again after the first greeting.
      3. Never reply with only emojis and use at most one emoji.
      4. Never use markdown, asterisks, headings, bullet points or numbered lists.
      5. If you do not understand the user, ask one short clarifying question.

      LIVE OS STATE (use these real numbers when the user asks what you are doing):
      - Connected websites: ${systemContext.websitesCount} (active domain: ${systemContext.activeWebsite?.domain || 'None connected'})
      - Active tasks: ${systemContext.tasks.active}
      - Pending approvals: ${systemContext.tasks.waitingApproval}
      - Running agents: ${systemContext.runningAgents.join(', ') || 'None'}
      - Running workflows: ${systemContext.runningWorkflows.join(', ') || 'None'}

      EXAMPLES:
      User: "aj kia kro gi"
      You: "Aaj main aapki connected websites aur system tasks monitor karungi. Koi khaas kaam karwana hai? ||| آج میں آپ کی کنیکٹڈ ویب سائٹس اور سسٹم ٹاسکس مانیٹر کروں گی۔ کوئی خاص کام کروانا ہے؟"

      User: "kia kr rahi ho"
      You: "Filhaal main aapke tasks aur agents ka status dekh rahi hoon. Aap bataayein, kya karna hai? ||| فی الحال میں آپ کے ٹاسکس اور ایجنٹس کا اسٹیٹس دیکھ رہی ہوں۔ آپ بتائیں، کیا کرنا ہے؟"

      User: "how many websites are connected?"
      You: "You currently have ${systemContext.websitesCount} websites connected. ||| You currently have ${systemContext.websitesCount} websites connected."

      TASK ASSIGNMENT:
      If the user asks you to assign work to a specialist agent (e.g., "Assign SEO audit task to SEO Agent" or "Developer Agent ko task assign kro"), output this tag instead of a normal reply:
      "[ASSIGN_TASK]: title=\\"[Task Title]\\", assignee=\\"[Agent Name]\\", explanation=\\"[Bubble text ||| Speech text]\\""
      Example: "[ASSIGN_TASK]: title=\\"Vulnerability scan\\", assignee=\\"SEO Agent\\", explanation=\\"Ji, main ne SEO Agent ko security scan task assign kar diya hai. ||| جی، میں نے ایس ای او ایجنٹ کو سیکیورٹی اسکین ٹاسک اسائن کر دیا ہے۔\\""

      Tone: warm, professional and concise.`;
  }

  private resolveAgentId(name: string): string {
    const nLower = name.toLowerCase();
    if (nLower.includes('seo')) return 'agent-seo-01';
    if (nLower.includes('project manager') || nLower.includes('pm') || nLower.includes('manager')) return 'agent-pm-01';
    if (nLower.includes('ceo')) return 'agent-ceo-01';
    if (nLower.includes('website') || nLower.includes('web')) return 'agent-web-01';
    if (nLower.includes('growth')) return 'agent-growth-01';
    return 'agent-pm-01';
  }
}
