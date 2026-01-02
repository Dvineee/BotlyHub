
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, Eye
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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
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
              const userData = user || { id: 'guest_user', first_name: 'User' };
              await DatabaseService.addUserBot(userData, bot, false);
              setIsOwned(true);
              notification('success');
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
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-40 animate-in fade-in selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-white/40 uppercase italic">Bot Bilgileri</span>
        <button className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
            <Share2 size={20} />
        </button>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 px-6 mb-12 flex flex-col items-center text-center">
        <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-blue-600/20 blur-[40px] rounded-full"></div>
            <img 
              src={getLiveBotIcon(bot)} 
              className="w-32 h-32 rounded-[40px] border border-white/10 shadow-2xl relative z-10 object-cover bg-slate-900"
              onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
            />
        </div>
        
        <h1 className="text-3xl font-black text-white tracking-tight mb-2 italic uppercase">{bot.name}</h1>
        <div className="flex items-center gap-2 mb-6">
            <span className="text-[9px] font-black px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                <ShieldCheck size={14} /> DOĞRULANMIŞ BOT
            </span>
        </div>
        
        <p className="max-w-xs text-sm text-slate-400 leading-relaxed font-bold uppercase italic opacity-70">
            {bot.description}
        </p>
      </div>

      {/* Features Grid */}
      <div className="px-6 mb-12">
          <div className="grid grid-cols-2 gap-4">
              <SaasFeature icon={Zap} title="Yüksek Hız" />
              <SaasFeature icon={Shield} title="Uçtan Uca Güvenli" />
          </div>
      </div>

      {/* Screenshots Gallery Section */}
      {screenshots.length > 0 && (
        <div className="mb-12">
            <div className="px-6 flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] flex items-center gap-2">
                    <Eye size={14} className="text-blue-500" /> EKRAN GÖRÜNTÜLERİ
                </h3>
                <span className="text-[10px] font-black text-slate-800 uppercase italic">{screenshots.length} GÖRSEL</span>
            </div>
            
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x snap-mandatory">
                {screenshots.map((url, index) => (
                    <div 
                        key={index} 
                        onClick={() => setFullscreenImage(url)}
                        className="min-w-[240px] max-w-[280px] aspect-[9/16] bg-slate-900 rounded-[32px] border border-white/5 overflow-hidden shadow-2xl snap-center shrink-0 active:scale-95 transition-all group relative cursor-pointer"
                    >
                        <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                            <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20">
                                <Maximize2 size={18} className="text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Bottom Sticky Action */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pb-10">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full h-18 py-5 rounded-[28px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 shadow-2xl border-b-4 ${
                    isOwned 
                    ? 'bg-blue-600 text-white border-blue-800 shadow-blue-600/30' 
                    : 'bg-white text-slate-950 border-slate-300 shadow-white/10'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={18} /> Botu Şimdi Başlat</> : (
                          bot.price === 0 ? <><PlusCircle size={18} /> Hemen Edin (Ücretsiz)</> : (
                              <div className="flex items-center gap-6">
                                  <div className="text-left leading-none">
                                      <p className="text-[8px] font-black text-slate-500 mb-1">TOPLAM TUTAR</p>
                                      <p className="text-lg font-black italic">{prices.ton} TON</p>
                                  </div>
                                  <div className="h-8 w-px bg-slate-200 opacity-20"></div>
                                  <div className="flex items-center gap-2">
                                      <span>Satın Al</span>
                                      <ChevronRight size={16} />
                                  </div>
                              </div>
                          )
                      )
                  )}
              </button>
          </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {fullscreenImage && (
          <div 
            className="fixed inset-0 z-[200] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-in fade-in"
            onClick={() => setFullscreenImage(null)}
          >
              <button className="absolute top-10 right-6 p-4 bg-white/5 rounded-2xl text-white z-[210]">
                  <X size={24} />
              </button>
              <div className="w-full max-w-sm h-[80vh] rounded-[48px] overflow-hidden border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                  <img src={fullscreenImage} className="w-full h-full object-contain bg-slate-950" alt="Full Preview" />
              </div>
              <p className="mt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Kapatmak için dokunun</p>
          </div>
      )}
    </div>
  );
};

const SaasFeature = ({ icon: Icon, title }: any) => (
    <div className="p-6 bg-slate-900/40 border border-white/5 rounded-3xl flex items-center gap-4 hover:border-blue-500/20 transition-all shadow-xl group">
        <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/5 text-blue-500 group-hover:scale-110 transition-transform">
            <Icon size={18} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight group-hover:text-white">{title}</span>
    </div>
);

export default BotDetail;
