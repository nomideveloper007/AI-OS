import { AssistantLogger } from './AssistantLogger';
import { AssistantEvents } from './AssistantEvents';
import { AssistantManager } from './AssistantManager';
import { AssistantState } from './AssistantState';
import { AssistantSession } from './AssistantSession';
import { AssistantContext } from './AssistantContext';
import { ConversationManager } from '../conversation/ConversationManager';
import { AssistantRouter } from '../router/AssistantRouter';
import { SpeechService } from '../services/SpeechService';
import { WakeWordListener } from '../services/WakeWordListener';
import { CEOEvents } from '../../agents/ceo/CEOEvents';
import { TaskEvents } from '../../task-engine/core/TaskEvents';
import { WorkflowEvents } from '../../workflow/core/WorkflowEvents';
import { AssistantLanguage } from '../types';

export class SairaAssistant {
  private static instance: SairaAssistant;
  private logger = AssistantLogger.getInstance();
  private events = AssistantEvents.getInstance();
  private manager = AssistantManager.getInstance();
  private state = AssistantState.getInstance();
  private session = AssistantSession.getInstance();
  private assistantContext = AssistantContext.getInstance();
  private conversation = ConversationManager.getInstance();
  private router = AssistantRouter.getInstance();
  private speech = SpeechService.getInstance();
  private wakeWord = WakeWordListener.getInstance();

  private unsubscribeFunctions: (() => void)[] = [];
  private isInitialized = false;
  private isProcessing = false;
  private sessionActive = false;
  private lastInputText = '';
  private lastInputAt = 0;

  private constructor() {
    this.setupListeners();
  }

  public static getInstance(): SairaAssistant {
    if (!SairaAssistant.instance) {
      SairaAssistant.instance = new SairaAssistant();
    }
    return SairaAssistant.instance;
  }

  public initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    this.logger.info('Initializing Saira Voice Assistant layer...', 'SairaAssistant');
    const settings = this.manager.getSettings();
    this.speech.setConfig(settings.voiceVolume, settings.voiceSpeed);
    this.setupBackgroundSubscribers();

