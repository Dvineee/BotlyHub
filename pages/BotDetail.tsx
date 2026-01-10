
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, Eye, Lock, Unlock, AlertTriangle
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, Channel } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
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
  const [tonRate, setTonRate] = useState(250);
  
  useEffect(() => {
    fetchBotData();
    PriceService.getTonPrice().then(p => setTonRate(p.tonTry));
  }, [id, user]);

  const fetchBotData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
        const data = await DatabaseService.getBotById(id);
        setBot(data);

        if (user?.id) {
            // Gerçek zamanlı veritabanı kontrolü
            const owned = await DatabaseService.isBotOwnedByUser(user.id.toString(), id);
            setIsOwned(owned);
        }
    } catch (e) {
        console.error("Bot detayı yükleme hatası:", e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleAction = async () => {
      if (isProcessing || !bot) return;
      haptic('medium');
      
      // Çift Kontrol: Veritabanından tekrar doğrula
      if (user?.id) {
          const stillOwned = await DatabaseService.isBotOwnedByUser(user.id.toString(), bot.id);
          if (isOwned && !stillOwned) {
              setIsOwned(false);
              haptic('rigid');
              alert("Lisansınızın süresi dolmuş veya iptal edilmiş.");
              return;
          }
      }

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
              const userData = user || { id: 'guest_user', first_name: 'User' };
              await DatabaseService.addUserBot(userData, bot, false);
              setIsOwned(true);
              
              // OTOMATİK BİLDİRİM GÖNDERİMİ (Ücretsiz Edinme)
              await DatabaseService.sendUserNotification(
                  userData.id.toString(),
                  'Yeni Bot Edinildi',
                  `'${bot.name}' kütüphanenize başarıyla eklendi. Şimdi 'Botlarım' sayfasından yönetebilirsiniz.`,
                  'bot'
              );

              notification('success');
              // Log activity
              await DatabaseService.logActivity(userData.id.toString(), 'bot_manage', 'BOT_ACQUIRED', 'Ücretsiz Bot Edinildi', `'${bot.name}' kütüphaneye eklendi.`);
          } catch (e: any) {
              alert("İşlem başarısız.");
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

  if (!bot) return null;

  const prices = PriceService.convert(bot.price, tonRate);
  const screenshots = bot.screenshots || [];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-40 animate-in fade-in">
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOwned ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></span>
            <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">
                {isOwned ? 'Lisans Onaylı' : 'Erişim Yok'}
            </span>
        </div>
        <button className="p-2 -mr-2 text-slate-400">
            <Share2 size={20} />
        </button>
      </nav>

      <div className="pt-24 px-6 mb-12 flex flex-col items-center text-center">
        <div className="relative mb-8 group">
            <div className={`absolute inset-0 blur-[60px] rounded-full transition-all duration-700 ${isOwned ? 'bg-emerald-600/20 scale-125' : 'bg-blue-600/10'}`}></div>
            <img 
              src={getLiveBotIcon(bot)} 
              className={`w-32 h-32 rounded-[40px] border shadow-2xl relative z-10 object-cover bg-slate-900 transition-all duration-500 ${isOwned ? 'border-emerald-500/30 rotate-3' : 'border-white/10'}`}
              onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
            />
            <div className={`absolute -bottom-3 -right-3 p-3 rounded-2xl border-4 border-[#020617] shadow-2xl z-20 transition-all duration-500 ${isOwned ? 'bg-emerald-500 text-white rotate-0' : 'bg-slate-800 text-slate-500 -rotate-12'}`}>
                {isOwned ? <Unlock size={20} /> : <Lock size={20} />}
            </div>
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight mb-4 italic uppercase">{bot.name}</h1>
        <div className="flex items-center gap-2 justify-center mb-8">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg border border-white/5">{bot.category}</span>
            {bot.price > 0 && <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/10">PREMIUM</span>}
        </div>

        <div className="max-w-xs mx-auto p-6 bg-slate-900/40 rounded-[32px] border border-white/5 relative overflow-hidden">
            <p className="text-xs text-slate-400 leading-relaxed font-bold uppercase italic opacity-80">
                {bot.description}
            </p>
        </div>
      </div>

      <div className="px-6 space-y-4 mb-12">
          {isOwned ? (
              <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] flex items-center gap-5 animate-in slide-in-from-bottom-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                      <ShieldCheck size={24} />
                  </div>
                  <div className="flex-1">
                      <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">KÜTÜPHANENİZDE</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase italic">Bot tam yetkiyle kullanıma hazır.</p>
                  </div>
                  <Unlock size={18} className="text-emerald-500/30" />
              </div>
          ) : (
              <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[32px] flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-600 border border-white/5">
                      <Lock size={24} />
                  </div>
                  <div className="flex-1">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ERİŞİM KİLİTLİ</p>
                      <p className="text-[10px] text-slate-600 font-bold uppercase italic">Botu kullanmak için lisans almalısınız.</p>
                  </div>
                  <AlertTriangle size={18} className="text-amber-500/40" />
              </div>
          )}
      </div>

      {screenshots.length > 0 && (
        <div className="mb-12">
            <div className="px-8 flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] flex items-center gap-2">
                    <Eye size={14} className="text-blue-500" /> VİTRİN
                </h3>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x">
                {screenshots.map((url, index) => (
                    <div key={index} className="min-w-[240px] aspect-[9/16] bg-slate-900 rounded-[32px] border border-white/5 overflow-hidden snap-center group">
                        <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="Preview" />
                    </div>
                ))}
            </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pb-10">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-2xl border-b-8 ${
                    isOwned 
                    ? 'bg-emerald-600 text-white border-emerald-800 shadow-emerald-600/30' 
                    : 'bg-white text-slate-950 border-slate-300 shadow-white/10'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={20} /> BOTU ŞİMDİ BAŞLAT</> : (
                          bot.price === 0 ? <><PlusCircle size={20} /> ÜCRETSİZ EDİN</> : (
                              <div className="flex items-center gap-8">
                                  <div className="text-left">
                                      <p className="text-[8px] font-black text-slate-500 mb-1 uppercase">LİSANS BEDELİ</p>
                                      <p className="text-lg font-black italic tracking-tighter">{prices.ton} TON</p>
                                  </div>
                                  <div className="h-10 w-px bg-slate-200/20"></div>
                                  <span className="flex items-center gap-2">SATIN AL <ChevronRight size={18} /></span>
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

export default BotDetail;
