
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Megaphone, Users, Loader2, RefreshCw, AlertCircle, CheckCircle2, X, Bot as BotIcon, Info, Fingerprint, Zap, AlertTriangle } from 'lucide-react';
import * as Router from 'react-router-dom';
import { Channel } from '../types';
import { DatabaseService, supabase } from '../services/DatabaseService';
import { useTelegram } from '../hooks/useTelegram';

const { useNavigate } = Router as any;

const MyChannels = () => {
  const navigate = useNavigate();
  const { user, haptic, notification } = useTelegram();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
  const realtimeSubscription = useRef<any>(null);

  useEffect(() => {
    if (user?.id) {
        initChannels();
        setupRealtime();
    } else {
        setIsLoading(false);
    }

    return () => {
        if (realtimeSubscription.current) {
            supabase.removeChannel(realtimeSubscription.current);
        }
    };
  }, [user]);

  const setupRealtime = () => {
      if (!user?.id) return;
      const uId = String(user.id);
      
      realtimeSubscription.current = supabase
          .channel('discovery_updates')
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'bot_discovery_logs',
              filter: `owner_id=eq.${uId}` 
          }, () => {
              triggerSync();
          })
          .subscribe();
  };

  const initChannels = async () => {
      setIsLoading(true);
      try {
          const uId = String(user.id);
          const initialData = await DatabaseService.getChannels(uId);
          setChannels(initialData);
          await triggerSync();
      } catch (e) {
          console.error("Init Error:", e);
      } finally {
          setIsLoading(false);
      }
  };

  const triggerSync = async () => {
      if (!user?.id) return;
      const uId = String(user.id);
      setAutoSyncStatus('syncing');
      
      try {
          const count = await DatabaseService.syncChannelsFromBotActivity(uId);
          const refreshedData = await DatabaseService.getChannels(uId);
          setChannels(refreshedData);

          if (count > 0) {
              notification('success');
              setAutoSyncStatus('done');
          } else {
              setAutoSyncStatus('idle');
          }
      } catch (e) {
          setAutoSyncStatus('error');
      }
      setTimeout(() => setAutoSyncStatus('idle'), 3000);
  };

  const handleManualRefresh = async () => {
      setIsSyncing(true);
      haptic('medium');
      await triggerSync();
      setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] p-6 pt-10 pb-32 animate-in fade-in">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
                <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">Kanallarım</h1>
        </div>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Canlı</span>
            </div>
            <button 
                onClick={handleManualRefresh} 
                disabled={isSyncing}
                className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-all disabled:opacity-30"
            >
                <RefreshCw size={20} className={isSyncing ? 'animate-spin text-blue-500' : ''} />
            </button>
        </div>
      </div>

      {autoSyncStatus !== 'idle' && (
          <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-center gap-3 animate-in slide-in-from-top-4 transition-all ${
              autoSyncStatus === 'syncing' ? 'bg-blue-600/10 border-blue-500/20 text-blue-400' : 
              autoSyncStatus === 'done' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' :
              'bg-red-600/10 border-red-500/20 text-red-400'
          }`}>
              {autoSyncStatus === 'syncing' ? <Loader2 className="animate-spin" size={16} /> : 
               autoSyncStatus === 'done' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                  {autoSyncStatus === 'syncing' ? 'Yeni veriler aktarılıyor...' : 
                   autoSyncStatus === 'done' ? 'Kanal Listesi Güncellendi!' : 'Bağlantı hatası oluştu.'}
              </span>
          </div>
      )}

      {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Kanallar Getiriliyor...</p>
          </div>
      ) : channels.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/20 rounded-[44px] border-2 border-dashed border-slate-900 flex flex-col items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-800"><Megaphone size={40} /></div>
              <div className="px-10">
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Kanal Bulunamadı</p>
                  <p className="text-[10px] text-slate-700 mt-2 italic font-medium">Botu kanalınıza ekleyip sinyal gönderin.</p>
              </div>
              <button 
                onClick={handleManualRefresh} 
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
                  <div key={c.id} className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-[32px] flex items-center justify-between group hover:bg-slate-900/60 transition-all shadow-xl animate-in slide-in-from-bottom-2 relative overflow-hidden">
                      <div className="flex items-center gap-5">
                          <div className="relative">
                            <img 
                                src={c.icon} 
                                className="w-14 h-14 rounded-2xl border border-slate-800 shadow-lg object-cover bg-slate-900" 
                                onError={(e) => {
                                    (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=1e293b&color=fff`;
                                }}
                            />
                            {!c.telegram_id && (
                                <div className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-lg border-2 border-[#020617] shadow-xl animate-bounce">
                                    <AlertTriangle size={12} className="text-white" />
                                </div>
                            )}
                          </div>
                          <div>
                              <p className="font-black text-white text-sm italic tracking-tight">{c.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <Users size={12} className="text-slate-600" />
                                  <p className="text-[10px] text-slate-500 font-bold uppercase">{c.memberCount.toLocaleString()} Üye</p>
                              </div>
                              {!c.telegram_id && <p className="text-[8px] text-red-500 font-black uppercase tracking-tighter mt-1">ID Eksik: Reklam Alamaz!</p>}
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
      
      <div className="mt-10 p-6 bg-blue-600/5 border border-blue-600/10 rounded-[32px]">
          <div className="flex items-center gap-3 mb-3 text-blue-500">
              <Info size={18} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Kanal Görünmüyor mu?</h4>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Eğer kanalınız listede yoksa, botun kanalda yönetici olduğundan ve en az bir mesaj paylaşıldığından emin olun. Sistem yeni sinyalleri otomatik yakalar.
          </p>
      </div>
    </div>
  );
};

export default MyChannels;
