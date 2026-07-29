export type AssistantLanguage = 'auto' | 'en-US' | 'ur-PK';

export interface AssistantSettings {
  assistantName: string;
  wakeWord: string;
  voiceEnabled: boolean;
  voiceSpeed: number;
  voiceVolume: number;
  language: AssistantLanguage;
  backgroundNotifications: boolean;
  alwaysListeningMode: boolean;
  pushToTalkMode: boolean;
}

export type AssistantVoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface AssistantOSContext {
  activeWebsite: {
    id: string;
    name: string;
    domain: string;
    healthScore: number;
  } | null;
  websitesCount: number;
  reposCount: number;
  runningAgents: string[];
  runningWorkflows: string[];
  tasks: {
    active: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
    waitingApproval: number;
  };
  latestReport: {
    id: string;
    title: string;
    overallScore: number;
  } | null;
  aiProvider: string;
  isConnected: boolean;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}
