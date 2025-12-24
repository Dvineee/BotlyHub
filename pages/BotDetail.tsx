
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, Star, ShieldCheck, 
  Bot as BotIcon, Lock, CheckCircle2, Megaphone, Users, 
  Zap, Info, ExternalLink, Settings, Terminal, PlusCircle, 
  RefreshCw, Globe, Sparkles, Layout, Image as ImageIcon,
  ArrowRight, Shield
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, UserBot, Channel } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService, supabase } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTranslation } from '../TranslationContext';

const { useNavigate, useParams } = Router as any;

const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`;
};

const BotDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { haptic, user, notification, tg } = useTelegram();
  const { t } = useTranslation();
  
  const [bot, setBot] = useState<Bot | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [botChannels, setBotChannels] = useState<Channel[]>([]);
  const [tonRate, setTonRate] = useState(250);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const realtimeSubscription = useRef<any>(null);

  useEffect(() => {
    fetchBotData();
    PriceService.getTonPrice().then(p => setTonRate(p.tonTry));
    if (isOwned && user?.id) {
        loadBotChannels();
        setupRealtime();
    }
    return () => {
        if (realtimeSubscription.current) supabase.removeChannel(realtimeSubscription.current);
    };
  }, [id, user, isOwned]);

  const setupRealtime = () => {
      if (!user?.id) return;
      const uId = String(user.id);
      realtimeSubscription.current = supabase
          .channel('bot_sync_' + id)
          .on('postgres_changes', { 
              event: 'INSERT', 
              schema: 'public', 
              table: 'bot_discovery_logs',
              filter: `owner_id=eq.${uId}` 
          }, () => {
              handleSync();
          })
          .subscribe();
  };

  const fetchBotData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
        const data = await DatabaseService.getBotById(id);
        setBot(data);

        if (user?.id) {
            const dbBots = await DatabaseService.getUserBots(user.id.toString());
            const owned = dbBots.some(b => b.id === id);
            setIsOwned(owned);
        }
    } catch (e) {
        console.error("Bot detayı yükleme hatası:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const loadBotChannels = async () => {
      if (!user?.id || !id) return;
      const allChannels = await DatabaseService.getChannels(user.id.toString());
      setBotChannels(allChannels.filter(c => c.connectedBotIds.includes(id)));
  };

  const handleSync = async () => {
      if (!user?.id) return;
      setIsSyncing(true);
      await DatabaseService.syncChannelsFromBotActivity(user.id.toString());
      await loadBotChannels();
      setIsSyncing(false);
  };

  const handleAction = async () => {
      if (isProcessing || !bot) return;
      haptic('medium');
      
      if (isOwned) {
          const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
          const finalUrl = `https://t.me/${username}`;
          if (tg?.openTelegramLink) tg.openTelegramLink(finalUrl);
          else window.open(finalUrl, '_blank');
          return;
      }
      
      if (bot.price === 0) {
          setIsProcessing(true);
          try {
              const userData = user || { id: 'guest_user', first_name: 'Misafir' };
              await DatabaseService.addUserBot(userData, bot, false);
              setIsOwned(true);
              notification('success');
              haptic('heavy');
          } catch (e: any) {
              alert("İşlem başarısız: " + e.message);
          } finally {
              setIsProcessing(false);
          }
      } else {
          navigate(`/payment/${id}`);
      }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500/50" size={32} />
    </div>
  );

  if (!bot) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-10 text-center">
        <h2 className="text-white font-bold text-lg mb-4">Bot Bulunamadı</h2>
        <button onClick={() => navigate('/')} className="text-blue-500 text-sm font-bold">Geri Dön</button>
    </div>
  );

  const prices = PriceService.convert(bot.price, tonRate);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-32 animate-in fade-in selection:bg-blue-500/30">
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
        </button>
        <span className="text-xs font-bold tracking-tight text-white/80">{isOwned ? 'Kontrol Paneli' : 'Bot Detayları'}</span>
        <button onClick={() => { haptic('light'); alert("Link kopyalandı!"); }} className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
            <Share2 size={20} />
        </button>
      </nav>

      <div className="pt-24 px-6 mb-12 flex flex-col items-center text-center">
        <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-blue-600/20 blur-[40px] rounded-full group-hover:bg-blue-600/30 transition-all"></div>
            <img 
              src={getLiveBotIcon(bot)} 
              className="w-32 h-32 rounded-[32px] border border-white/10 shadow-2xl relative z-10 object-cover bg-slate-900"
              onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
            />
            {isOwned && (
                <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl shadow-lg border-4 border-[#020617] z-20">
                    <CheckCircle2 size={16} className="text-white" />
                </div>
            )}
        </div>
        
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{bot.name}</h1>
        <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 uppercase tracking-widest">{bot.category}</span>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} /> DOĞRULANDI
            </span>
        </div>
        
        <p className="max-w-xs text-sm text-slate-400 leading-relaxed font-medium">
            {bot.description || 'Bu botun henüz bir açıklaması bulunmuyor.'}
        </p>
      </div>

      {bot.screenshots && bot.screenshots.length > 0 && (
          <section className="mb-16">
              <div className="px-8 flex items-center gap-3 mb-6">
                  <ImageIcon size={18} className="text-blue-500" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Görünüm</h3>
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar px-8 snap-x">
                  {bot.screenshots.map((src, idx) => (
                      <div key={idx} className="min-w-[280px] h-[500px] rounded-[32px] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl snap-center group">
                          <img 
                            src={src} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                            loading="lazy"
                            onError={(e) => { (e.target as any).parentElement.style.display = 'none'; }}
                          />
                      </div>
                  ))}
              </div>
          </section>
      )}

      <div className="px-8">
          {isOwned ? (
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <Terminal size={18} className="text-blue-500" />
                          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Kurulum</h3>
                      </div>
                      <div className="space-y-4">
                          <InstructionItem num="01" title="Yönetici Yapın" desc="Botu kanalınıza ekleyip tam yetki verin." />
                          <InstructionItem num="02" title="Tetikleyin" desc="Kanalınızda /start komutunu gönderin." />
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Megaphone size={18} className="text-purple-500" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Aktif Sinyaller</h3>
                        </div>
                        {isSyncing && <Loader2 size={14} className="animate-spin text-blue-500" />}
                      </div>

                      {botChannels.length === 0 ? (
                          <div className="py-12 border border-white/5 rounded-3xl bg-white/2 bg-slate-900/40 text-center">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 italic">Sinyal bekleniyor...</p>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {botChannels.map(c => (
                                  <div key={c.id} className="flex items-center justify-between p-4 bg-slate-900/50 border border-white/5 rounded-2xl">
                                      <div className="flex items-center gap-4">
                                          <img src={c.icon} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                                          <div>
                                              <p className="text-xs font-bold text-white">{c.name}</p>
                                              <p className="text-[9px] font-bold text-slate-500 uppercase">{c.memberCount.toLocaleString()} Üye</p>
                                          </div>
                                      </div>
                                      <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                                          <CheckCircle2 size={16} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              </div>
          ) : (
              <div className="space-y-12 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      <SaasFeature icon={Zap} title="Yüksek Hız" />
                      <SaasFeature icon={Shield} title="Güvenli Altyapı" />
                      <SaasFeature icon={Globe} title="Global Destek" />
                      <SaasFeature icon={Layout} title="Kolay Panel" />
                  </div>

                  <div className="p-8 border border-white/5 bg-slate-900/50 rounded-[32px]">
                      <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-4">Neden Bu Bot?</h4>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                          "{bot.name}", kanal yönetimini basitleştirmek ve etkileşimi artırmak için SaaS standartlarında geliştirilmiş profesyonel bir araçtır.
                      </p>
                  </div>
              </div>
          )}
      </div>

      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full h-16 rounded-2xl text-[11px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 ${
                    isOwned 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'bg-white text-slate-950 shadow-xl'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={18} /> Botu Başlat</> : (
                          bot.price === 0 ? <><PlusCircle size={18} /> Ücretsiz Edin</> : (
                              <div className="flex items-center gap-4">
                                  <div className="flex flex-col items-center">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">TON Wallet</span>
                                      <span className="text-sm font-black italic">{prices.ton} TON</span>
                                  </div>
                              </div>
                          )
                      )
                  )}
              </button>
          </div>
      </div>
    </div>
  );
};

const InstructionItem = ({ num, title, desc }: { num: string, title: string, desc: string }) => (
    <div className="flex gap-4">
        <span className="text-[10px] font-black text-blue-500/40 mt-0.5">{num}</span>
        <div>
            <h4 className="text-xs font-bold text-white mb-1">{title}</h4>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

const SaasFeature = ({ icon: Icon, title }: any) => (
    <div className="p-5 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-colors">
        <div className="text-blue-500">
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{title}</span>
    </div>
);

export default BotDetail;
