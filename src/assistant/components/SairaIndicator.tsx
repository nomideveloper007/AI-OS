import React from 'react';

interface SairaIndicatorProps {
  state: string;
}

export const SairaIndicator: React.FC<SairaIndicatorProps> = ({ state }) => {
  const getPulseStyles = () => {
    switch (state) {
      case 'listening':
        return 'bg-emerald-500 border-emerald-400 ring-4 ring-emerald-500/25 animate-pulse';
      case 'thinking':
        return 'bg-violet-600 border-violet-500 animate-spin border-t-transparent';
      case 'speaking':
        return 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg shadow-indigo-500/35';
      default:
        return 'bg-slate-700 border-slate-600';
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Background ripples */}
      {state === 'speaking' && (
        <>
          <div className="absolute w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 animate-ping"></div>
          <div className="absolute w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-400/20 animate-pulse"></div>
        </>
      )}
      
      {state === 'listening' && (
        <div className="absolute w-12 h-12 rounded-full bg-emerald-500/25 animate-ping"></div>
      )}

      {/* Main sphere indicator */}
      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold text-white select-none z-10 transition-all duration-300 ${getPulseStyles()}`}>
        {state === 'thinking' ? '' : 'S'}
      </div>

      {/* Tiny Status indicator dots */}
      {state !== 'idle' && (
        <div className="absolute -bottom-1 -right-1 flex h-3 w-3 z-20">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            state === 'listening' ? 'bg-emerald-400' : state === 'thinking' ? 'bg-violet-400' : 'bg-indigo-400'
          }`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${
            state === 'listening' ? 'bg-emerald-500' : state === 'thinking' ? 'bg-violet-500' : 'bg-indigo-500'
          }`}></span>
        </div>
      )}
    </div>
  );
};
