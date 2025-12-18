
import React, { useState } from 'react';
import { ChevronLeft, Bell, ShieldCheck, Wallet, Info, CheckCheck, Trash2, Bot, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNotifications } from '../data';
import { Notification } from '../types';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    setNotifications(updated);
  };

  const clearAll = () => {
    if (window.confirm("Tüm bildirimler silinsin mi?")) {
        setNotifications([]);
    }
  };

  const deleteNotification = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
      switch (type) {
          case 'payment': return <Wallet className="text-emerald-400" size={18} />;
          case 'security': return <ShieldCheck className="text-red-400" size={18} />;
          case 'bot': return <Bot className="text-blue-400" size={18} />;
          default: return <Info className="text-slate-400" size={18} />;
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-8">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white">Bildirimler</h1>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={markAllAsRead} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-blue-400"><CheckCheck size={18} /></button>
            <button onClick={clearAll} className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-red-500"><Trash2 size={18} /></button>
        </div>
      </div>

      <div className="space-y-3">
          {notifications.length === 0 ? (
              <div className="py-20 text-center opacity-40 font-bold">Bildirim bulunmuyor.</div>
          ) : (
              notifications.map(note => (
                  <div key={note.id} className={`p-5 rounded-[28px] border transition-all flex gap-4 ${note.isRead ? 'bg-slate-950/40 border-slate-900' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${note.isRead ? 'bg-slate-900' : 'bg-slate-800'}`}>
                          {getIcon(note.type)}
                      </div>
                      <div className="flex-1">
                          <h4 className="text-sm font-bold text-white mb-1">{note.title}</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{note.message}</p>
                      </div>
                      <button onClick={(e) => deleteNotification(note.id, e)} className="text-slate-700 hover:text-red-500"><X size={16}/></button>
                  </div>
              ))
          )}
      </div>
    </div>
  );
};

export default Notifications;
