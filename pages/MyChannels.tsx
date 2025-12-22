
import { useState, useEffect } from 'react';
import { ChevronLeft, Megaphone, Users, Loader2, RefreshCw, AlertCircle, CheckCircle2, X, Bot as BotIcon, Info } from 'lucide-react';
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
  const [autoSyncStatus, setAutoSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
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
      try {
          const uId = user.id.toString();
          // 1. Önce mevcutları çek
          const initialData = await DatabaseService.getChannels(uId);
          setChannels(initialData);
          
          // 2. Ardından senkronizasyonu tetikle
          await triggerSync();
      } catch (e) {
          console.error("Init Channels Error:", e);
      } finally {
          setIsLoading(false);
      }
  };

  const triggerSync = async () => {
      if (!user?.id) return;
      const uId = user.id.toString();
      setAutoSyncStatus('syncing');
      
      try {
          console.log("[MyChannels] Sync başlatılıyor...");
          const newSyncedCount = await DatabaseService.syncChannelsFromBotActivity(uId);
          
          // Senkronizasyon başarılı olsun ya da olmasın, listeyi her zaman en güncel haliyle çek
          const refreshedData = await DatabaseService.getChannels(uId);
          setChannels(refreshedData);

          if (newSyncedCount > 0) {
              notification('success');
              setAutoSyncStatus('done');
          } else {
              setAutoSyncStatus('idle');
          }
      } catch (e) {
          console.error("[MyChannels] Sync error:", e);
          setAutoSyncStatus('error');
      }
      
      setTimeout(() => setAutoSyncStatus('idle'), 3000);
  };

  const handleManualRefresh = async () => {
      setIsSyncing(true);
      haptic('medium');
      await triggerSync();
      setIsSyncing(false);
      
      if (channels.length === 0) {
          setShowGuide(true);
      }
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
        <button 
            onClick={handleManualRefresh} 
            disabled={isSyncing}
            className="p-3 bg-slate-900/60 border border-slate-800 rounded-2xl text-blue-400 active:scale-90 transition-all disabled:opacity-30"
        >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
        </button>
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
                  {autoSyncStatus === 'syncing' ? 'Bot sinyalleri taranıyor...' : 
                   autoSyncStatus === 'done' ? 'Senkronizasyon Tamam!' : 'Bağlantı hatası oluştu.'}
              </span>
          </div>
      )}

      {showGuide && (
          <div className="mb-8 p-6 bg-blue-600/5 border border-blue-500/20 rounded-[32px] animate-in zoom-in relative">
              <button onClick={() => setShowGuide(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"><X size={16}/></button>
              <div className="flex items-center gap-3 mb-5 text-blue-400">
                  <BotIcon size={24} className="animate-bounce" />
                  <p className="text-xs font-black uppercase tracking-tight italic">Neden Görünmüyor?</p>
              </div>
              <ul className="space-y-4">
                  <li className="flex gap-4">
                      <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-xs italic shadow-lg">1</div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Botun kanalınızda <b>Yönetici</b> yetkisi olduğundan emin olun.</p>
                  </li>
                  <li className="flex gap-4">
                      <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-xs italic shadow-lg">2</div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Kanalda <b>/start</b> yazdıktan sonra bu sayfayı sağ üstten yenileyin.</p>
                  </li>
                  <li className="flex gap-4">
                      <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-xs italic shadow-lg">3</div>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">Halen gelmiyorsa botu kanaldan çıkarıp tekrar ekleyin.</p>
                  </li>
              </ul>
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
                  <p className="text-[10px] text-slate-700 mt-2 italic font-medium">Sinyal algılandı uyarısı aldıysanız yenileyin.</p>
              </div>
              <button 
                onClick={handleManualRefresh} 
                className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-all active:scale-95"
              >
                  Yeniden Tara
              </button>
          </div>
      ) : (
          <div className="space-y-4">
              <div className="flex justify-between items-center mb-6 px-2">
                  <h2 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">Bağlı Kanallar ({channels.length})</h2>
              </div>
              {channels.map(c => (
                  <div key={c.id} className="bg-[#0f172a]/60 border border-slate-800 p-5 rounded-[32px] flex items-center justify-between group hover:bg-slate-900/60 transition-all shadow-xl animate-in slide-in-from-bottom-2">
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
              
              <div className="mt-12 p-8 border border-slate-900/50 rounded-[40px] bg-slate-900/10 flex flex-col items-center gap-4 text-center">
                  <Info className="text-slate-800" size={32} />
                  <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase tracking-widest px-4">
                      Veriler anlık olarak BotlyHub Engine üzerinden güncellenmektedir.
                  </p>
              </div>
          </div>
      )}
    </div>
  );
};

export default MyChannels;
