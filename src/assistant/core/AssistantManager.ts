import { AssistantSettings } from '../types';
import { AssistantLogger } from './AssistantLogger';

const SETTINGS_KEY = 'aios.assistant.settings';

const DEFAULT_SETTINGS: AssistantSettings = {
  assistantName: 'Saira',
  wakeWord: 'Hey Saira',
  voiceEnabled: true,
  voiceSpeed: 1.0,
  voiceVolume: 1.0,
  language: 'auto',
  backgroundNotifications: true,
  alwaysListeningMode: true,
  pushToTalkMode: false
};

export class AssistantManager {
  private static instance: AssistantManager;
  private settings: AssistantSettings = { ...DEFAULT_SETTINGS };
  private logger = AssistantLogger.getInstance();

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): AssistantManager {
    if (!AssistantManager.instance) {
      AssistantManager.instance = new AssistantManager();
    }
    return AssistantManager.instance;
  }

  private loadSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        const validLanguages = ['auto', 'en-US', 'ur-PK'];
        if (!validLanguages.includes(this.settings.language)) {
          this.settings.language = DEFAULT_SETTINGS.language;
        }
        this.logger.info('Loaded assistant settings from localStorage', 'AssistantManager');
      }
    } catch (err) {
      this.logger.error('Failed to load settings', err, 'AssistantManager');
    }
  }

  public getSettings(): AssistantSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<AssistantSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.logger.info('Updated settings: ' + JSON.stringify(updates), 'AssistantManager');
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } catch (err) {
        this.logger.error('Failed to save settings to localStorage', err, 'AssistantManager');
      }
    }
  }

  public resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.updateSettings({});
  }
}
