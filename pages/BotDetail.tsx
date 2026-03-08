
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, Eye, Lock, Unlock, AlertTriangle, 
  Sparkles, Star, Download, Info, CheckCircle2, Globe, Cpu
} from 'lucide-react';
import * as Router from 'react-router-dom';
import { Bot, Channel, User } from '../types';
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
            const owned = await DatabaseService.isBotOwnedByUser(user.id.toString(), id);
            setIsOwned(owned);
        }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
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
              
              // 1. Kullanıcıyı senkronize et (Eğer yoksa veritabanına kaydetmek için)
              // Bu adım Foreign Key hatalarını önler.
              const syncData: Partial<User> = {
                  id: userData.id.toString(),
                  name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                  username: userData.username || 'user',
                  avatar: userData.photo_url || `https://ui-avatars.com/api/?name=${userData.first_name}`,
                  role: 'User',
                  status: 'Active',
                  joinDate: new Date().toISOString()
              };
              await DatabaseService.syncUser(syncData);

              // 2. Botu kullanıcıya ekle
              await DatabaseService.addUserBot(userData, bot, false);
              
              // 3. Bildirim gönder (Bu işlem kritik değil, hata alsa bile süreci bozmamalı)
              try {
                  await DatabaseService.sendUserNotification(
                      userData.id.toString(),
                      'Kütüphaneye Eklendi',
                      `'${bot.name}' botu kütüphanenize başarıyla eklendi.`,
                      'bot'
                  );
              } catch (noteErr) {
                  console.warn("Bildirim gönderilemedi ancak bot eklendi.", noteErr);
              }

              setIsOwned(true);
              notification('success');
          } catch (e: any) {
              console.error("Action failed:", e);
              alert("İşlem başarısız: " + (e.message || "Lütfen tekrar deneyin."));
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
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-40 animate-in fade-in">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400">
            <ChevronLeft size={24} />
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-white/20 uppercase italic">Uygulama Detayı</span>
        <button className="p-2 -mr-2 text-slate-400">
            <Share2 size={20} />
        </button>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 px-6 flex items-start gap-5 mb-10">
        <div className="relative shrink-0">
            <img 
              src={getLiveBotIcon(bot)} 
              className="w-24 h-24 rounded-[24px] border border-white/10 shadow-2xl object-cover bg-slate-900" 
              onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
            />
            {isOwned && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg border-2 border-[#020617]">
                    <CheckCircle2 size={14} />
                </div>
            )}
        </div>
        <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic truncate mb-1">{bot.name}</h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mb-3 italic">{bot.category}</p>
            <div className="flex flex-wrap gap-2">
                <span className="bg-slate-900 border border-white/5 text-slate-400 text-[8px] font-black px-2 py-1 rounded-md uppercase">v4.2.0</span>
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[8px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1">
                    <ShieldCheck size={10} /> Onaylı
                </span>
            </div>
        </div>
      </div>

      {/* Stats Band (Play Store Style) */}
      <div className="px-6 mb-10">
          <div className="flex items-center justify-between bg-slate-900/40 rounded-[28px] border border-white/5 p-5 backdrop-blur-sm">
              <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <span className="text-white font-black italic text-sm">4.8 <Star size={10} className="inline mb-1 fill-white" /></span>
                  <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">Puan</span>
              </div>
              <div className="flex flex-col items-center flex-1 border-r border-white/5">
                  <span className="text-white font-black italic text-sm">2.4K+</span>
                  <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">Kullanıcı</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                  <span className="text-white font-black italic text-sm">Sınırsız</span>
                  <span className="text-[8px] text-slate-600 font-bold uppercase mt-1">Erişim</span>
              </div>
          </div>
      </div>

      {/* Gallery Section */}
      <div className="mb-10">
          <h3 className="px-8 text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 italic">Ekran Görüntüleri</h3>
          <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x pb-4">
              {bot.screenshots && bot.screenshots.length > 0 ? (
                  bot.screenshots.map((s, i) => (
                    <div key={i} className="min-w-[160px] h-[280px] rounded-[24px] bg-slate-900 border border-white/5 overflow-hidden snap-center shrink-0 shadow-xl">
                        <img src={s} className="w-full h-full object-cover" />
                    </div>
                  ))
              ) : (
                  [1,2,3].map(i => (
                    <div key={i} className="min-w-[160px] h-[280px] rounded-[24px] bg-slate-900/50 border border-white/5 overflow-hidden snap-center shrink-0 flex items-center justify-center">
                        <ImageIcon className="text-slate-800" size={32} />
                    </div>
                  ))
              )}
          </div>
      </div>

      {/* Description */}
      <div className="px-6 mb-10">
          <h3 className="px-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4 italic">Hakkında</h3>
          <div className="p-6 bg-slate-900/30 rounded-[32px] border border-white/5 text-xs text-slate-400 font-bold uppercase italic leading-relaxed opacity-90">
              {bot.description}
          </div>
      </div>

      {/* Key Features */}
      <div className="px-6 mb-12">
          <h3 className="px-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] mb-6 italic">Temel Özellikler</h3>
          <div className="grid grid-cols-2 gap-3">
              {[
                  { icon: Zap, label: 'Ultra Hızlı', desc: 'Anlık Tepki' },
                  { icon: Shield, label: 'Güvenli', desc: 'Uçtan Uca' },
                  { icon: Globe, label: 'Global', desc: '7/24 Aktif' },
                  { icon: Cpu, label: 'AI Destekli', desc: 'Akıllı İşlem' }
              ].map((f, i) => (
                  <div key={i} className="p-5 bg-slate-900/40 rounded-[28px] border border-white/5 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-blue-500 border border-white/5 shadow-inner">
                          <f.icon size={18} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-white italic tracking-tight">{f.label}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase">{f.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pb-10">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-2xl border-b-8 ${
                    isOwned 
                    ? 'bg-emerald-600 text-white border-emerald-800' 
                    : 'bg-white text-slate-950 border-slate-300'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={20} /> BOTU BAŞLAT</> : (
                          bot.price === 0 ? <><PlusCircle size={20} /> ÜCRETSİZ EDİN</> : (
                              <div className="flex items-center gap-8">
                                  <div className="text-left">
                                      <p className="text-[8px] font-black text-slate-500 mb-1 uppercase tracking-widest">LİSANS ÜCRETİ</p>
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

const ImageIcon = ({ className, size }: { className?: string, size?: number }) => (
    <div className={className} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    </div>
);

export default BotDetail;
