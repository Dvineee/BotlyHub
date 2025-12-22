
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Megaphone, Users, Loader2, RefreshCw, Search, ShieldCheck, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    if (user?.id) {
        initChannels();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  const initChannels = async () => {
      setIsLoading(true);
      
      // 1. Önce veritabanındaki mevcut kanalları yükle (Hızlı açılış için)
      const initialData = await DatabaseService.getChannels(user.id.toString());
      setChannels(initialData);
      
      // 2. Arka planda sessizce bot keşiflerini senkronize et (Otomatik özellik)
      try {
          setAutoSyncStatus('syncing');
          const newSyncedCount = await DatabaseService.syncChannelsFromBotActivity(user.id.toString());
          
          if (newSyncedCount > 0) {
              // Eğer yeni kanal bulunduysa listeyi tazele
              const refreshedData = await DatabaseService.getChannels(user.id.toString());
              setChannels(refreshedData);
              notification('success');
              setAutoSyncStatus('done');
              // 3 saniye sonra done durumunu temizle
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

  const loadChannels = async () => {
    const data = await DatabaseService.getChannels(user.id.toString());
    setChannels(data);
  };

  const handleSync = async () => {
      if (!user) return;
      setIsSyncing(true);
      haptic('medium');
      
      try {
          const newCount = await DatabaseService.syncChannelsFromBotActivity(user.id.toString());
          if (newCount > 0) {
              notification('success');
              await loadChannels();
          } else {
              alert("Yeni kanal bulunamadı. Lütfen botu eklediğiniz kanalda /start komutunu verdiğinizden emin olun.");
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
            title="Manuel Senkronizasyon"
        >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Auto Sync Indicator - Sessiz Bildirim */}
      {autoSyncStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-center gap-3 animate-in slide-in-from-top-4 transition-all ${
              autoSyncStatus === 'syncing' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
          }`}>
              {autoSyncStatus === 'syncing' ? (
                  <Loader2 className="animate-spin" size={16} />
              ) : (
                  <CheckCircle2 size={16} />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                  {autoSyncStatus === 'syncing' ? 'Yeni kanallar taranıyor...' : 'Liste güncellendi!'}
              </span>
          </div>
      )}

      <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-[36px] mb-8 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-xl shadow-blue-900/20"><Zap size={24}/></div>
          <div>
              <p className="text-xs font-black text-white uppercase italic tracking-tight">Akıllı Takip</p>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                  Botu kanalınıza ekleyip <span className="text-blue-400 font-bold">/start</span> verdiğinizde, uygulama kanalınızı <span className="text-white">otomatik</span> olarak algılar.
              </p>
          </div>
      </div>

      {isLoading && channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest animate-pulse">Kanallar taranıyor...</p>
          </div>
      ) : channels.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-[44px] border-2 border-dashed border-slate-900 flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-800"><Megaphone size={40} /></div>
              <div className="px-10">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Bağlı kanal bulunamadı</p>
                  <p className="text-[10px] text-slate-700 mt-2 italic font-medium">Botu kanalınıza ekleyin ve kanal içinde start komutu verin.</p>
              </div>
              <button 
                onClick={handleSync} 
                className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-all active:scale-95"
              >
                  Manuel Tara
              </button>
          </div>
      ) : (
          <div className="space-y-4">
              <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Aktif Kanallar ({channels.length})</h2>
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
                          <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-0.5">Kazanç</p>
                          <p className="text-sm font-black text-emerald-500">₺{c.revenue}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}
      
      <div className="mt-20 p-8 border border-slate-900/50 rounded-[40px] bg-slate-900/10 flex flex-col items-center gap-4 text-center">
          <AlertCircle className="text-slate-800" size={32} />
          <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-widest px-4">
              Kanal verileriniz botların gönderdiği şifreli sinyaller ile her 10 dakikada bir güncellenir.
          </p>
      </div>
    </div>
  );
};

export default MyChannels;
