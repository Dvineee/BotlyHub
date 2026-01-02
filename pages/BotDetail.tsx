
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
  
  useEffect(() => {
    fetchBotData();
    PriceService.getTonPrice().then(p => setTonRate(p.tonTry));
    if (isOwned && user?.id) {
        loadBotChannels();
    }
  }, [id, user, isOwned]);

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
      
      // Ücretsiz botlar için direkt ekleme, ücretliler için ödeme sayfasına yönlendirme
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

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-32 animate-in fade-in selection:bg-blue-500/30">
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={24} />
        </button>
        <span className="text-xs font-bold tracking-tight text-white/80">{isOwned ? 'Kontrol Paneli' : 'Bot Detayları'}</span>
        <button className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
            <Share2 size={20} />
        </button>
      </nav>

      <div className="pt-24 px-6 mb-12 flex flex-col items-center text-center">
        <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-blue-600/20 blur-[40px] rounded-full"></div>
            <img 
              src={getLiveBotIcon(bot)} 
              className="w-32 h-32 rounded-[32px] border border-white/10 shadow-2xl relative z-10 object-cover bg-slate-900"
              onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
            />
        </div>
        
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">{bot.name}</h1>
        <div className="flex items-center gap-2 mb-6">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} /> DOĞRULANDI
            </span>
        </div>
        
        <p className="max-w-xs text-sm text-slate-400 leading-relaxed font-medium">
            {bot.description}
        </p>
      </div>

      <div className="px-8">
          <div className="grid grid-cols-2 gap-4">
              <SaasFeature icon={Zap} title="Yüksek Hız" />
              <SaasFeature icon={Shield} title="Güvenli Altyapı" />
          </div>
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

const SaasFeature = ({ icon: Icon, title }: any) => (
    <div className="p-5 bg-white/2 border border-white/5 rounded-2xl flex items-center gap-3">
        <Icon size={18} className="text-blue-500" />
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight">{title}</span>
    </div>
);

export default BotDetail;
