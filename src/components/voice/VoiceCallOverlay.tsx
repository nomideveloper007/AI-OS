import React, { useState, useEffect, useRef } from 'react';
import { VoiceService } from '../../services/voice/VoiceService';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Globe, RefreshCw, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VoiceCallOverlay: React.FC = () => {
  const { websites, selectedWebsiteId, approvals, tasks, agents } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lang, setLang] = useState<'en-US' | 'ur-PK'>('en-US');
  const [transcript, setTranscript] = useState<Array<{ sender: 'user' | 'saira'; text: string }>>([]);
  const [status, setStatus] = useState<string>('Listening...');
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean>(true);

  const voiceService = VoiceService.getInstance();
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const selectedWebsite = websites.find((w) => w.id === selectedWebsiteId) || websites[0];

  useEffect(() => {
    voiceService.updateActiveContext({
      selectedWebsite,
      websitesCount: websites.length,
      reposCount: 23,
      pendingApprovalsCount: approvals.length,
      tasksCount: tasks.length,
      agentsCount: agents.length
    });
  }, [selectedWebsite, websites, approvals, tasks, agents]);

  useEffect(() => {
    // Bootstrap background wake-word listener
    voiceService.startWakeWordListener();

    voiceService.onWakeWordDetected = () => {
      handleStartCall(voiceService.getLanguage());
    };

    voiceService.onSpeechStart = () => {
      setIsUserSpeaking(true);
      setStatus(lang === 'ur-PK' ? 'Aap bol rahe hain...' : 'Listening to you...');
    };

    voiceService.onSpeechEnd = () => {
      setIsUserSpeaking(false);
    };

    voiceService.onSpeechResult = (text, isUrdu) => {
      setTranscript((prev) => [...prev, { sender: 'user', text }]);
      setStatus(isUrdu ? 'Saira reply generate kar rahi hain...' : 'Saira is thinking...');
    };

    voiceService.onSairaReply = (text) => {
      setTranscript((prev) => [...prev, { sender: 'saira', text }]);
    };

    voiceService.onSairaSpeaking = (speaking) => {
      setIsSpeaking(speaking);
      if (speaking) {
        setStatus(lang === 'ur-PK' ? 'Saira bol rahi hain...' : 'Saira is speaking...');
      } else {
        setStatus(lang === 'ur-PK' ? 'Aapki baari (Bolye)...' : 'Your turn, speak now...');
      }
    };

    voiceService.onError = (error) => {
      if (error === 'not-allowed') {
        setMicPermissionGranted(false);
        setStatus('Microphone permission blocked.');
      } else {
        setStatus(`Error: ${error}`);
      }
    };

    return () => {
      voiceService.endCall();
    };
  }, [lang]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleStartCall = (selectedLang: 'en-US' | 'ur-PK' = 'en-US') => {
    setIsOpen(true);
    setIsConnecting(true);
    setTranscript([]);
    setLang(selectedLang);
    setStatus(selectedLang === 'ur-PK' ? 'Saira se connect ho raha hai...' : 'Connecting to Saira...');

    setTimeout(() => {
      setIsConnecting(false);
      voiceService.startCall(selectedLang);
      
      const voices = typeof window !== 'undefined' && window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
      const hasUrdu = voices.some((v) => v.lang.toLowerCase().startsWith('ur'));

      let greeting = '';
      if (selectedLang === 'ur-PK') {
        if (hasUrdu) {
          greeting = 'السلام علیکم! سائرہ بات کر رہی ہوں۔ کہیے میں آپ کی کیا مدد کر سکتی ہوں؟';
        } else {
          greeting = 'Assalam-o-Alaikum! Saira baat kar rahi hoon. Kahiye kese madad kar sakti hoon?';
        }
      } else {
        greeting = "Hello! Saira here. How is everything going with the websites today?";
      }
      
      setTranscript([{ sender: 'saira', text: greeting }]);
      voiceService.speak(greeting, selectedLang === 'ur-PK');
    }, 1500);
  };

  const handleEndCall = () => {
    voiceService.endCall();
    setIsOpen(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    setTranscript([]);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    voiceService.setMute(nextMute);
  };

  const handleLanguageToggle = () => {
    const nextLang = lang === 'en-US' ? 'ur-PK' : 'en-US';
    setLang(nextLang);
    voiceService.setLanguage(nextLang);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => handleStartCall(lang)}
        title="Call CEO Saira"
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer group flex items-center justify-center border-2 border-indigo-200"
      >
        <Phone className="w-6 h-6 stroke-[2]" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out font-bold text-xs whitespace-nowrap group-hover:ml-2">
          Call Saira (CEO)
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-3xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-2xl p-5 text-white flex flex-col space-y-4 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          </div>
          <div>
            <h4 className="font-extrabold text-sm tracking-wide">CEO Saira (Online)</h4>
            <p className="text-[10px] text-slate-400 font-medium">{status}</p>
          </div>
        </div>
        <button 
          onClick={handleEndCall}
          className="p-1 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Saira Pulsing Ripple & Waveform Panel */}
      <div className="flex flex-col items-center justify-center py-6 relative overflow-hidden bg-slate-950/40 rounded-2xl border border-slate-800/60">
        
        {/* Ripple effects */}
        <div className="relative flex items-center justify-center w-28 h-28 mb-4">
          {/* Rip 1 */}
          <div className={`absolute w-full h-full rounded-full border border-indigo-500/20 bg-indigo-500/5 transition-transform duration-700 ${
            isSpeaking ? 'animate-ping' : ''
          }`}></div>
          {/* Rip 2 */}
          <div className={`absolute w-24 h-24 rounded-full border border-indigo-500/30 bg-indigo-500/10 transition-transform duration-500 ${
            isSpeaking || isUserSpeaking ? 'animate-pulse' : ''
          }`}></div>
          
          {/* Avatar core */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 border-2 border-indigo-300 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner relative z-10">
            S
          </div>
        </div>

        {/* Dynamic Waveform */}
        <div className="flex items-center gap-1 h-6 mt-2">
          {[...Array(9)].map((_, i) => {
            const delay = i * 0.1;
            return (
              <div
                key={i}
                style={{
                  animationDelay: `${delay}s`,
                  height: isSpeaking || isUserSpeaking ? '100%' : '15%'
                }}
                className={`w-1 rounded-full bg-indigo-400 transition-all duration-300 ${
                  isSpeaking 
                    ? 'animate-bounce bg-indigo-400' 
                    : isUserSpeaking 
                    ? 'animate-bounce bg-emerald-400' 
                    : 'bg-slate-700'
                }`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Live Chat Transcription Screen */}
      <div className="h-44 overflow-y-auto bg-slate-950/80 rounded-2xl p-4 space-y-3 scrollbar-thin border border-slate-900">
        {transcript.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${item.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              {item.sender === 'user' ? 'You' : 'Saira'}
            </span>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed font-medium shadow-xs ${
                item.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50'
              }`}
            >
              {item.text}
            </div>
          </div>
        ))}
        {isConnecting && (
          <div className="flex justify-center items-center h-full py-4 text-xs font-semibold text-slate-400 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            Connecting voice protocol...
          </div>
        )}
        <div ref={transcriptEndRef} />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`p-3.5 rounded-2xl transition-all cursor-pointer ${
            isMuted 
              ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' 
              : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white border border-rose-500 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-950/20 transition-all font-extrabold text-xs"
        >
          <PhoneOff className="w-5 h-5 fill-current" />
          End Call
        </button>

        {/* Language Selection */}
        <button
          onClick={handleLanguageToggle}
          className="p-3.5 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs font-extrabold"
          title="Switch Call Language"
        >
          <Globe className="w-5 h-5" />
          {lang === 'en-US' ? 'EN' : 'UR'}
        </button>
      </div>

      {!micPermissionGranted && (
        <div className="text-[10px] text-rose-400 font-bold bg-rose-950/30 p-2.5 rounded-xl border border-rose-900/50 text-center">
          Microphone permission denied. Please allow mic access in your browser settings.
        </div>
      )}
    </div>
  );
};
