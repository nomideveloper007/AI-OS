import React from 'react';
import { AssistantSettings } from '../types';
import { X, Volume2, Gauge, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  onUpdate: (settings: Partial<AssistantSettings>) => void;
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdate,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs font-sans text-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-base tracking-wide">Saira Settings</h3>
            <p className="text-[10px] text-slate-400 font-medium">Configure voice assistant & speech settings</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
          {/* Assistant Name */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assistant Name</label>
            <input 
              type="text" 
              value={settings.assistantName} 
              onChange={(e) => onUpdate({ assistantName: e.target.value })}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Wake Word */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Wake Word Trigger</label>
            <input 
              type="text" 
              value={settings.wakeWord} 
              onChange={(e) => onUpdate({ wakeWord: e.target.value })}
              className="px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Sliders: Volume & Speed */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-slate-500" /> Volume
              </label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={settings.voiceVolume} 
                onChange={(e) => onUpdate({ voiceVolume: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-950 cursor-pointer h-1 rounded-lg"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-slate-500" /> Speed
              </label>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={settings.voiceSpeed} 
                onChange={(e) => onUpdate({ voiceSpeed: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-950 cursor-pointer h-1 rounded-lg"
              />
            </div>
          </div>

          {/* Conversation Language */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Conversation Language</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'auto', label: 'Auto', desc: 'Detect per message' },
                { value: 'en-US', label: 'English', desc: 'Always English' },
                { value: 'ur-PK', label: 'Urdu', desc: 'Always Urdu' },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onUpdate({ language: option.value })}
                  title={option.desc}
                  className={`px-2 py-2 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                    settings.language === option.value
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Checklist */}
          <div className="space-y-3 pt-2">
            {[
              { key: 'voiceEnabled', label: 'Voice Enabled', desc: 'Allows Saira to speak responses back' },
              { key: 'alwaysListeningMode', label: 'Always Listening', desc: 'Starts listening automatically on wake-word detection' },
              { key: 'backgroundNotifications', label: 'Speak Notifications', desc: 'Announces background workflow alerts' },
            ].map((item) => (
              <div key={item.key} className="flex items-start justify-between">
                <div className="flex flex-col pr-4">
                  <span className="text-xs font-bold text-slate-200">{item.label}</span>
                  <span className="text-[9px] text-slate-400">{item.desc}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdate({ [item.key]: !((settings as any)[item.key]) })}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer ${
                    (settings as any)[item.key] ? 'bg-indigo-600' : 'bg-slate-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                    (settings as any)[item.key] ? 'translate-x-4' : 'translate-x-0'
                  }`}></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 font-bold transition-colors cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition-colors cursor-pointer"
          >
            Close & Save
          </button>
        </div>
      </div>
    </div>
  );
};
