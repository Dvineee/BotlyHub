
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Share2, Send, Loader2, ShieldCheck, 
  Bot as BotIcon, Zap, Shield, PlusCircle, X, 
  Maximize2, ChevronRight, ChevronLeft, ChevronDown, Eye, Lock, Unlock, AlertTriangle, 
  Sparkles, Star, Download, Info, CheckCircle2, Globe, Cpu,
  Play, UserPlus, MessageSquare, BarChart3, MousePointer2,
  Search, LayoutGrid, Store, User as UserIcon, Megaphone, Bell, Instagram, Youtube, Link
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bot, Channel, User, Notification } from '../types';
import { useTelegram } from '../hooks/useTelegram';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTranslation } from '../TranslationContext';
import { GeminiService } from '../services/GeminiService';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useTheme } from '../ThemeContext';
import { TelegramLoginWidget } from '../components/TelegramLoginWidget';
import Logo from '../components/Logo';
import { useRef } from 'react';

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
  const { haptic, user, notification, tg, isTelegram, setWebAuthUser } = useTelegram();
  const { t } = useTranslation();
  const { toggleTheme, theme } = useTheme();
  
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
  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isRating, setIsRating] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  
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

            // Get notifications for unread count
            DatabaseService.getNotifications(userId).then(notes => {
                const unread = notes.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            });
        }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [id, user?.id]);

  useEffect(() => {
    fetchBotData();
    if (id) {
        DatabaseService.incrementBotView(id);
    }
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage(null as any);
      if (e.key === 'ArrowLeft') prevImage(null as any);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [fetchBotData, id]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!bot?.screenshots) return;
    setCurrentImageIndex((prev) => (prev + 1) % bot.screenshots!.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!bot?.screenshots) return;
    setCurrentImageIndex((prev) => (prev - 1 + bot.screenshots!.length) % bot.screenshots!.length);
  };

  useEffect(() => {
    if (user?.id && id) {
        DatabaseService.getUserBotRating(user.id.toString(), id).then(setUserRating);
    }
  }, [user?.id, id]);

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

  const handleRate = async (rating: number) => {
    console.log("handleRate called with:", rating);
    if (isRating) return;
    
    if (!user?.id) {
        notification('error');
        if (tg?.showAlert) tg.showAlert("Puan vermek için giriş yapmış olmalısınız.");
        else alert("Puan vermek için giriş yapmış olmalısınız.");
        return;
    }

    if (!id) return;

    setIsRating(true);
    try {
        console.log("Saving rating to DB...");
        await DatabaseService.rateBot(user.id.toString(), id, rating);
        console.log("Rating saved successfully");
        setUserRating(rating);
        await fetchBotData();
        notification('success');
    } catch (e: any) {
        console.error("Rating Error:", e);
        notification('error');
        if (tg?.showAlert) tg.showAlert(`Hata: ${e.message || 'Puan kaydedilemedi'}`);
        else alert(`Hata: ${e.message || 'Puan kaydedilemedi'}`);
    } finally {
        setIsRating(false);
    }
  };

  const prices = useMemo(() => {
    if (!bot) return { ton: 0, stars: 0 };
    return PriceService.convert(bot.price, tonRate);
  }, [bot, tonRate]);

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500/50" size={32} />
    </div>
  );

  if (!bot) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 pb-40 animate-in fade-in transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 md:px-10">
        {/* Responsive Header */}
        <div className="flex items-center justify-between mb-8 pt-6 gap-3 md:gap-6">
            <div className="flex items-center gap-2 shrink-0">
                <div className="shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                    <Logo style={{ width: '2.5rem', height: 'auto', display: 'block' }} className="" />
                </div>
                <h1 className="hidden sm:block text-2xl font-bold text-slate-900 dark:text-white tracking-tight cursor-pointer" onClick={() => navigate('/')}>BotlyHub</h1>
            </div>

            <div className="flex-1 max-w-2xl cursor-pointer" onClick={() => navigate('/search')}>
                <div className="relative flex items-center bg-white dark:bg-slate-900/40 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-[28px] p-1.5 transition-all active:scale-[0.98] group">
                    <div className="ml-2 md:ml-4 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-blue-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <div className="w-full py-2 md:py-3 px-3 md:px-4 text-[10px] md:text-sm text-slate-400 font-bold uppercase tracking-widest opacity-60 truncate">
                        {t('search_placeholder')}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
                <button 
                    onClick={() => { haptic('light'); toggleTheme(); }} 
                    className="hidden md:flex w-12 h-12 items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2.20001C12.4418 2.20001 12.8 2.55818 12.8 3.00001V4.00001C12.8 4.44184 12.4418 4.80001 12 4.80001C11.5581 4.80001 11.2 4.44184 11.2 4.00001V3.00001C11.2 2.55818 11.5581 2.20001 12 2.20001ZM5.03427 5.03433C5.34668 4.72191 5.85322 4.72191 6.16564 5.03433L6.86564 5.73433C7.17806 6.04675 7.17806 6.55328 6.86564 6.8657C6.55322 7.17812 6.04669 7.17812 5.73427 6.8657L5.03427 6.1657C4.72185 5.85328 4.72185 5.34675 5.03427 5.03433ZM18.9656 5.03433C19.2781 5.34675 19.2781 5.85328 18.9656 6.1657L18.2656 6.8657C17.9532 7.17812 17.4467 7.17812 17.1343 6.8657C16.8218 6.55328 16.8218 6.04675 17.1343 5.73433L17.8343 5.03433C18.1467 4.72191 18.6532 4.72191 18.9656 5.03433ZM12 8.80001C10.2326 8.80001 8.79995 10.2327 8.79995 12C8.79995 13.7673 10.2326 15.2 12 15.2C13.7673 15.2 15.2 13.7673 15.2 12C15.2 10.2327 13.7673 8.80001 12 8.80001ZM7.19995 12C7.19995 9.34905 9.34898 7.20001 12 7.20001C14.6509 7.20001 16.8 9.34905 16.8 12C16.8 14.651 14.6509 16.8 12 16.8C9.34898 16.8 7.19995 14.651 7.19995 12ZM2.19995 12C2.19995 11.5582 2.55812 11.2 2.99995 11.2H3.99995C4.44178 11.2 4.79995 11.5582 4.79995 12C4.79995 12.4418 4.44178 12.8 3.99995 12.8H2.99995C2.55812 12.8 2.19995 12.4418 2.19995 12ZM19.2 12C19.2 11.5582 19.5581 11.2 20 11.2H21C21.4418 11.2 21.7999 11.5582 21.7999 12C21.7999 12.4418 21.4418 12.8 21 12.8H20C19.5581 12.8 19.2 12.4418 19.2 12ZM6.86564 17.1343C7.17806 17.4467 7.17806 17.9533 6.86564 18.2657L6.16564 18.9657C5.85322 19.2781 5.34668 19.2781 5.03427 18.9657C4.72185 18.6533 4.72185 18.1467 5.03427 17.8343L5.73427 17.1343C6.04669 16.8219 6.55322 16.8219 6.86564 17.1343ZM17.1343 17.1343C17.4467 16.8219 17.9532 16.8219 18.2656 17.1343L18.9656 17.8343C19.2781 18.1467 19.2781 18.6533 18.9656 18.9657C18.6532 19.2781 18.1467 19.2781 17.8343 18.9657L17.1343 18.2657C16.8218 17.9533 16.8218 17.4467 17.1343 17.1343ZM12 19.2C12.4418 19.2 12.8 19.5582 12.8 20V21C12.8 21.4418 12.4418 21.8 12 21.8C11.5581 21.8 11.2 21.4418 11.2 21V20C11.2 19.5582 11.5581 19.2 12 19.2Z " fill="currentColor"></path>
                    </svg>
                </button>

                {user ? (
                    <>
                        <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="hidden sm:flex w-10 h-10 md:w-12 md:h-12 items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M5.54845 3.77673C3.55195 3.77673 1.93347 5.39521 1.93347 7.39171V16.6083C1.93347 18.6048 3.55195 20.2233 5.54845 20.2233H18.4517C20.4482 20.2233 22.0667 18.6048 22.0667 16.6083V8.31337V7.39171C22.0667 5.39521 20.4482 3.77673 18.4517 3.77673H5.54845ZM3.63347 7.39171C3.63347 6.3341 4.49084 5.47673 5.54845 5.47673H18.4517C19.5093 5.47673 20.3667 6.3341 20.3667 7.39171V8.31337V8.38503H17.53C15.5335 8.38503 13.915 10.0035 13.915 12C13.915 13.9965 15.5335 15.615 17.53 15.615H20.3667V16.6083C20.3667 17.6659 19.5093 18.5233 18.4517 18.5233H5.54845C4.49084 18.5233 3.63347 17.6659 3.63347 16.6083V7.39171ZM20.3667 13.915V10.085H17.53C16.4724 10.085 15.615 10.9424 15.615 12C15.615 13.0576 16.4724 13.915 17.53 13.915H20.3667Z" fill="currentColor"/>
                            </svg>
                        </button>
                        <div className="relative" ref={menuRef}>
                            <button 
                              onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 rounded-full text-slate-900 dark:text-white active:scale-90 transition-transform relative"
                            >
                                <LayoutGrid size={20} />
                                {unreadCount > 0 && (
                                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[8px] font-black text-white flex items-center justify-center px-1 badge-pop">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </div>
                                )}
                            </button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden z-[100] animate-in py-2 backdrop-blur-2xl">
                                    {[
                                        { path: '/', icon: Store, color: 'text-blue-500 dark:text-blue-400', label: 'market' },
                                        { path: '/settings', icon: UserIcon, color: 'text-purple-500 dark:text-purple-400', label: 'profile' },
                                        { path: '/my-bots', icon: BotIcon, color: 'text-emerald-500 dark:text-emerald-400', label: 'my_bots' },
                                        { path: '/channels', icon: Megaphone, color: 'text-orange-500 dark:text-orange-400', label: 'my_channels' },
                                        { path: '/notifications', icon: Bell, color: 'text-blue-600 dark:text-blue-500', label: 'notifications', badge: unreadCount > 0 }
                                    ].map((item, i) => (
                                        <button key={i} onClick={() => { navigate(item.path); setIsMenuOpen(false); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-black/5 dark:hover:bg-white/5 text-left border-b border-black/5 dark:border-white/5 last:border-0 relative">
                                            <item.icon size={18} className={item.color} /> 
                                            <span className="text-[11px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(item.label)}</span>
                                            {item.badge && <div className="absolute right-6 w-2.5 h-2.5 bg-red-600 rounded-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center">
                        <TelegramLoginWidget botUsername="BotlyHubBOT" onAuth={(user) => setWebAuthUser(user)} />
                    </div>
                )}
            </div>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-16 overflow-visible">
          <div className="lg:col-start-1">
            {/* Hero & Stats Section */}
            <div className="pt-10 px-6 lg:px-0 flex flex-col md:flex-row md:items-center gap-6 mb-10">
              <div className="flex items-start gap-6 flex-1">
          <div className="relative shrink-0">
              <img 
                src={getLiveBotIcon(bot)} 
                loading="lazy"
                className="w-24 h-24 rounded-[32px] !p-0 border border-black/10 dark:border-white/10 object-cover bg-slate-200 dark:bg-slate-900" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=1e293b&color=fff&bold=true`; }}
              />
              {isOwned && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl border-2 border-slate-50 dark:border-slate-950">
                      <CheckCircle2 size={14} />
                  </div>
              )}
          </div>
          <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate mb-1 flex items-center gap-2">
                  {bot.name}
                  {bot.is_official && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-[11px] h-[11px] text-[#139fec] shrink-0">
                          <polyline points="20 6 9 17 4 12" />
                      </svg>
                  )}
              </h1>
              <p className="text-brand dark:text-brand-light text-[11px] font-semibold mb-3 uppercase tracking-wider">{bot.category}</p>
              <div className="flex flex-wrap gap-2 items-center">
                  <span className="bg-white dark:bg-slate-900/80 border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400 text-[10px] font-bold px-3 py-1 rounded-xl uppercase">v4.2.0</span>
                  <span className="bg-brand/10 border border-brand/20 text-brand dark:text-brand-light text-[10px] font-bold px-3 py-1 rounded-xl uppercase flex items-center gap-1">
                      <ShieldCheck size={12} /> Onaylı
                  </span>
                  
                  {/* Dropdown Menu - Default position for small screens, hidden on lg */}
                  <div className="relative lg:hidden">
                      <button 
                          onClick={() => {
                              if (bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) {
                                  setIsDropdownOpen(!isDropdownOpen);
                              }
                          }}
                          className={`bg-brand dark:bg-brand-light text-white text-[10px] font-black px-4 py-1.5 rounded-xl uppercase flex items-center gap-2 active:scale-95 transition-all ${!(bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) ? 'opacity-50 cursor-default' : ''}`}
                      >
                          AÇ <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      <AnimatePresence>
                          {isDropdownOpen && (
                              <>
                                  <div className="fixed inset-0 z-[70]" onClick={() => setIsDropdownOpen(false)}></div>
                                  <motion.div 
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      className="absolute left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/10 rounded-2xl z-[80] overflow-hidden"
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

        <div className="w-full md:w-auto md:min-w-[320px] lg:hidden">
            <div className="flex flex-col bg-white dark:bg-slate-900/60 rounded-[32px] border border-black/5 dark:border-white/5 backdrop-blur-xl  overflow-hidden">
                <div className="flex items-center justify-between p-6">
                    <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                        <span className="text-slate-900 dark:text-white font-bold text-base">{bot.rating || '0.0'} <Star size={12} className="inline mb-1 fill-slate-900 dark:fill-white" /></span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">{bot.rating_count || 0} Oy</span>
                    </div>
                    <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                        <span className="text-slate-900 dark:text-white font-bold text-base">{bot.user_count && bot.user_count > 1000 ? `${(bot.user_count / 1000).toFixed(1)}K` : bot.user_count || 0}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Kullanıcı</span>
                    </div>
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-slate-900 dark:text-white font-bold text-base">{bot.views && bot.views > 1000 ? `${(bot.views / 1000).toFixed(1)}K` : bot.views || 0}</span>
                        <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Görüntüleme</span>
                    </div>
                </div>
                {bot.languages && bot.languages.length > 0 && (
                    <div className="px-6 py-3 border-t border-black/5 dark:border-white/5 flex items-center justify-start gap-3">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mr-[3px]"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 2.5V2C5.5 1.17157 6.17157 0.5 7 0.5C7.82843 0.5 8.5 1.17157 8.5 2V2.5H9.9742C9.9901 2.49975 10.0061 2.49974 10.0221 2.5H12C12.8284 2.5 13.5 3.17157 13.5 4C13.5 4.82843 12.8284 5.5 12 5.5H11.2512C10.7379 7.82318 9.75127 9.98263 8.30067 11.9736C9.27943 12.9992 10.4353 13.9118 11.7719 14.7138C12.4823 15.14 12.7126 16.0614 12.2864 16.7717C11.8602 17.4821 10.9388 17.7125 10.2284 17.2862C8.75981 16.4051 7.46579 15.399 6.34922 14.2699C5.33326 15.3069 4.1736 16.2908 2.87186 17.2206C2.19774 17.7021 1.26091 17.546 0.7794 16.8719C0.297886 16.1977 0.454024 15.2609 1.12814 14.7794C2.38555 13.8813 3.48271 12.9379 4.42182 11.9481C3.69705 10.8985 3.09174 9.76779 2.60746 8.55709C2.29979 7.78791 2.67391 6.91496 3.44309 6.60729C4.21226 6.29961 5.08522 6.67374 5.39289 7.44291C5.67512 8.14848 6.00658 8.8209 6.38782 9.46053C7.19463 8.20649 7.78489 6.88692 8.16216 5.5H2C1.17157 5.5 0.5 4.82843 0.5 4C0.5 3.17157 1.17157 2.5 2 2.5H5.5ZM16.4912 16.5H18.5088L17.5 13.5856L16.4912 16.5ZM15.4527 19.5L14.4175 22.4907C14.1465 23.2735 13.2922 23.6885 12.5093 23.4175C11.7265 23.1465 11.3115 22.2922 11.5825 21.5093L16.0825 8.50933C16.5484 7.16356 18.4516 7.16356 18.9175 8.50933L23.4175 21.5093C23.6885 22.2922 23.2735 23.1465 22.4907 23.4175C21.7078 23.6885 20.8535 23.2735 20.5825 22.4907L19.5473 19.5H15.4527Z" fill="#758CA3"/></svg>
                        {bot.languages.map((lang, idx) => (
                        <span key={idx} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
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
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className="h-[320px] rounded-[32px] bg-slate-200 dark:bg-slate-900 border border-black/5 dark:border-white/5 overflow-hidden snap-center shrink-0 cursor-zoom-in group relative"
                      onClick={() => openLightbox(i)}
                    >
                        <img src={s} loading="lazy" className="h-full w-auto object-contain" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                            <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </motion.div>
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

      {/* Rating Section */}
      {isOwned && (
          <div className="px-6 mb-10">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative p-5 bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl rounded-[32px] border border-black/5 dark:border-white/5 overflow-hidden group"
              >
                  <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5">
                          <div className="flex flex-col gap-0.5">
                              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Deneyimi Puanla</h3>
                          </div>
                          {userRating && (
                              <motion.div 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-xl"
                              >
                                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Puanınız: {userRating}</span>
                              </motion.div>
                          )}
                      </div>

                      <div className="flex items-center justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => {
                              const isActive = (hoverRating || userRating || 0) >= star;
                              const isSelected = userRating === star;
                              
                              return (
                                  <motion.button
                                      key={star}
                                      onMouseEnter={() => setHoverRating(star)}
                                      onMouseLeave={() => setHoverRating(null)}
                                      onClick={() => { console.log("Star clicked:", star); haptic('heavy'); handleRate(star); }}
                                      disabled={isRating}
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      className="relative p-1.5 transition-all z-50"
                                  >
                                      <Star 
                                          size={28} 
                                          className={`transition-all duration-300 ${
                                              isActive 
                                              ? 'fill-yellow-400 text-yellow-400 ' 
                                              : 'text-slate-200 dark:text-slate-800'
                                          }`} 
                                      />
                                      {isSelected && (
                                          <motion.div 
                                            layoutId="star-glow"
                                            className="absolute inset-0 bg-yellow-400/10 blur-lg rounded-full -z-10"
                                          />
                                      )}
                                  </motion.button>
                              );
                          })}
                      </div>
                  </div>
              </motion.div>
          </div>
      )}

      {/* Description */}
      <div className="px-6 mb-10">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hakkında</h3>
          </div>
          <div className="p-4 bg-white dark:bg-slate-900/60 rounded-[32px] border border-black/5 dark:border-white/5 text-sm text-slate-600 dark:text-slate-400 leading-[1.6] whitespace-pre-wrap">
              {bot.description}
          </div>
      </div>

          </div>

          {/* Right Column (PC only) - Action bar moved here for large screens */}
          <aside className="hidden lg:flex flex-col gap-4 pt-10 sticky top-10 h-fit pr-6 lg:pr-0">
              <div className="w-full">
                  <div className="flex flex-col bg-white dark:bg-slate-900/60 rounded-[32px] border border-black/5 dark:border-white/5 backdrop-blur-xl overflow-hidden">
                      <div className="flex items-center justify-between p-6">
                          <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                              <span className="text-slate-900 dark:text-white font-bold text-base">{bot.rating || '0.0'} <Star size={12} className="inline mb-1 fill-slate-900 dark:fill-white" /></span>
                              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">{bot.rating_count || 0} Oy</span>
                          </div>
                          <div className="flex flex-col items-center flex-1 border-r border-black/5 dark:border-white/5">
                              <span className="text-slate-900 dark:text-white font-bold text-base">{bot.user_count && bot.user_count > 1000 ? `${(bot.user_count / 1000).toFixed(1)}K` : bot.user_count || 0}</span>
                              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Kullanıcı</span>
                          </div>
                          <div className="flex flex-col items-center flex-1">
                              <span className="text-slate-900 dark:text-white font-bold text-base">{bot.views && bot.views > 1000 ? `${(bot.views / 1000).toFixed(1)}K` : bot.views || 0}</span>
                              <span className="text-[10px] text-slate-500 font-medium uppercase mt-1 tracking-wider">Görüntüleme</span>
                          </div>
                      </div>
                      {bot.languages && bot.languages.length > 0 && (
                          <div className="px-6 py-3 border-t border-black/5 dark:border-white/5 flex items-center justify-start gap-3">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mr-[3px]"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.5 2.5V2C5.5 1.17157 6.17157 0.5 7 0.5C7.82843 0.5 8.5 1.17157 8.5 2V2.5H9.9742C9.9901 2.49975 10.0061 2.49974 10.0221 2.5H12C12.8284 2.5 13.5 3.17157 13.5 4C13.5 4.82843 12.8284 5.5 12 5.5H11.2512C10.7379 7.82318 9.75127 9.98263 8.30067 11.9736C9.27943 12.9992 10.4353 13.9118 11.7719 14.7138C12.4823 15.14 12.7126 16.0614 12.2864 16.7717C11.8602 17.4821 10.9388 17.7125 10.2284 17.2862C8.75981 16.4051 7.46579 15.399 6.34922 14.2699C5.33326 15.3069 4.1736 16.2908 2.87186 17.2206C2.19774 17.7021 1.26091 17.546 0.7794 16.8719C0.297886 16.1977 0.454024 15.2609 1.12814 14.7794C2.38555 13.8813 3.48271 12.9379 4.42182 11.9481C3.69705 10.8985 3.09174 9.76779 2.60746 8.55709C2.29979 7.78791 2.67391 6.91496 3.44309 6.60729C4.21226 6.29961 5.08522 6.67374 5.39289 7.44291C5.67512 8.14848 6.00658 8.8209 6.38782 9.46053C7.19463 8.20649 7.78489 6.88692 8.16216 5.5H2C1.17157 5.5 0.5 4.82843 0.5 4C0.5 3.17157 1.17157 2.5 2 2.5H5.5ZM16.4912 16.5H18.5088L17.5 13.5856L16.4912 16.5ZM15.4527 19.5L14.4175 22.4907C14.1465 23.2735 13.2922 23.6885 12.5093 23.4175C11.7265 23.1465 11.3115 22.2922 11.5825 21.5093L16.0825 8.50933C16.5484 7.16356 18.4516 7.16356 18.9175 8.50933L23.4175 21.5093C23.6885 22.2922 23.2735 23.1465 22.4907 23.4175C21.7078 23.6885 20.8535 23.2735 20.5825 22.4907L19.5473 19.5H15.4527Z" fill="#758CA3"/></svg>
                              {bot.languages.map((lang, idx) => (
                              <span key={idx} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                  {lang}
                              </span>
                              ))}
                          </div>
                      )}
                  </div>
              </div>

              {/* Action Buttons for Sidebar */}
              <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleAction}
                    disabled={isProcessing}
                    className={`w-full h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-b-8 ${
                        isOwned 
                        ? 'bg-emerald-600 text-white border-emerald-800' 
                        : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300'
                    }`}
                  >
                      {isProcessing ? <Loader2 className="animate-spin" /> : (
                          isOwned ? <><Send size={20} /> BOTU BAŞLAT</> : (
                              bot.price === 0 ? <><PlusCircle size={20} /> ÜCRETSİZ EDİN</> : (
                                  <div className="flex items-center gap-4">
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

                  <button 
                    onClick={handleShare}
                    className="h-20 w-full bg-white dark:bg-slate-900 rounded-[32px] border border-black/5 dark:border-white/10 flex items-center justify-center gap-4 text-slate-500 dark:text-slate-400 active:scale-95 transition-all relative border-b-8 border-transparent"
                  >
                      <Share2 size={24} className={isCopied ? 'text-emerald-500' : ''} />
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">PAYLAŞ</span>
                      <AnimatePresence>
                          {isCopied && (
                              <motion.span 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: -35 }}
                                  exit={{ opacity: 0 }}
                                  className="absolute left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase whitespace-nowrap"
                              >
                                  Kopyalandı!
                              </motion.span>
                          )}
                      </AnimatePresence>
                  </button>

                  {/* Direct Link Buttons for Sidebar (PC/Large Screens) */}
                  {(bot.telegram_group || bot.website_url || bot.app_url || bot.social_url) && (
                      <div className="flex flex-col bg-white dark:bg-slate-900/40 rounded-[32px] border border-black/5 dark:border-white/5 p-4 pt-5 gap-[0.6em]">
                          <div className="px-2 mb-1">
                              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">OFFICIAL LINKS</h4>
                          </div>
                          {bot.telegram_group && (
                              <button 
                                  onClick={() => {
                                      const url = bot.telegram_group!.startsWith('@') ? `https://t.me/${bot.telegram_group!.substring(1)}` : bot.telegram_group;
                                      window.open(url, '_blank');
                                  }}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Send size={16} className="text-blue-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">Telegram Grup</span>
                              </button>
                          )}
                          {bot.website_url && (
                              <button 
                                  onClick={() => window.open(bot.website_url, '_blank')}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Globe size={16} className="text-emerald-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">Web Site</span>
                              </button>
                          )}
                          {bot.app_url && (
                              <button 
                                  onClick={() => window.open(bot.app_url, '_blank')}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <PlusCircle size={16} className="text-purple-500" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">Uygulama / Bot</span>
                              </button>
                          )}
                          {bot.social_url && (
                              <button 
                                  onClick={() => window.open(bot.social_url, '_blank')}
                                  className="w-full flex items-center gap-4 pl-2 pr-6 py-4.5 hover:bg-slate-50 dark:hover:bg-transparent rounded-2xl transition-all text-left group"
                              >
                                  <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <Share2 size={16} className="text-blue-400" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest italic text-slate-700 dark:text-slate-300">Sosyal Medya</span>
                              </button>
                          )}
                      </div>
                  )}
              </div>
          </aside>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 inset-x-0 p-6 z-[70] bg-gradient-to-t from-slate-50 dark:from-[#020617] via-slate-50 dark:via-[#020617]/95 to-transparent pb-10 lg:hidden">
          <div className="max-w-md mx-auto flex items-center gap-3">
              <button 
                onClick={handleShare}
                className="h-20 w-20 shrink-0 bg-white dark:bg-slate-900 rounded-[32px] border border-black/5 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-95 transition-all relative border-b-8 border-transparent"
              >
                  <Share2 size={24} className={isCopied ? 'text-emerald-500' : ''} />
                  <AnimatePresence>
                      {isCopied && (
                          <motion.span 
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: -45 }}
                              exit={{ opacity: 0 }}
                              className="absolute left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase whitespace-nowrap"
                          >
                              Kopyalandı!
                          </motion.span>
                      )}
                  </AnimatePresence>
              </button>

              <button 
                onClick={handleAction}
                disabled={isProcessing}
                className={`flex-1 h-20 rounded-[32px] text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 border-b-8 ${
                    isOwned 
                    ? 'bg-emerald-600 text-white border-emerald-800' 
                    : 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-slate-700 dark:border-slate-300'
                }`}
              >
                  {isProcessing ? <Loader2 className="animate-spin" /> : (
                      isOwned ? <><Send size={20} /> BOTU BAŞLAT</> : (
                          bot.price === 0 ? <><PlusCircle size={20} /> ÜCRETSİZ EDİN</> : (
                              <div className="flex items-center gap-4">
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
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-[44px] overflow-hidden"
            >
              <div className="p-8 lg:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="w-12 h-12 bg-brand dark:bg-brand-light rounded-2xl flex items-center justify-center uppercase tracking-widest text-[11px] font-bold text-white">
                    <Sparkles className="text-white" size={24} />
                  </div>
                  <button onClick={() => setShowGuide(false)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-none mb-3">
                  Tebrikler! <br/> <span className="text-brand dark:text-brand-light">Botunuz Hazır</span>
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
                      <div className="w-10 h-10 shrink-0 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-brand dark:text-brand-light border border-black/5 dark:border-white/5 group-hover:bg-brand dark:group-hover:bg-brand-light group-hover:text-white transition-all duration-500">
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
                    className="w-full py-5 bg-brand dark:bg-brand-light hover:opacity-90 text-white font-black rounded-[24px] text-[10px] uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-3"
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

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && bot?.screenshots && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-3xl px-4 md:px-0"
            onClick={closeLightbox}
          >
            <div className="absolute top-8 right-8 flex items-center gap-4">
              <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">
                Ekran Görüntüsü {currentImageIndex + 1} / {bot.screenshots.length}
              </span>
              <button 
                onClick={closeLightbox}
                className="w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
                aria-label="Kapat"
              >
                <X size={24} />
              </button>
            </div>

            <button 
              onClick={prevImage}
              className="absolute left-4 md:left-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10 active:scale-90"
              aria-label="Önceki"
            >
              <ChevronLeft size={32} />
            </button>

            <motion.div 
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="relative w-full max-w-4xl h-[70vh] md:h-[80vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={bot.screenshots[currentImageIndex]} 
                alt={`Ekran Görüntüsü ${currentImageIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-2xl md:rounded-[40px] shadow-2xl"
              />
            </motion.div>

            <button 
              onClick={nextImage}
              className="absolute right-4 md:right-8 w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10 active:scale-90"
              aria-label="Sonraki"
            >
              <ChevronRight size={32} />
            </button>

            {/* Thumbnails preview for large screens */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-center gap-3 overflow-x-auto no-scrollbar py-4 hidden md:flex">
              {bot.screenshots.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-12 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${currentImageIndex === idx ? 'border-brand scale-110' : 'border-white/10 opacity-40 hover:opacity-100'}`}
                >
                  <img src={s} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
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
