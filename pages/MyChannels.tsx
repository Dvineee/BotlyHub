
import React, { useState, useEffect } from 'react';
// Added X to the imports from lucide-react
import { ChevronLeft, Plus, Megaphone, Users, Loader2, RefreshCw, Search, ShieldCheck, Zap, AlertCircle, CheckCircle2, MessageSquare, Info, X } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Channel } from '../types';
import { DatabaseService } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const MyChannels = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'syncing' | 'done'>('idle');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (user?.id) {
        initChannels();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const initChannels = async () => {
      setIsLoading(true);
      const initialData = await DatabaseService.getChannels(user.id.toString());
      setChannels(initialData);
      
      try {
          setAutoSyncStatus('syncing');
          const newSyncedCount = await DatabaseService.syncChannelsFromBotActivity(user.id.toString());
          
          if (newSyncedCount > 0) {
              const refreshedData = await DatabaseService.getChannels(user.id.toString());
              setChannels(refreshedData);
              notification('success');
              setAutoSyncStatus('done');
              setTimeout(() => setAutoSyncStatus('idle'), 3000);
          } else {
              setAutoSyncStatus('idle');
          }
      } catch (e) {
          console.error("Auto sync failed:", e);
          setAutoSyncStatus('idle');
      } finally {
          setIsLoading(false);
      }
  };

  const handleSync = async () => {
      if (!user) return;
      setIsSyncing(true);
      haptic('medium');
      
      try {
          const newCount = await DatabaseService.syncChannelsFromBotActivity(user.id.toString());
          if (newCount > 0) {
              notification('success');
              const data = await DatabaseService.getChannels(user.id.toString());
              setChannels(data);
          } else {
              setShowGuide(true);
              haptic('heavy');
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsSyncing(false);
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 pt-10 pb-32">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Kanallarım</h1>
        </div>
        <button 
            onClick={handleSync} 
            disabled={isSyncing}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-blue-400 active:scale-90 transition-all disabled:opacity-30"
        >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </div>

      {autoSyncStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-center gap-3 animate-in slide-in-from-top-4 transition-all ${
              autoSyncStatus === 'syncing' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
          }`}>
              {autoSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                  {autoSyncStatus === 'syncing' ? 'Bot Sinyalleri Taranıyor...' : 'Kanal Listesi Güncel!'}
              </span>
          </div>
      )}

      {showGuide && (
          <div className="mb-8 p-6 bg-red-500/5 border border-red-500/20 rounded-[32px] animate-in zoom-in relative">
              {/* Fix: X icon is now imported */}
              <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-slate-500"><X size={16}/></button>
              <div className="flex items-center gap-3 mb-4 text-red-400">
                  <AlertCircle size={20} />
                  <p className="text-xs font-black uppercase">Kanalınız Algılanamadı!</p>
              </div>
              <ul className="space-y-3">
                  <li className="flex gap-3 text-[10px] text-slate-400 font-medium">
                      <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center shrink-0 text-white font-bold italic">1</div>
                      <span>Botu kanalınıza/grubunuza <b>Yönetici (Admin)</b> olarak ekleyin.</span>
                  </li>
                  <li className="flex gap-3 text-[10px] text-slate-400 font-medium">
                      <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center shrink-0 text-white font-bold italic">2</div>
                      <span>Kanal içinde <b>/start</b> komutunu gönderin.</span>
                  </li>
                  <li className="flex gap-3 text-[10px] text-slate-400 font-medium">
                      <div className="w-5 h-5 bg-slate-800 rounded flex items-center justify-center shrink-0 text-white font-bold italic">3</div>
                      <span>Birkaç saniye bekleyip bu sayfayı tekrar yenileyin.</span>
                  </li>
              </ul>
          </div>
      )}

      {isLoading && channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Senkronize Ediliyor...</p>
          </div>
      ) : channels.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-[44px] border-2 border-dashed border-slate-900 flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-800"><Megaphone size={40} /></div>
              <div className="px-10">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Henüz Bağlı Kanal Yok</p>
                  <button onClick={() => setShowGuide(true)} className="text-[10px] text-blue-500 mt-2 italic font-bold flex items-center gap-1 mx-auto">
                      <Info size={12}/> Nasıl eklerim?
                  </button>
              </div>
              <button 
                onClick={handleSync} 
                className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-all active:scale-95"
              >
                  Şimdi Tara
              </button>
          </div>
      ) : (
          <div className="space-y-4">
              <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Bağlı Kanallar ({channels.length})</h2>
              </div>
              {channels.map(c => (
                  <div key={c.id} className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-[32px] flex items-center justify-between group hover:bg-slate-900/60 transition-all shadow-xl">
                      <div className="flex items-center gap-5">
                          <img src={c.icon} className="w-14 h-14 rounded-2xl border border-slate-800 shadow-lg object-cover" />
                          <div>
                              <p className="font-black text-white text-sm italic tracking-tight">{c.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <Users size={12} className="text-slate-600" />
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">{c.memberCount.toLocaleString()} Üye</p>
                              </div>
                          </div>
                      </div>
                      <div className="text-right bg-slate-950 px-4 py-3 rounded-2xl border border-slate-900">
                          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Bakiyeniz</p>
                          <p className="text-sm font-black text-emerald-500">₺{c.revenue}</p>
                      </div>
                  </div>
              ))}
              
              <button onClick={() => setShowGuide(true)} className="w-full py-4 mt-8 rounded-2xl border border-slate-900 text-[9px] font-black text-slate-700 uppercase tracking-widest hover:bg-slate-900 transition-all">
                  Yeni Kanal Ekleme Yardımı
              </button>
          </div>
      )}
    </div>
  );
};

export default MyChannels;
