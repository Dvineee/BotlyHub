
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, ShieldCheck, Wallet, Info, CheckCheck, Trash2, Bot, X, Loader2 } from 'lucide-react';
// Fixed: Use namespace import for react-router-dom to resolve "no exported member" errors
import * as Router from 'react-router-dom';
import { Notification } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadNotifications();
    else setIsLoading(false);
  }, [user]);

  const loadNotifications = async () => {
    setIsLoading(true);
    const data = await DatabaseService.getNotifications(user.id.toString());
    setNotifications(data);
    setIsLoading(false);
  };

  const markAllAsRead = async () => {
    setIsLoading(true);
    for (const note of notifications) {
        if (!note.isRead) await DatabaseService.markNotificationRead(note.id);
    }
    await loadNotifications();
  };

  const getIcon = (type: Notification['type']) => {
      switch (type) {
          case 'payment': return <Wallet className="text-emerald-400" size={18} />;
          case 'security': return <ShieldCheck className="text-red-400" size={18} />;
          case 'bot': return <Bot className="text-blue-400" size={18} />;
          default: return <Info className="text-slate-400" size={18} />;
      }
  };

  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-8 pb-24">
      <div className="flex items-center justify-between mb-10 px-1">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white tracking-tight uppercase">Bildirimler</h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={markAllAsRead} 
                title="Tümünü Okundu İşaretle"
                className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-blue-400 active:scale-90 transition-all"
            >
                <CheckCheck size={18} />
            </button>
        </div>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">Senkronize Ediliyor...</p>
          </div>
      ) : notifications.length === 0 ? (
          <div className="py-24 text-center">
              <div className="w-20 h-20 bg-slate-900/50 rounded-[32px] border border-dashed border-slate-800 flex items-center justify-center mx-auto mb-6">
                <Bell size={32} className="text-slate-800" />
              </div>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Henüz bildirim bulunmuyor.</p>
          </div>
      ) : (
          <div className="space-y-4">
              {notifications.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => !note.isRead && DatabaseService.markNotificationRead(note.id).then(loadNotifications)}
                    className={`p-5 rounded-[28px] border transition-all flex gap-4 relative overflow-hidden group cursor-pointer ${
                        note.isRead 
                        ? 'bg-slate-950/40 border-slate-900/50 grayscale opacity-60' 
                        : 'bg-slate-900 border-slate-800 shadow-2xl shadow-blue-500/5'
                    }`}
                  >
                      {!note.isRead && <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>}
                      
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner ${note.isRead ? 'bg-slate-900' : 'bg-slate-850'}`}>
                          {getIcon(note.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1 gap-4">
                            <h4 className="text-sm font-black text-white truncate group-hover:text-blue-400 transition-colors">{note.title}</h4>
                            <span className="text-[9px] text-slate-600 font-black whitespace-nowrap mt-1 uppercase tracking-tighter">{formatTime(note.date)}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{note.message}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      <div className="mt-16 text-center border-t border-slate-900 pt-8 opacity-20">
          <p className="text-[9px] font-black uppercase tracking-[0.5em]">BotlyHub Secure Sync</p>
      </div>
    </div>
  );
};

export default Notifications;
