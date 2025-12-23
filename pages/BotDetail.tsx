
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, Star, ShieldCheck, 
  Bot as BotIcon, Lock, CheckCircle2, Megaphone, Users, 
  Zap, Info, ExternalLink, Settings, Terminal, PlusCircle, RefreshCw
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, UserBot, Channel } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService, supabase } from '../services/DatabaseService';
import { useTranslation } from '../TranslationContext';

const { useNavigate, useParams } = Router as any;

/**
 * Telegram üzerinden güncel profil resmini çeken yardımcı fonksiyon
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
      const uId = String(user.id);
      realtimeSubscription.current = supabase
          .channel('bot_sync')
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
        console.error("Bot detayı hatası:", e);
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
              const userData = user || { id: 'test_user', first_name: 'Misafir' };
              await DatabaseService.addUserBot(userData, bot, false);
              setIsOwned(true);
              notification('success');
              haptic('heavy');
          } catch (e: any) {
              alert("Hata: " + e.message);
          } finally {
              setIsProcessing(false);
          }
      } else {
          navigate(`/payment/${id}`);
      }
  };

  if (isLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (!bot) return <div className="min-h-screen bg-[#020617] text-white p-20 text-center font-bold opacity-20">BOT_NOT_FOUND</div>;

  return (
    <div className="min-h-screen bg-[#020617] pb-40 animate-in fade-in">
      <div className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-900/50">
        <button onClick={() => navigate(-1)} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><ChevronLeft size={22} /></button>
        <h1 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] truncate px-4">{isOwned ? 'Yönetim Paneli' : 'Bot Tanıtımı'}</h1>
        <button onClick={() => { haptic('light'); alert("Paylaşım linki kopyalandı!"); }} className="p-2.5 bg-slate-900/50 rounded-full border border-slate-800 text-slate-400 active:scale-90 transition-transform"><Share2 size={22} /></button>
      </div>

      <div className="px-6 mt-10">
          {/* Main Bot Card */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-[44px] p-8 relative overflow-hidden shadow-2xl mb-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full"></div>
              <div className="flex flex-col items-center text-center relative z-10">
                  <img 
                    src={getLiveBotIcon(bot)} 
                    className={`w-32 h-32 rounded-[40px] shadow-2xl border-4 transition-all mb-6 ${isOwned ? 'border-blue-500/50' : 'border-slate-800'}`} 
                    onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                  />
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{bot.name}</h2>
                  <div className="flex gap-2 mt-4">
                      <span className="text-[8px] font-black px-3 py-1.5 rounded-lg bg-slate-950 text-slate-500 border border-slate-800 uppercase tracking-widest">{bot.category}</span>
                      <span className="text-[8px] font-black px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">Doğrulanmış Bot</span>
                  </div>
              </div>
          </div>

          {isOwned ? (
              <div className="space-y-10 animate-in slide-in-from-bottom-4">
                  <section>
                      <div className="flex justify-between items-center mb-6 px-2">
                          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Terminal size={14} className="text-blue-500" /> Kurulum Rehberi
                          </h3>
                      </div>
                      <div className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 space-y-6">
                          <Step number="1" text="Botu kanalınıza 'Yönetici' olarak ekleyin." />
                          <Step number="2" text="Bota tüm yetkileri verdiğinizden emin olun." />
                          <Step number="3" text="Kanalda /start komutunu gönderin." />
                          <div className="pt-2">
                              <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 flex items-start gap-3">
                                  <Zap size={18} className="text-blue-500 shrink-0 mt-0.5" />
                                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                      Bot "/start" komutunu aldığında "Bağlantı sağlanıyor..." mesajı verecek ve kanalınız buraya otomatik eklenecektir.
                                  </p>
                              </div>
                          </div>
                      </div>
                  </section>

                  <section>
                      <div className="flex justify-between items-center mb-6 px-2">
                          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            <Megaphone size={14} className="text-purple-500" /> Aktif Kanallarınız ({botChannels.length})
                          </h3>
                          {isSyncing && <Loader2 size={14} className="animate-spin text-blue-500" />}
                      </div>
                      
                      {botChannels.length === 0 ? (
                          <div className="text-center py-12 bg-slate-900/20 rounded-[32px] border-2 border-dashed border-slate-800">
                              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Bağlı kanal bulunamadı</p>
                              <p className="text-[9px] text-slate-700 mt-1 italic font-medium">Henüz sinyal yakalanmadı.</p>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {botChannels.map(c => (
                                  <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                                      <div className="flex items-center gap-4">
                                          <img src={c.icon} className="w-10 h-10 rounded-xl object-cover bg-slate-800" />
                                          <div>
                                              <p className="font-black text-white text-xs italic">{c.name}</p>
                                              <p className="text-[9px] text-slate-500 font-bold uppercase">{c.memberCount} Üye</p>
                                          </div>
                                      </div>
                                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                          <CheckCircle2 size={16} />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </section>
              </div>
          ) : (
              <div className="space-y-10 animate-in fade-in">
                  <section>
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4 px-2 italic">Açıklama</h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium px-2">
                          {bot.description}
                      </p>
                  </section>
                  
                  <section>
                      <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-6 px-2 italic">Öne Çıkan Özellikler</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <FeatureCard icon={Zap} title="Hızlı İşlem" desc="Anlık tepki süresi" />
                          <FeatureCard icon={ShieldCheck} title="Güvenli" desc="Uçtan uca şifreli" />
                      </div>
                  </section>
              </div>
          )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-30">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full py-6 rounded-[32px] text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${isOwned ? 'bg-blue-600 shadow-blue-900/40' : 'bg-[#7c3aed] shadow-purple-900/40'} disabled:opacity-50`}
              >
                  {isProcessing ? <Loader2 className="animate-spin"/> : (
                      isOwned ? <><Send size={18} /> Botu Telegram'da Aç</> : (
                          bot.price === 0 ? <><PlusCircle size={18} /> Kütüphaneye Ücretsiz Ekle</> : <><Star size={18} fill="currentColor"/> Stars {bot.price} - Satın Al</>
                      )
                  )}
              </button>
              <p className="text-center text-[9px] text-slate-700 font-black uppercase tracking-widest mt-4 italic">
                  {isOwned ? 'Mülkiyet Onaylandı - Aktif Kullanım' : 'BotlyHub Secure Sync Protocol'}
              </p>
          </div>
      </div>
    </div>
  );
};

const Step = ({ number, text }: { number: string, text: string }) => (
    <div className="flex gap-4 items-center">
        <div className="w-6 h-6 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-[10px] font-black text-blue-500 shadow-inner shrink-0">{number}</div>
        <p className="text-[11px] text-slate-300 font-bold italic tracking-tight">{text}</p>
    </div>
);

const FeatureCard = ({ icon: Icon, title, desc }: any) => (
    <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col gap-2">
        <Icon size={18} className="text-blue-500" />
        <div>
            <p className="text-[10px] font-black text-white uppercase tracking-tight">{title}</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase">{desc}</p>
        </div>
    </div>
);

export default BotDetail;
