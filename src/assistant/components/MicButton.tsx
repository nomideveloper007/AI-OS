import React from 'react';
import { Mic, MicOff } from 'lucide-react';

interface MicButtonProps {
  voiceState: string;
  onClick: () => void;
  className?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  voiceState,
  onClick,
  className = '',
}) => {
  const isListening = voiceState === 'listening';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md border cursor-pointer hover:scale-105 active:scale-95 ${
        isListening
          ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-400 animate-pulse'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500'
      } ${className}`}
      title={isListening ? 'Stop listening' : 'Start Saira voice session'}
    >
      <Mic className="w-5 h-5 stroke-[2.5]" />
    </button>
  );
};
