import { useState, useEffect } from 'react';
import { SairaAssistant } from '../core/SairaAssistant';
import { AssistantEvents } from '../core/AssistantEvents';
import { AssistantState } from '../core/AssistantState';
import { AssistantManager } from '../core/AssistantManager';
import { ConversationManager } from '../conversation/ConversationManager';
import { ConversationMessage, AssistantSettings, AssistantLanguage } from '../types';

export const useSaira = () => {
  const saira = SairaAssistant.getInstance();
  const events = AssistantEvents.getInstance();
  const stateTracker = AssistantState.getInstance();
  const settingsTracker = AssistantManager.getInstance();
  const conversation = ConversationManager.getInstance();

  const [voiceState, setVoiceState] = useState<string>(stateTracker.getState());
  const [messages, setMessages] = useState<ConversationMessage[]>(conversation.getMessages());
  const [settings, setSettings] = useState<AssistantSettings>(settingsTracker.getSettings());
  const [isOpen, setIsOpen] = useState(false);

  const [streamingText, setStreamingText] = useState('');

  useEffect(() => {
    // Sync React states with Saira event emitters
    const handleStateChange = (data: { newState: string }) => {
      setVoiceState(data.newState);
    };

    let accumulated = '';

    const resetStream = () => {
      accumulated = '';
      setStreamingText('');
    };

    const handleStreamChunk = (chunk: string) => {
      accumulated += chunk;
      let cleanText = accumulated;
      if (accumulated.startsWith('[ASSIGN_TASK]:')) {
        const match = accumulated.match(/explanation="([^"]*)/);
        if (match) {
          cleanText = match[1];
        } else {
          cleanText = 'Assigning task to agent...';
        }
      }
      // Remove speech synthesis right side indicator from bubble stream
      setStreamingText(cleanText.split('|||')[0] || cleanText);
    };

    // The stored reply replaces the live stream bubble; without this reset the
    // stream bubble stayed on screen next to it and looked like a duplicate reply.
    const handleSairaReply = () => {
      resetStream();
      setMessages(conversation.getMessages());
    };

    const handleMessagesUpdated = () => {
      setMessages(conversation.getMessages());
    };

    const handleSettingsUpdated = () => {
      setSettings(settingsTracker.getSettings());
    };

    const handleTrigger = () => {
      setIsOpen(true);
    };

    events.on('state_changed', handleStateChange);
    events.on('saira_stream_start', resetStream);
    events.on('saira_stream_chunk', handleStreamChunk);
    events.on('saira_replied', handleSairaReply);
    events.on('messages_updated', handleMessagesUpdated);
    events.on('settings_updated', handleSettingsUpdated);
    events.on('assistant_triggered', handleTrigger);

    return () => {
      events.off('state_changed', handleStateChange);
      events.off('saira_stream_start', resetStream);
      events.off('saira_stream_chunk', handleStreamChunk);
      events.off('saira_replied', handleSairaReply);
      events.off('messages_updated', handleMessagesUpdated);
      events.off('settings_updated', handleSettingsUpdated);
      events.off('assistant_triggered', handleTrigger);
    };
  }, []);

  const startCall = () => {
    setIsOpen(true);
    events.emit('assistant_triggered');
    setMessages(conversation.getMessages());
    saira.startVoiceSession(true);
  };

  const endCall = () => {
    saira.stopVoiceSession();
    setStreamingText('');
    setIsOpen(false);
  };

  const updateSettings = (newSettings: Partial<AssistantSettings>) => {
    settingsTracker.updateSettings(newSettings);
    saira.applySettings();
    if (newSettings.language) {
      saira.setLanguage(newSettings.language);
    }
    setSettings(settingsTracker.getSettings());
    events.emit('settings_updated');
  };

  const resetSettings = () => {
    settingsTracker.resetSettings();
    saira.applySettings();
    setSettings(settingsTracker.getSettings());
    events.emit('settings_updated');
  };

  const setLanguage = (language: AssistantLanguage) => {
    saira.setLanguage(language);
    setSettings(settingsTracker.getSettings());
  };

  const setMuted = (muted: boolean) => {
    saira.setMuted(muted);
  };

  const sendTextQuery = async (text: string) => {
    await saira.handleUserInput(text, 'text');
  };

  return {
    isOpen,
    setIsOpen,
    voiceState,
    messages,
    settings,
    startCall,
    endCall,
    updateSettings,
    resetSettings,
    setLanguage,
    setMuted,
    sendTextQuery,
    streamingText,
    isBusy: voiceState === 'thinking',
  };
};
