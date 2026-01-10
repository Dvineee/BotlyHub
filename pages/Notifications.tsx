
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, ShieldCheck, Wallet, Info, CheckCheck, Trash2, Bot, X, Loader2, Sparkles, Zap, Shield } from 'lucide-react';
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
    <div className="min-h-screen bg-[#020617] p-4 pt-10 pb-32 animate-in fade-in">
      {/* Premium Navigation Header */}
      <div className="flex items-center justify-between mb-12 px-2">
        <div className="flex items-center gap-5">
            <button onClick={() => navigate('/settings')} className="p-4 bg-slate-900/60 border border-white/5 rounded-[22px] text-slate-400 active:scale-90 transition-all shadow-xl">
                <ChevronLeft size={22} />
            </button>
            <div>
                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Inbox</h1>
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1.5 italic">Mesaj Merkezi</p>
            </div>
        </div>
        <button 
            onClick={markAllAsRead} 
            className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-[22px] text-blue-500 active:scale-90 transition-all shadow-lg"
            title="Hepsini Oku"
        >
            <CheckCheck size={20} />
        </button>
      </div>

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5">
              <div className="relative">
                  <div className="absolute inset-0 blur-2xl bg-blue-500/20 animate-pulse"></div>
                  <Loader2 className="animate-spin text-blue-500 relative z-10" size={36} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800 italic">Senkronize Ediliyor</p>
          </div>
      ) : notifications.length === 0 ? (
          <div className="py-32 text-center animate-in zoom-in-95">
              <div className="w-24 h-24 bg-slate-900/40 rounded-[40px] border-2 border-dashed border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Bell size={36} className="text-slate-800" />
              </div>
              <p className="text-slate-600 font-black uppercase text-xs tracking-[0.3em] italic">Henüz bir kayıt yok</p>
          </div>
      ) : (
          <div className="space-y-4">
              {notifications.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => handleNoteClick(note)}
                    className={`p-6 rounded-[32px] border transition-all flex gap-5 relative overflow-hidden group cursor-pointer backdrop-blur-md ${
                        note.isRead 
                        ? 'bg-slate-950/40 border-white/5 opacity-50' 
                        : 'bg-slate-900/60 border-blue-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                      {!note.isRead && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]"></div>}
                      
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner border border-white/5 transition-all group-active:scale-95 ${note.isRead ? 'bg-slate-950' : 'bg-slate-800'}`}>
                          {getIcon(note.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <h4 className={`text-sm font-black italic uppercase truncate transition-colors ${note.isRead ? 'text-slate-400' : 'text-white'}`}>{note.title}</h4>
                            <span className="text-[8px] text-slate-600 font-black whitespace-nowrap mt-1 uppercase tracking-tighter">{formatTime(note.date)}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold uppercase italic leading-relaxed line-clamp-2">{note.message}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* SADELEŞTİRİLMİŞ BİLDİRİM DETAY MODALI */}
      {selectedNote && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#020617]/85 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedNote(null)}>
              <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        {getIcon(selectedNote.type)}
                      </div>
                      
                      <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase italic">{selectedNote.title}</h3>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-6">{selectedNote.type} LOG</p>
                      
                      <div className="bg-slate-950/50 p-6 rounded-[28px] border border-white/5 mb-10">
                          <p className="text-slate-400 text-[11px] leading-relaxed font-bold uppercase italic">{selectedNote.message}</p>
                      </div>

                      <button 
                        onClick={() => setSelectedNote(null)} 
                        className="w-full py-4.5 bg-white text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all shadow-xl"
                      >
                        ANLADIM
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Notifications;
