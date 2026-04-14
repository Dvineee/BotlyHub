
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ChevronLeft, Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, ChevronDown, Eye, Lock, Unlock, AlertTriangle, 
  Sparkles, Star, Download, Info, CheckCircle2, Globe, Cpu,
  Play, UserPlus, MessageSquare, BarChart3, MousePointer2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, Channel, User } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTranslation } from '../TranslationContext';
import { GeminiService } from '../services/GeminiService';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

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
  const [showGuide, setShowGuide] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const screenshotScroll = useDraggableScroll();
  
  const fetchBotData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
        const data = await DatabaseService.getBotById(id);
        setBot(data);
        const userId = user?.id?.toString();
        if (userId) {
            const owned = await DatabaseService.isBotOwnedByUser(userId, id);
            setIsOwned(owned);
            
            // Log bot view
            if (data) {
                await DatabaseService.logActivity(userId, 'system', 'bot_view', 'Bot İnceleme', `${data.name} botu detayları görüntülendi.`);
            }
        }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [id, user?.id]);

  useEffect(() => {
    fetchBotData();
  }, [fetchBotData]);

  useEffect(() => {
    PriceService.getTonPrice().then(p => setTonRate(p.tonTry));
  }, []);

  const handleAction = useCallback(async () => {
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
              
              const syncData: Partial<User> = {
                  id: userData.id.toString(),
                  name: `${userData.first_name} ${userData.last_name || ''}`.trim(),
                  username: userData.username || 'user',
                  role: 'User',
                  status: 'Active',
                  joinDate: new Date().toISOString()
              };
              await DatabaseService.syncUser(syncData);

              await DatabaseService.addUserBot(userData, bot, false);
              
              DatabaseService.logActivity(userData.id.toString(), 'system', 'bot_added', 'Kütüphaneye Ekleme', `${bot.name} botu kütüphaneye eklendi.`);
              
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
              setTimeout(() => setShowGuide(true), 500);
          } catch (e: any) {
              console.error("Action failed:", e);
              alert("İşlem başarısız: " + (e.message || "Lütfen tekrar deneyin."));
          } finally {
              setIsProcessing(false);
          }
      } else {
          navigate(`/payment/${id}`);
      }
  }, [isProcessing, bot, isOwned, haptic, tg, user, notification, setShowGuide, navigate, id]);

  const handleAiAnalysis = async () => {
    if (!bot || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const response = await GeminiService.analyzeBot(bot);
      setAiAnalysis(response);
      
      if (user?.id) {
        await DatabaseService.logActivity(user.id.toString(), 'system', 'bot_ai_analysis', 'AI Analizi', `${bot.name} botu için AI analizi istendi.`);
      }
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAiAnalysis("AI asistanı şu anda meşgul. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleShare = () => {
    if (!bot) return;
    const shareUrl = `https://t.me/BotlyHubBot/app?startapp=bot_${bot.id}`;
    const shareText = `BotlyHub'da harika bir bot buldum: ${bot.name}\n\n${bot.description}\n\n${shareUrl}`;
    
    if (tg?.openTelegramLink) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
    } else {
        navigator.clipboard.writeText(shareUrl);
        setIsCopied(true);
        notification('success');
        setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const prices = useMemo(() => {
    if (!bot) return { ton: 0, stars: 0 };
    return PriceService.convert(bot.price, tonRate);
  }, [bot, tonRate]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500/50" size={32} />
    </div>
  );

  if (!bot) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 pb-40 animate-in fade-in transition-colors duration-300">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 h-16 z-[60] flex items-center justify-between px-6 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-500 dark:text-slate-400">
            <ChevronLeft size={24} />
        </button>
        <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 dark:text-white/20 uppercase italic">Uygulama Detayı</span>
        <button onClick={handleShare} className="p-2 -mr-2 text-slate-500 dark:text-slate-400 active:scale-90 transition-transform relative">
            <Share2 size={20} className={isCopied ? 'text-emerald-500' : ''} />
            <AnimatePresence>
                {isCopied && (
                    <motion.span 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -bottom-8 right-0 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase whitespace-nowrap"
                    >
                        Kopyalandı!
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
      </nav>

      {/* Hero & Stats Section */}
      <div className="pt-24 px-6 flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <div className="flex items-start gap-6 flex-1">
          <div className="relative shrink-0">
              <img 
                src={getLiveBotIcon(bot)} 
                loading="lazy"
                className="w-24 h-24 rounded-[32px] border border-black/10 dark:border-white/10 shadow-2xl object-cover bg-slate-200 dark:bg-slate-900" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
              />
              {isOwned && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-slate-50 dark:border-[#020617]">
                      <CheckCircle2 size={14} />
                  </div>
              )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate mb-1">{bot.name}</h1>
              <p className="text-purple-600 dark:text-purple-500 text-xs font-medium mb-3">{bot.category}</p>
              <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-xl uppercase">v4.2.0</span>
                  <span className="bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold px-3 py-1 rounded-xl uppercase flex items-center gap-1">
                      <ShieldCheck size={12} /> Onaylı
                  </span>
                  
                  {/* Dropdown Menu */}
                  <div className="relative">
                      <button 
                          onClick={() => {
                              if (bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) {
                                  setIsDropdownOpen(!isDropdownOpen);
                              }
                          }}
                          className={`bg-[#0098ea] text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase flex items-center gap-2 shadow-lg active:scale-95 transition-all ${!(bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) ? 'opacity-50 cursor-default' : ''}`}
                      >
                          OPEN <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                          {isDropdownOpen && (
                              <>
                                  <div className="fixed inset-0 z-[70]" onClick={() => setIsDropdownOpen(false)}></div>
                                  <motion.div 
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl shadow-2xl z-[80] overflow-hidden"
                                  >
                                      <div className="p-2 space-y-1">
                                          {bot.telegram_group && (
                                              <button 
                                                  onClick={() => {
                                                      const url = bot.telegram_group!.startsWith('@') ? `https://t.me/${bot.telegram_group!.substring(1)}` : bot.telegram_group;
                                                      window.open(url, '_blank');
                                                      setIsDropdownOpen(false);
                                                  }}
                                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                                              >
                                                  <Send size={14} className="text-blue-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-tight">Telegram Grup</span>
                                              </button>
                                          )}
                                          {bot.website_url && (
                                              <button 
                                                  onClick={() => {
                                                      window.open(bot.website_url, '_blank');
                                                      setIsDropdownOpen(false);
                                                  }}
                                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                                              >
                                                  <Globe size={14} className="text-emerald-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-tight">Web Site</span>
                                              </button>
                                          )}
                                          {bot.app_url && (
                                              <button 
                                                  onClick={() => {
                                                      window.open(bot.app_url, '_blank');
                                                      setIsDropdownOpen(false);
                                                  }}
                                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                                              >
                                                  <Cpu size={14} className="text-purple-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-tight">App</span>
                                              </button>
                                          )}
                                          {bot.social_url && (
                                              <button 
                                                  onClick={() => {
                                                      window.open(bot.social_url, '_blank');
                                                      setIsDropdownOpen(false);
                                                  }}
                                                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors text-left"
                                              >
                                                  <Share2 size={14} className="text-orange-500" />
                                                  <span className="text-[10px] font-black uppercase tracking-tight">Sosyal</span>
                                              </button>
                                          )}
                                      </div>
                                  </motion.div>
                              </>
                          )}
                      </AnimatePresence>
                  </div>
              </div>
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[320px]">
            <div className="flex flex-col bg-white dark:bg-slate-900/60 rounded-[32px] border border-black/5 dark:border-white/5 backdrop-blur-xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-6">
                    <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                        <span className="text-slate-900 dark:text-white font-bold text-base">4.8 <Star size={12} className="inline mb-1 fill-slate-900 dark:fill-white" /></span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Puan</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                        <span className="text-slate-900 dark:text-white font-bold text-base">2.4K+</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Kullanıcı</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base">Sınırsız</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Erişim</span>
                    </div>
                </div>
                {bot.languages && bot.languages.length > 0 && (
                    <div className="px-6 py-3 border-t border-black/5 dark:border-white/5 flex items-center justify-start gap-3">
                        {bot.languages.map((lang, idx) => (
                            <span key={idx} className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tighter italic">
                                {lang}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="mb-10">
          <h3 className="px-8 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Ekran Görüntüleri</h3>
          <div 
            ref={screenshotScroll.ref}
            onMouseDown={screenshotScroll.onMouseDown}
            onMouseUp={screenshotScroll.onMouseUp}
            onMouseMove={screenshotScroll.onMouseMove}
            onMouseLeave={screenshotScroll.onMouseLeave}
            onContextMenu={screenshotScroll.onContextMenu}
            className={`flex gap-4 overflow-x-auto no-scrollbar px-6 snap-x pb-4 ${screenshotScroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
              {bot.screenshots && bot.screenshots.length > 0 ? (
                  bot.screenshots.map((s, i) => (
                    <div key={i} className="min-w-[180px] h-[320px] rounded-[32px] bg-slate-200 dark:bg-slate-900 border border-black/5 dark:border-white/5 overflow-hidden snap-center shrink-0 shadow-xl">
                        <img src={s} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  ))
              ) : (
                  [1,2,3].map(i => (
                    <div key={i} className="min-w-[180px] h-[320px] rounded-[32px] bg-slate-100 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 overflow-hidden snap-center shrink-0 flex items-center justify-center">
                        <ImageIcon className="text-slate-300 dark:text-slate-800" size={32} />
                    </div>
                  ))
              )}
          </div>
      </div>

      {/* Description */}
      <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hakkında</h3>
          </div>
          <div className="p-8 bg-white dark:bg-slate-900/60 rounded-[32px] border border-black/5 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed shadow-lg">
              {bot.description}
          </div>
      </div>

      {/* Key Features */}
      <div className="px-6 mb-12">
          <h3 className="px-2 text-[10px] font-black text-slate-400 dark:text-slate-700 uppercase tracking-[0.4em] mb-6 italic">Temel Özellikler</h3>
          <div className="grid grid-cols-2 gap-3">
              {[
                  { icon: Zap, label: 'Ultra Hızlı', desc: 'Anlık Tepki' },
                  { icon: Shield, label: 'Güvenli', desc: 'Uçtan Uca' },
                  { icon: Globe, label: 'Global', desc: '7/24 Aktif' },
                  { icon: Cpu, label: 'AI Destekli', desc: 'Akıllı İşlem' }
              ].map((f, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-900/40 rounded-[28px] border border-black/5 dark:border-white/5 flex items-center gap-4 shadow-lg">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-blue-600 dark:text-blue-500 border border-black/5 dark:border-white/5 shadow-inner">
                          <f.icon size={18} />
                      </div>
                      <div>
                          <p className="text-[10px] font-black text-slate-900 dark:text-white italic tracking-tight">{f.label}</p>
                          <p className="text-[8px] text-slate-400 dark:text-slate-600 font-bold uppercase">{f.desc}</p>
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-slate-50 dark:from-[#020617] via-slate-50 dark:via-[#020617]/95 to-transparent pb-10">
          <div className="max-w-md mx-auto">
              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`w-full h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-2xl border-b-8 ${
                    isOwned 
                    ? 'bg-emerald-600 text-white border-emerald-800' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={20} /> BOTU BAŞLAT</> : (
                          bot.price === 0 ? <><PlusCircle size={20} /> ÜCRETSİZ EDİN</> : (
                              <div className="flex items-center gap-8">
                                  <div className="text-left">
                                      <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 mb-1 uppercase tracking-widest">LİSANS ÜCRETİ</p>
                                      <p className="text-lg font-black italic tracking-tighter">{prices.ton} TON</p>
                                  </div>
                                  <div className="h-10 w-px bg-white/20 dark:bg-slate-200/20"></div>
                                  <span className="flex items-center gap-2">SATIN AL <ChevronRight size={18} /></span>
                              </div>
                          )
                      )
                  )}
              </button>
          </div>
      </div>

      {/* Onboarding Guide Modal */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowGuide(false)}
              className="absolute inset-0 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-[44px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <button onClick={() => setShowGuide(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none mb-3">
                  Tebrikler! <br/> <span className="text-blue-600">Botunuz Hazır</span>
                </h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-10 italic">
                  Botu kullanmaya başlamak için şu adımları izleyin:
                </p>

                <div className="space-y-6 mb-10">
                  {[
                    { icon: Play, title: 'Botu Başlat', desc: 'Aşağıdaki butona basarak Telegram\'a gidin ve /start komutunu verin.' },
                    { icon: UserPlus, title: 'Kanala Ekle', desc: 'Botu yönetmek istediğiniz kanalınıza "Yönetici" olarak ekleyin.' },
                    { icon: MessageSquare, title: 'İlk Sinyal', desc: 'Botun yönetim panelinden veya komutlarından ilk paylaşımınızı tetikleyin.' },
                    { icon: BarChart3, title: 'Kazanç İzle', desc: 'BotlyHub ana sayfasından kanal gelirlerinizi anlık takip edin.' }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-5 group">
                      <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-500 border border-black/5 dark:border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                        <step.icon size={18} />
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1 italic">{i+1}. {step.title}</h4>
                        <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed italic">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setShowGuide(false);
                      handleAction();
                    }}
                    className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-[24px] text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    <Send size={16} /> ŞİMDİ BAŞLAT
                  </button>
                  <button 
                    onClick={() => setShowGuide(false)}
                    className="w-full py-4 text-slate-400 dark:text-slate-600 font-black text-[9px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-slate-400 transition-colors"
                  >
                    DAHA SONRA
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ImageIcon = ({ className, size }: { className?: string, size?: number }) => (
    <div className={className} style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
    </div>
);

export default BotDetail;