    if (settings.alwaysListeningMode) {
      this.wakeWord.startListening();
    }
  }

  public shutdown() {
    this.isInitialized = false;
    this.sessionActive = false;
    this.wakeWord.stopListening();
    this.speech.stopListening();
    this.speech.cancelPlayback();
    this.unsubscribeFunctions.forEach((unsub) => unsub());
    this.unsubscribeFunctions = [];
  }

  private setupListeners() {
    // Wake Word detected
    this.events.on('wakeword_detected', () => {
      if (this.sessionActive || this.isProcessing) return;
      this.logger.info('Wake word event caught in SairaAssistant core', 'SairaAssistant');
      this.events.emit('assistant_triggered'); // triggers UI pop up
      this.startVoiceSession(true);
    });

    this.speech.onSpeechResult = (text: string) => {
      this.handleUserInput(text, 'voice');
    };

    this.speech.onSpeechStart = () => {
      this.logger.debug('User started speaking', 'SairaAssistant');
    };

    this.speech.onSpeechEnd = () => {
      this.logger.debug('User stopped speaking', 'SairaAssistant');
    };
  }

  /**
   * The single entry point for every user turn, spoken or typed. Keeping one
   * pipeline is what guarantees exactly one transcript entry and one playback
   * per turn.
   */
  public async handleUserInput(text: string, source: 'voice' | 'text' = 'text') {
    const input = text.trim();
    if (!input) return;

    const now = Date.now();

    if (this.isProcessing) {
      this.logger.warn(`Dropped "${input}" because a reply is already in progress`, 'SairaAssistant');
      return;
    }

    if (input.toLowerCase() === this.lastInputText && now - this.lastInputAt < 3000) {
      this.logger.warn(`Dropped repeated input "${input}"`, 'SairaAssistant');
      return;
    }

    this.isProcessing = true;
    this.lastInputText = input.toLowerCase();
    this.lastInputAt = now;

    const settings = this.manager.getSettings();

    try {
      this.logger.info(`User input (${source}): "${input}"`, 'SairaAssistant');

      // Stop playback and the mic first so Saira never hears her own voice.
      this.speech.cancelPlayback(false);
      this.state.setState('thinking');
      this.speech.pauseListening();

      const history = this.conversation.getRecentHistory(8);
      this.conversation.addMessage('user', input);
      this.events.emit('messages_updated');
      this.events.emit('saira_stream_start');

      const isUrdu = this.resolveLanguage(input) === 'ur-PK';
      const reply = await this.router.routeQuery(input, isUrdu, history);
      const { bubbleText, speechText } = this.formatReply(reply, isUrdu);

      this.conversation.addMessage('assistant', bubbleText);
      this.events.emit('saira_replied', { text: bubbleText });

      if (settings.voiceEnabled) {
        await this.speech.speak(speechText, isUrdu);
      }
    } catch (err) {
      this.logger.error('Failed to handle user input', err, 'SairaAssistant');
      const fallback = 'Sorry, I could not process that. Please try again.';
      this.conversation.addMessage('assistant', fallback);
      this.events.emit('saira_replied', { text: fallback });
    } finally {
      this.isProcessing = false;
      if (this.sessionActive) {
        this.state.setState('listening');
        this.speech.resumeListening();
      } else {
        this.state.setState('idle');
        if (settings.alwaysListeningMode) {
          this.wakeWord.startListening();
        }
      }
    }
  }

  /** Splits "bubble ||| speech" and guarantees both halves are usable. */
  private formatReply(reply: string, isUrdu: boolean): { bubbleText: string; speechText: string } {
    const [rawBubble, ...rest] = reply.split('|||');
    const bubbleText = (rawBubble || '').trim() || reply.trim();
    const rawSpeech = rest.join(' ').trim();

    // The model sometimes drops the Urdu-script half; reading the Roman half is
    // still better than reading the separator or an empty string.
    const speechText = rawSpeech || bubbleText;

    return {
      bubbleText: bubbleText.replace(/\|\|\|/g, '').trim(),
      speechText: isUrdu ? speechText : speechText.replace(/[\u0600-\u06FF]/g, '').trim() || bubbleText
    };
  }

  private resolveLanguage(text: string): 'en-US' | 'ur-PK' {
    const { language } = this.manager.getSettings();
    if (language === 'en-US' || language === 'ur-PK') return language;
    return this.conversation.detectLanguage(text);
  }

  private setupBackgroundSubscribers() {
    if (this.unsubscribeFunctions.length > 0) return;

    // 1. Subscribe to Task events
    const unsubTasks = TaskEvents.getInstance().subscribe((evt) => {
      if (!this.manager.getSettings().backgroundNotifications) return;
      if (evt.type === 'task_finished') {
        this.announceNotification(`Task completed: ${evt.message}`);
      } else if (evt.type === 'task_failed') {
        this.announceNotification(`Warning! Task failed: ${evt.message}`);
      } else if (evt.type === 'approval_requested') {
        this.announceNotification(`Specialist agent requires your approval.`);
      }
    });
    this.unsubscribeFunctions.push(unsubTasks);

    // 2. Subscribe to CEO Agent analysis events
    const unsubCEO = CEOEvents.subscribe((evt) => {
      if (!this.manager.getSettings().backgroundNotifications) return;
      if (evt.type === 'report_generated') {
        this.announceNotification(`CEO Agent strategic analysis report is ready.`);
      } else if (evt.type === 'analysis_started') {
        this.announceNotification(`CEO Agent is now compiling strategic planning.`);
      }
    });
    this.unsubscribeFunctions.push(unsubCEO);

    // 3. Subscribe to Workflow events
    const unsubWorkflow = WorkflowEvents.subscribe((evt) => {
      if (!this.manager.getSettings().backgroundNotifications) return;
      if (evt.type === 'workflow_completed') {
        this.announceNotification(`Workflow pipeline execution completed successfully.`);
      } else if (evt.type === 'workflow_failed') {
        this.announceNotification(`Warning! Workflow execution encountered failures.`);
      }
    });
    this.unsubscribeFunctions.push(unsubWorkflow);
  }

  private announceNotification(text: string) {
    // Never talk over a live conversation, otherwise two voices overlap.
    if (this.isProcessing || this.sessionActive) {
      this.events.emit('notification_announced', text);
      return;
    }

    this.logger.info(`Notification Announcement: ${text}`, 'SairaAssistant');
    this.events.emit('notification_announced', text);
    const settings = this.manager.getSettings();
    if (settings.voiceEnabled && settings.backgroundNotifications) {
      this.speech.speak(text, false);
    }
  }

  public async startVoiceSession(showGreeting = false) {
    const settings = this.manager.getSettings();
    this.wakeWord.stopListening();

    // Re-opening the panel during an active session must not greet again.
    const shouldGreet = showGreeting && !this.sessionActive && !this.isProcessing;
    this.sessionActive = true;
    const activeLang = this.getSttLanguage();

    if (shouldGreet) {
      this.speech.cancelPlayback(false);
      this.state.setState('thinking');

      const isUrdu = activeLang === 'ur-PK';
      const greeting = isUrdu
        ? 'Jee, main sun rahi hoon. Boliye? ||| جی، میں سن رہی ہوں۔ بولیے؟'
        : "Yes, I'm listening. How can I help you? ||| Yes, I'm listening. How can I help you?";

      const { bubbleText, speechText } = this.formatReply(greeting, isUrdu);
      this.conversation.addMessage('assistant', bubbleText);
      this.events.emit('saira_replied', { text: bubbleText });

      if (settings.voiceEnabled) {
        await this.speech.speak(speechText, isUrdu);
      }
    }

    if (!this.sessionActive) return; // session was ended while the greeting played

    this.state.setState('listening');
    this.speech.startListening(activeLang);
  }

  public stopVoiceSession() {
    this.sessionActive = false;
    this.speech.stopListening();
    this.speech.cancelPlayback();
    this.state.setState('idle');

    const settings = this.manager.getSettings();
    if (settings.alwaysListeningMode) {
      this.wakeWord.startListening();
    }
  }

  public isSessionActive(): boolean {
    return this.sessionActive;
  }

  public isBusy(): boolean {
    return this.isProcessing;
  }

  public setLanguage(language: AssistantLanguage) {
    this.manager.updateSettings({ language });
    this.speech.setLanguage(this.getSttLanguage());
    this.events.emit('settings_updated');
  }

  public setMuted(muted: boolean) {
    const settings = this.manager.getSettings();
    this.speech.setConfig(muted ? 0 : settings.voiceVolume, settings.voiceSpeed);
    if (muted) {
      this.speech.cancelPlayback(false);
    }
  }

  public applySettings() {
    const settings = this.manager.getSettings();
    this.speech.setConfig(settings.voiceVolume, settings.voiceSpeed);
  }

  /** Speech recognition needs a concrete locale, so "auto" listens in English. */
  private getSttLanguage(): 'en-US' | 'ur-PK' {
    return this.manager.getSettings().language === 'ur-PK' ? 'ur-PK' : 'en-US';
  }

  public updateActiveContext(websites: any[], selectedWebsiteId: string | null) {
    this.assistantContext.updateReactState(websites, selectedWebsiteId);
  }
}
