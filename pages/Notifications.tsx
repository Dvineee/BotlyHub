
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
    if (window.confirm("Tüm bildirimler kalıcı olarak silinsin mi?")) {
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

  const formatTime = (isoString: string) => {
      const date = new Date(isoString);
      const now = new Date();
      if (date.toDateString() === now.toDateString()) {
          return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white">Bildirimler</h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={markAllAsRead} 
                className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-blue-400 hover:text-blue-300 transition-colors"
                title="Tümünü Okundu İşaretle"
            >
                <CheckCheck size={18} />
            </button>
            <button 
                onClick={clearAll} 
                className="p-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-500 hover:text-red-400 transition-colors"
                title="Tümünü Sil"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
              <div className="w-20 h-20 bg-slate-900 rounded-[32px] flex items-center justify-center mb-6 border border-slate-800">
                  <Bell size={32} className="opacity-20" />
              </div>
              <p className="font-bold text-sm">Gelen kutusu boş.</p>
              <p className="text-xs text-slate-600 mt-2">Önemli güncellemeler burada görünür.</p>
          </div>
      ) : (
          <div className="space-y-3">
              {notifications.map(note => (
                  <div 
                      key={note.id} 
                      onClick={() => setNotifications(prev => prev.map(n => n.id === note.id ? {...n, isRead: true} : n))}
                      className={`relative p-5 rounded-[24px] border transition-all cursor-pointer flex gap-4 ${
                          note.isRead 
                          ? 'bg-transparent border-slate-900/50' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 shadow-sm'
                      }`}
                  >
                      {/* Unread dot */}
                      {!note.isRead && (
                          <div className="absolute top-6 left-2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      )}

                      {/* Icon Circle */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          note.isRead ? 'bg-slate-900 text-slate-600' : 'bg-slate-800 text-white shadow-inner'
                      }`}>
                          {getIcon(note.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                              <h4 className={`text-sm font-bold truncate ${note.isRead ? 'text-slate-500' : 'text-white'}`}>
                                  {note.title}
                              </h4>
                              <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap ml-2">
                                  {formatTime(note.date)}
                              </span>
                          </div>
                          <p className={`text-xs leading-relaxed font-medium line-clamp-2 ${note.isRead ? 'text-slate-600' : 'text-slate-400'}`}>
                              {note.message}
                          </p>
                      </div>

                      {/* Delete Button on Hover/Touch */}
                      <button 
                        onClick={(e) => deleteNotification(note.id, e)}
                        className="p-1.5 text-slate-700 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default Notifications;
