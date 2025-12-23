
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, Star, ShieldCheck, 
  Bot as BotIcon, Lock, CheckCircle2, Megaphone, Users, 
  Zap, Info, ExternalLink, Settings, Terminal, PlusCircle, 
  RefreshCw, Globe, Sparkles, Layout, Image as ImageIcon
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, UserBot, Channel } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService, supabase } from '../services/DatabaseService';
import { useTranslation } from '../TranslationContext';

const { useNavigate, useParams } = Router as any;

/**
 * CANLI TELEGRAM GÖRSELİ:
 * Her zaman botun kullanıcı adı üzerinden en güncel profil resmini çeker.
 */
const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`;
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
  const [isSyncing, setIsSyncing] = useState(false);
  
  const realtimeSubscription = useRef<any>(null);

  useEffect(() => {
    fetchBotData();
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
          const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').trim();
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
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">Veriler Çekiliyor...</p>
    </div>
  );

  if (!bot) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-10 text-center">
        <Info size={48} className="text-slate-800 mb-6" />
        <h2 className="text-white font-black uppercase italic tracking-tighter text-xl">Bot Bulunamadı</h2>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-4 bg-slate-900 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest">Markete Dön</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] pb-44 animate-in fade-in overflow-x-hidden">
      {/* Dynamic Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-2xl border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 active:scale-90 transition-transform">
            <ChevronLeft size={20} />
        </button>
        <div className="flex flex-col items-center max-w-[150px]">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] truncate">{bot.name}</span>
            <div className="h-0.5 w-4 bg-blue-600 mt-0.5 rounded-full"></div>
        </div>
        <button 
            onClick={() => { haptic('light'); alert("Bot linki kopyalandı!"); }} 
            className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 active:scale-90 transition-transform"
        >
            <Share2 size={20} />
        </button>
      </div>

      <div className="px-6 mt-8">
          {/* Main Hero Card */}
          <div className="bg-gradient-to-b from-[#0f172a] to-[#020617] border border-slate-800 rounded-[48px] p-8 relative overflow-hidden shadow-2xl mb-12">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 blur-[60px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col items-center text-center relative z-10">
                  <div className="relative mb-6">
                      <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-110"></div>
                      <img 
                        src={getLiveBotIcon(bot)} 
                        className={`w-32 h-32 rounded-[40px] shadow-2xl border-4 transition-all relative z-10 ${isOwned ? 'border-blue-500/40' : 'border-slate-800'}`} 
                        onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#020617] p-2 rounded-2xl border-2 border-slate-800 z-20">
                          <CheckCircle2 size={18} className="text-emerald-500" />
                      </div>
                  </div>
                  
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-3">{bot.name}</h2>
                  
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                      <span className="text-[8px] font-black px-3 py-1.5 rounded-xl bg-slate-900 text-slate-500 border border-slate-800 uppercase tracking-widest italic">{bot.category}</span>
                      <span className="text-[8px] font-black px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-600/20 uppercase tracking-widest italic flex items-center gap-1.5">
                          <ShieldCheck size={10} /> Verified Sync
                      </span>
                  </div>
              </div>
          </div>

          {/* Screenshot Gallery - GÖRSELLER BURADA LİSTELENİR */}
          {bot.screenshots && bot.screenshots.length > 0 && (
              <section className="mb-12">
                  <div className="flex justify-between items-center mb-6 px-2">
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                          <ImageIcon size={14} className="text-blue-500" /> Bot Galerisi
                      </h3>
                  </div>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
                      {bot.screenshots.map((src, idx) => (
                          <div key={idx} className="min-w-[160px] h-[280px] bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800 shadow-xl shrink-0 group">
                              <img 
                                src={src} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                loading="lazy"
                                onError={(e) => { (e.target as any).style.display = 'none'; }}
                              />
                          </div>
                      ))}
                  </div>
              </section>
          )}

          {isOwned ? (
              /* OWNED VIEW - YÖNETİM PANELİ */
              <div className="space-y-12 animate-in slide-in-from-bottom-4">
                  <section>
                      <div className="flex justify-between items-center mb-6 px-2">
                          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                            <Terminal size={14} className="text-blue-500" /> Kurulum & Aktivasyon
                          </h3>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800 rounded-[36px] p-8 space-y-8 shadow-inner">
                          <Step number="1" text="Botu kanalınıza 'Yönetici' olarak ekleyin." />
                          <Step number="2" text="Bota mesaj gönderme ve düzenleme yetkisi verin." />
                          <Step number="3" text="Kanalda /start komutunu gönderin." />
                          <div className="pt-2">
                              <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-5 flex items-start gap-4">
                                  <Zap size={20} className="text-blue-500 shrink-0 mt-0.5 animate-pulse" />
                                  <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                                      Bot "/start" komutunu aldığında sistem otomatik olarak eşleşecek ve kanalınız "Kanallarım" sekmesine eklenecektir.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </section>

                  <section>
                      <div className="flex justify-between items-center mb-6 px-2">
                          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3 italic">
                            <Megaphone size={14} className="text-purple-500" /> Sinyal Veren Kanallar ({botChannels.length})
                          </h3>
                          {isSyncing && <Loader2 size={14} className="animate-spin text-blue-500" />}
                      </div>
                      
                      {botChannels.length === 0 ? (
                          <div className="text-center py-16 bg-slate-900/20 rounded-[36px] border-2 border-dashed border-slate-900">
                              <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest italic">Henüz bir kanal sinyali algılanmadı.</p>
                              <button onClick={handleSync} className="mt-4 text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">YENİDEN TARA</button>
                          </div>
                      ) : (
                          <div className="space-y-4">
                              {botChannels.map(c => (
                                  <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-lg">
                                      <div className="flex items-center gap-4">
                                          <img src={c.icon} className="w-12 h-12 rounded-2xl object-cover bg-slate-800 border border-slate-700 shadow-md" />
                                          <div>
                                              <p className="font-black text-white text-xs italic">{c.name}</p>
                                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{c.memberCount.toLocaleString()} Üye</p>
                                          </div>
                                      </div>
                                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                          <CheckCircle2 size={18} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </section>
              </div>
          ) : (
              /* MARKET VIEW - TANITIM SAYFASI */
              <div className="space-y-12 animate-in fade-in">
                  <section>
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-2 italic">Hakkında</h3>
                      <div className="bg-slate-900/40 border border-slate-800 rounded-[36px] p-8">
                          <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                              {bot.description || 'Bu bot hakkında detaylı açıklama bulunmuyor.'}
                          </p>
                      </div>
                  </section>
                  
                  <section>
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 px-2 italic">Sistem Yetenekleri</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <FeatureCard icon={Zap} title="Hızlı Sync" desc="Anlık veri akışı" />
                          <FeatureCard icon={ShieldCheck} title="Güvenli" desc="Admin koruması" />
                          <FeatureCard icon={Globe} title="Global" desc="Her dilde uyum" />
                          <FeatureCard icon={Layout} title="Esnek" desc="Kolay yönetim" />
                      </div>
                  </section>
              </div>
          )}
      </div>

      {/* FIXED FOOTER ACTION BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-40">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full py-6 rounded-[32px] text-white font-black text-[12px] uppercase tracking-[0.4em] italic shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isOwned ? 'bg-blue-600 shadow-blue-900/40' : 'bg-[#7c3aed] shadow-purple-900/40'} disabled:opacity-50`}
              >
                  {isProcessing ? <Loader2 className="animate-spin"/> : (
                      isOwned ? <><Send size={20} /> Botu Telegram'da Aç</> : (
                          bot.price === 0 ? <><PlusCircle size={20} /> Kütüphaneye Ücretsiz Ekle</> : <><Star size={20} fill="currentColor"/> STARS {bot.price} - Satın Al</>
                      )
                  )}
              </button>
              <p className="text-center text-[9px] text-slate-700 font-black uppercase tracking-[0.5em] mt-5 italic">
                  {isOwned ? 'Protocol: SECURE_OWNERSHIP_VALIDATED' : 'Protocol: SYNC_MARKET_PROTOCOL_V3'}
              </p>
          </div>
      </div>
    </div>
  );
};

const Step = ({ number, text }: { number: string, text: string }) => (
    <div className="flex gap-5 items-center">
        <div className="w-8 h-8 rounded-2xl bg-[#020617] border border-slate-800 flex items-center justify-center text-[12px] font-black text-blue-500 shadow-inner shrink-0 italic">{number}</div>
        <p className="text-[12px] text-slate-300 font-bold italic tracking-tight leading-snug">{text}</p>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[28px] flex flex-col gap-3 shadow-lg hover:border-slate-700 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-[#020617] border border-slate-800 flex items-center justify-center text-blue-500 shadow-inner">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[11px] font-black text-white uppercase tracking-tight italic">{title}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{desc}</p>
        </div>
    </div>
);

export default BotDetail;
