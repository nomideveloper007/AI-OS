import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 py-6 px-4 md:px-6 border-t border-slate-200/60 text-center flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-400">
      <p>© 2024 AI OS. All rights reserved.</p>
      <div className="flex items-center gap-4 mt-2 sm:mt-0">
        <span>Version 1.0.0</span>
      </div>
    </footer>
  );
};

