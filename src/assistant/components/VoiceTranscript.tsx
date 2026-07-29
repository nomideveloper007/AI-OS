import React, { useState, useEffect, useRef } from 'react';
import { useSaira } from '../hooks/useSaira';
import { SairaIndicator } from './SairaIndicator';
import { SettingsModal } from './SettingsModal';
import { PhoneOff, Globe, Settings, Send, Mic, MicOff, Volume2 } from 'lucide-react';

export const VoiceTranscript: React.FC = () => {
  const {
    isOpen,
    startCall,
    endCall,
    voiceState,
    messages,
    settings,
    updateSettings,
    resetSettings,
    setLanguage,
    setMuted,
    sendTextQuery,
    streamingText,
    isBusy,
  } = useSaira();

  const [textInput, setTextInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isBusy) return;
    sendTextQuery(textInput);
    setTextInput('');
  };

  const langCycle: Record<string, 'auto' | 'en-US' | 'ur-PK'> = {
    auto: 'en-US',
    'en-US': 'ur-PK',
    'ur-PK': 'auto',
  };

  const langLabels: Record<string, string> = {
    auto: 'AUTO',
    'en-US': 'EN',
    'ur-PK': 'UR',
  };

  const handleLangToggle = () => {
    setLanguage(langCycle[settings.language] || 'auto');
  };

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    setMuted(nextMute);
  };

  if (!isOpen) {
    return (
      <button
        onClick={startCall}
        title={`Talk to ${settings.assistantName}`}
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-indigo-650 hover:bg-indigo-750 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer group flex items-center justify-center border-2 border-indigo-250"
      >
        <SairaIndicator state="idle" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs whitespace-nowrap group-hover:ml-2">
          Talk to {settings.assistantName}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] rounded-3xl bg-slate-900/90 border border-slate-700/85 backdrop-blur-xl shadow-2xl p-5 text-white flex flex-col space-y-4 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <SairaIndicator state={voiceState} />
          <div>
            <h4 className="font-extrabold text-sm tracking-wide">{settings.assistantName}</h4>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              {voiceState === 'listening' 
                ? 'Listening to you...' 
                : voiceState === 'thinking' 
                ? 'Thinking...' 
                : voiceState === 'speaking' 
                ? 'Speaking...' 
                : 'Connected'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            title="Assistant Settings"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Pulsing Visual Waveform */}
      <div className="flex flex-col items-center justify-center py-4 bg-slate-950/40 rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-1 h-5">
          {[...Array(9)].map((_, i) => {
            const delay = i * 0.1;
            return (
              <div
                key={i}
                style={{
                  animationDelay: `${delay}s`,
                  height: voiceState === 'speaking' || voiceState === 'listening' ? '100%' : '15%'
                }}
                className={`w-1 rounded-full transition-all duration-300 ${
                  voiceState === 'speaking' 
                    ? 'animate-bounce bg-indigo-400' 
                    : voiceState === 'listening' 
                    ? 'animate-bounce bg-emerald-400' 
                    : 'bg-slate-700'
                }`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Transcript bubbles screen */}
      <div className="h-44 overflow-y-auto bg-slate-950/80 rounded-2xl p-4 space-y-3.5 border border-slate-900">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              {item.role === 'user' ? 'You' : settings.assistantName}
            </span>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium shadow-xs ${
                item.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
              }`}
            >
              {item.content}
            </div>
          </div>
        ))}
        {streamingText && (
          <div className="flex flex-col items-start">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              {settings.assistantName}
            </span>
            <div className="max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50">
              {streamingText}
            </div>
          </div>
        )}
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-xs py-8 font-semibold">
            Start talking or ask Saira a command...
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Form Input for text queries */}
      <form onSubmit={handleSend} className="relative flex items-center">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={isBusy ? `${settings.assistantName} is replying...` : 'Ask a question or type command...'}
          disabled={isBusy}
          className="w-full pl-4 pr-12 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-100 focus:outline-none focus:border-indigo-500/80 placeholder-slate-500 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!textInput.trim() || isBusy}
          className="absolute right-2 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Quick Action Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        {/* Mute Button */}
        <button
          onClick={handleMuteToggle}
          className={`p-3 rounded-2xl transition-all cursor-pointer ${
            isMuted 
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' 
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
          title={isMuted ? 'Unmute speech output' : 'Mute speech output'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={endCall}
          className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all font-extrabold text-xs"
        >
          <PhoneOff className="w-4.5 h-4.5 fill-current" />
          End Session
        </button>

        {/* Language Selection */}
        <button
          onClick={handleLangToggle}
          className="p-3 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-extrabold"
          title="Toggle Assistant Language (Auto / English / Urdu)"
        >
          <Globe className="w-5 h-5" />
          {langLabels[settings.language] || 'AUTO'}
        </button>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
        onReset={resetSettings}
      />
    </div>
  );
};
