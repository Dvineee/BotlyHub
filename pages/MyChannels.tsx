
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Megaphone, Users, Loader2, RefreshCw, AlertCircle, CheckCircle2, X, Bot as BotIcon, Info, Fingerprint, Zap, AlertTriangle, TrendingUp, MoreVertical } from 'lucide-react';
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
  const [openSettingsId, setOpenSettingsId] = useState<string | null>(null);
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

  const toggleAdMode = async (channelId: string) => {
      const channel = channels.find(c => c.id === channelId);
      if (!channel) return;

      const newStatus = !channel.isAdEnabled;
      haptic('medium');
      
      // UI Update
      setChannels(channels.map(c => 
        c.id === channelId ? { ...c, isAdEnabled: newStatus } : c
      ));

      try {
          await DatabaseService.updateChannelAdStatus(channelId, newStatus);
          if (user?.id) {
              await DatabaseService.logActivity(
                  user.id.toString(), 
                  'channel_sync', 
                  'Reklam Ayarı', 
                  'Kanal Reklam Modu Değişti', 
                  `'${channel.name}' kanalı için reklam modu ${newStatus ? 'AÇILDI' : 'KAPATILDI'}.`
              );
          }
      } catch (e) {
          // Rollback on error
          setChannels(channels.map(c => 
            c.id === channelId ? { ...c, isAdEnabled: !newStatus } : c
          ));
          notification('error');
          alert("Ayar kaydedilemedi.");
      }
  };

  return (
    <div className="min-h-screen bg-[#020617] p-4 pt-10 pb-32 animate-in fade-in" onClick={() => setOpenSettingsId(null)}>
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); navigate('/'); }} className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-slate-400 active:scale-90 transition-transform">
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
                onClick={(e) => { e.stopPropagation(); handleManualRefresh(); }} 
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
                onClick={(e) => { e.stopPropagation(); handleManualRefresh(); }} 
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
                  <div key={c.id} className="group relative bg-[#0f172a]/60 border border-slate-800 rounded-[32px] h-[110px] overflow-hidden transition-all hover:border-slate-700 shadow-xl animate-in slide-in-from-bottom-2">
                      <div className="p-5 flex items-center h-full pr-14 relative z-10">
                          <div className="relative shrink-0">
                            <img 
                                src={c.icon} 
                                className="w-16 h-16 rounded-2xl border border-slate-800 shadow-lg object-cover bg-slate-900" 
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
                          
                          <div className="ml-5 flex-1 min-w-0">
                              <p className="font-black text-white text-sm italic tracking-tight truncate">{c.name}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                  <div className="flex items-center gap-1">
                                      <Users size={10} className="text-slate-600" />
                                      <p className="text-[9px] text-slate-500 font-bold uppercase">{c.memberCount.toLocaleString()}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <div className={`w-1.5 h-1.5 rounded-full ${c.isAdEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></div>
                                      <span className={`text-[9px] font-black uppercase tracking-tight ${c.isAdEnabled ? 'text-emerald-400' : 'text-slate-600'}`}>
                                          {c.isAdEnabled ? 'REKLAM AÇIK' : 'REKLAM KAPALI'}
                                      </span>
                                  </div>
                              </div>
                              <p className="text-[10px] font-black text-emerald-500 mt-1">₺{c.revenue}</p>
                          </div>
                      </div>

                      {/* Botlarım sayfasındaki 'Yönet' butonuyla aynı yapı */}
                      <button 
                          onClick={(e) => { e.stopPropagation(); setOpenSettingsId(c.id); }}
                          className="absolute right-0 top-0 bottom-0 w-8 bg-slate-800 hover:bg-slate-750 border-l border-slate-700 flex flex-col items-center justify-center transition-all cursor-pointer z-20 group/btn"
                      >
                          <span className="text-[9px] font-black text-slate-500 group-hover/btn:text-slate-300 -rotate-90 whitespace-nowrap tracking-widest uppercase italic">Yönet</span>
                      </button>

                      {/* Settings Overlay - Botlarım sayfasıyla aynı tasarım */}
                      <div className={`absolute inset-0 z-30 transition-transform duration-300 ease-out flex items-center justify-center p-2 ${openSettingsId === c.id ? 'translate-x-0' : 'translate-x-full'}`}>
                           <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-sm"></div>
                           <div className="w-full h-full flex items-center justify-center gap-4 relative z-40">
                                <div 
                                    onClick={(e) => { e.stopPropagation(); toggleAdMode(c.id); }}
                                    className={`cursor-pointer rounded-2xl px-6 py-4 flex items-center gap-4 border transition-all active:scale-95 ${
                                        c.isAdEnabled ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800 border-slate-700'
                                    }`}
                                >
                                    <TrendingUp size={20} className={c.isAdEnabled ? 'text-emerald-400' : 'text-slate-500'} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${c.isAdEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>Reklam Modu</span>
                                </div>
                                <div className="p-4 bg-slate-800 rounded-2xl text-slate-500 hover:text-white transition-colors cursor-pointer border border-slate-700" onClick={(e) => { e.stopPropagation(); setOpenSettingsId(null); }}>
                                    <X size={20} />
                                </div>
                           </div>
                      </div>
                  </div>
              ))}
          </div>
      )}
      
      <div className="mt-10 p-6 bg-blue-600/5 border border-blue-600/10 rounded-[32px]">
          <div className="flex items-center gap-3 mb-3 text-blue-500">
              <Info size={18} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Akıllı Reklam Dağıtımı</h4>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Kanalınızda birden fazla bot bağlıysa, reklamlar otomatik olarak optimize edilir. Her reklam sadece bir bot tarafından paylaşılır, böylece kanalınız spamden korunur. Reklam Modu kapalıysa o kanal için hiçbir bot reklam yayınlamaz.
          </p>
      </div>
    </div>
  );
};

export default MyChannels;
