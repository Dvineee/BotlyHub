
import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, Wallet, Info, CheckCheck, Trash2, Bot, X, Loader2, Sparkles, Zap, Shield } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Notification } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const Notifications = () => {
  const navigate = useNavigate();
  const { user, haptic, notification: tgNotification } = useTelegram();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Notification | null>(null);

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
    haptic('medium');
    setIsLoading(true);
    for (const note of notifications) {
        if (!note.isRead) await DatabaseService.markNotificationRead(note.id);
    }
    await loadNotifications();
    tgNotification('success');
  };

  const handleNoteClick = async (note: Notification) => {
      haptic('light');
      setSelectedNote(note);
      
      // Admin tarafındaki sayacı artır
      await DatabaseService.incrementNotificationView(note.id);
      
      if (!note.isRead) {
          await DatabaseService.markNotificationRead(note.id);
          setNotifications(notifications.map(n => n.id === note.id ? { ...n, isRead: true } : n));
      }
  };

  const getIcon = (type: Notification['type']) => {
      switch (type) {
          case 'payment': return <Wallet className="text-emerald-400" size={20} />;
          case 'security': return <ShieldCheck className="text-red-400" size={20} />;
          case 'bot': return <Bot className="text-blue-400" size={20} />;
          default: return <Info className="text-slate-400" size={20} />;
      }
  };

  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pt-10 pb-32 animate-in fade-in transition-colors duration-300">
      {/* Premium Navigation Header */}
      <div className="flex items-center justify-between mb-12 px-1">
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 flex items-center justify-center shadow-sm">
                <Bell className="text-brand dark:text-brand-light" size={20} />
            </div>
            <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">INBOX</h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] mt-1.5">MESSAGING v4.2.0</p>
            </div>
        </div>
        <button 
            onClick={markAllAsRead} 
            className="w-12 h-12 flex items-center justify-center bg-brand/10 dark:bg-brand-light/10 border border-brand/20 dark:border-brand-light/20 rounded-xl text-brand dark:text-brand-light active:scale-90 transition-transform "
            title="Hepsini Oku"
        >
            <CheckCheck size={22} />
        </button>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="relative">
                  <div className="absolute inset-0 blur-3xl bg-brand/20 dark:bg-brand-light/20 animate-pulse"></div>
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/10 flex items-center justify-center relative z-10 shadow-xl">
                    <Loader2 className="animate-spin text-brand dark:text-brand-light" size={32} />
                  </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 italic animate-pulse">SENKRONİZE EDİLİYOR</p>
          </div>
      ) : notifications.length === 0 ? (
          <div className="py-32 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-white dark:bg-slate-900/40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-10 fancy-glass-card shadow-inner">
                <Bell size={36} className="text-slate-200 dark:text-slate-800" />
              </div>
              <p className="text-slate-300 dark:text-slate-700 font-black uppercase text-[11px] tracking-[0.4em] italic">İLETİŞİM HATTI TEMİZ</p>
          </div>
      ) : (
          <div className="space-y-4">
              {notifications.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => handleNoteClick(note)}
                    className={`p-6 rounded-xl border transition-all flex gap-5 relative overflow-hidden group cursor-pointer backdrop-blur-xl fancy-glass-card ${
                        note.isRead 
                        ? 'bg-white/40 dark:bg-slate-950/40 border-black/5 dark:border-white/5 opacity-50' 
                        : 'bg-white dark:bg-slate-900/60 border-brand/20 dark:border-brand-light/20 shadow-lg shadow-brand/5'
                    }`}
                  >
                      {!note.isRead && (
                        <>
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand dark:bg-brand-light animate-pulse"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                        </>
                      )}
                      
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 border border-black/5 dark:border-white/5 transition-all group-active:scale-95 shadow-sm ${note.isRead ? 'bg-slate-100 dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-800'}`}>
                          {getIcon(note.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <h4 className={`text-[15px] font-black italic uppercase truncate transition-colors tracking-tighter ${note.isRead ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>{note.title}</h4>
                            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-black whitespace-nowrap mt-1 uppercase tracking-tighter italic">
                                {formatTime(note.date).split('•')[0]}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-500 font-black uppercase tracking-widest leading-relaxed line-clamp-1 italic">{note.message}</p>
                          <div className="mt-3 flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${note.isRead ? 'bg-slate-200 dark:bg-slate-800' : 'bg-brand'}`} />
                             <span className="text-[8px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-widest">{note.isRead ? 'OKUNDU' : 'YENİ İLETİ'}</span>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* DETAY MODALI */}
      {selectedNote && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in" onClick={() => setSelectedNote(null)}>
              <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 w-full max-w-sm rounded-xl overflow-hidden animate-in zoom-in-95 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                      {getIcon(selectedNote.type)}
                  </div>
                  <div className="p-10 text-center">
                      <div className="w-24 h-24 bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/5 rounded-xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                        {getIcon(selectedNote.type)}
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase italic leading-none">{selectedNote.title}</h3>
                      <p className="text-[10px] font-black text-brand uppercase tracking-[0.4em] mb-10">{selectedNote.type} CORE MODULE</p>
                      
                      <div className="bg-slate-50/50 dark:bg-slate-950/50 p-8 rounded-xl border border-black/5 dark:border-white/5 mb-10 text-left">
                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed font-black uppercase tracking-widest">{selectedNote.message}</p>
                      </div>

                      <button 
                        onClick={() => setSelectedNote(null)} 
                        className="w-full py-5 bg-slate-900 dark:bg-slate-950 hover:opacity-90 text-white font-black rounded-xl text-[12px] uppercase tracking-[0.3em] active:scale-95 transition-all italic border-b-8 border-black dark:border-slate-800"
                      >
                        ONAYLANDI
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Notifications;
