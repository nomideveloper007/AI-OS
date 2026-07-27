import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export const NotificationPopover: React.FC = () => {
  const { 
    isNotificationsOpen, 
    setIsNotificationsOpen, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead,
    setActiveTab 
  } = useApp();

  if (!isNotificationsOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'agent':
        return <Cpu className="w-4 h-4 text-indigo-500" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="absolute right-4 top-16 z-40 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all read
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">No notifications.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.type === 'approval') setActiveTab('approvals');
                setIsNotificationsOpen(false);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                n.read
                  ? 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 opacity-75'
                  : 'bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 font-medium'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400">{n.timeAgo}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
