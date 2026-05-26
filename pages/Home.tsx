
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, LayoutGrid, DollarSign, Loader2, Store, User, Bot as BotIcon, Megaphone, X, Info, Sparkles, Zap, Gift, Star, Heart, Bell, Shield, TrendingUp, Radio, Send, Link, CheckCircle2, ChevronDown, Sun, Moon, Wallet, Menu, Plus, LogOut, Compass, Coins, BarChart3, Binoculars, Share2, Briefcase, MousePointer2, ExternalLink, ArrowUpRight, ArrowLeft, MessageSquare, SlidersHorizontal, Sliders, Settings } from 'lucide-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Announcement, Notification, BlogPost } from '../types';
import { categories, appsSubCategories } from '../data';
import { useTranslation } from '../TranslationContext';
import { DatabaseService } from '../services/DatabaseService';
import PriceService from '../services/PriceService';
import { useTelegram } from '../hooks/useTelegram';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useFilter } from '../FilterContext';
import { FilterMenu } from '../components/FilterMenu';
import { useTheme } from '../ThemeContext';
import Logo from '../components/Logo';
import { SEO } from '../components/SEO';
import LoginModal from '../components/LoginModal';

const iconMap: Record<string, any> = {
  Sparkles, Megaphone, Zap, Gift, Star, Info, BotIcon, Heart, Bell, Shield
};

const getLiveBotIcon = (bot: Bot) => {
    if (bot.bot_link) {
        const username = bot.bot_link.replace('@', '').replace('https://t.me/', '').split('/').pop()?.trim();
        if (username) return `https://t.me/i/userpic/320/${username}.jpg`;
    }
    return bot.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=random&color=fff`;
};



const StarSVG = React.memo(({ className, size = 24 }: { className?: string, size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
));

const StarVisual = React.memo(() => (
  <div className="absolute right-[-15px] sm:right-[-6px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center pointer-events-none select-none overflow-visible">
    <div className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)' }} />
    
    <div className="absolute -translate-x-12 -translate-y-2 scale-75 -rotate-12 text-amber-300 dark:text-amber-500/40 opacity-70 group-hover:scale-80 transition-transform duration-500">
      <StarSVG size={45} />
    </div>

    <div className="absolute translate-x-14 translate-y-4 scale-60 rotate-[22deg] text-amber-300 dark:text-amber-500/30 opacity-60">
      <StarSVG size={40} />
    </div>

    <div className="absolute z-10 scale-100 rotate-6 text-[#ffaf02] drop-shadow-[0_4px_10px_rgba(245,158,11,0.2)] group-hover:scale-105 group-hover:rotate-[12deg] transition-all duration-500">
      <StarSVG size={85} />
    </div>

    <div className="absolute -translate-x-12 translate-y-12 text-amber-400/90 scale-75 animate-bounce duration-[3000ms]">
      <StarSVG size={14} />
    </div>
    <div className="absolute translate-x-10 -translate-y-12 text-amber-400 opacity-95">
      <StarSVG size={16} />
    </div>

    <div className="absolute z-20 translate-x-[24px] translate-y-[20px] bg-[#ff3b30] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-lg shadow-red-500/10 rotate-[8deg] tracking-tight">
      -30%
    </div>
  </div>
));

const TonCoin = React.memo(({ className, size = 48 }: { className?: string, size?: number }) => (
  <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-[#2f80ed] to-[#0088cc] shadow-xl text-white border border-white/10 select-none ${className}`} style={{ width: size, height: size }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 85 L15 35 L85 35 Z" fill="none" />
      <path d="M50 35 L50 85" />
    </svg>
  </div>
));

const TonVisual = React.memo(() => (
  <div className="absolute right-[-15px] sm:right-[-6px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center pointer-events-none select-none overflow-visible">
    <div className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.1) 0%, transparent 70%)' }} />
    
    <div className="absolute z-10 translate-x-5 translate-y-14 rotate-[-30deg] scale-90 shadow-xl opacity-90 group-hover:translate-y-12 transition-all duration-500">
      <TonCoin size={50} />
    </div>

    <div className="absolute z-20 -translate-x-4 -translate-y-4 rotate-[15deg] scale-115 drop-shadow-[0_4px_10px_rgba(47,128,237,0.2)] group-hover:scale-120 group-hover:rotate-[20deg] transition-all duration-500">
      <TonCoin size={58} />
    </div>

    <div className="absolute z-0 translate-x-12 -translate-y-8 rotate-[35deg] scale-75 opacity-60 group-hover:-translate-y-10 transition-all duration-500">
      <TonCoin size={42} />
    </div>

    <div className="absolute -translate-x-14 translate-y-6 text-sky-400 scale-75">
      <StarSVG size={18} />
    </div>
    <div className="absolute translate-x-12 translate-y-8 text-amber-300 scale-90">
      <StarSVG size={16} />
    </div>
    <div className="absolute translate-x-4 -translate-y-14 text-amber-400 scale-75 animate-bounce">
      <StarSVG size={12} />
    </div>
  </div>
));

const CloverVisual = React.memo(() => (
  <div className="absolute right-[-15px] sm:right-[-6px] top-1/2 -translate-y-1/2 w-[160px] h-[160px] sm:w-[180px] sm:h-[180px] flex items-center justify-center pointer-events-none select-none overflow-visible">
    <div className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(52,199,89,0.1) 0%, transparent 70%)' }} />
    
    <div className="absolute z-10 w-[95px] h-[95px] sm:w-[105px] sm:h-[105px] rounded-full bg-gradient-to-tr from-[#34c759] to-[#2eb850] flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-800 drop-shadow-[0_4px_12px_rgba(52,199,89,0.15)] group-hover:scale-105 group-hover:rotate-[8deg] transition-all duration-500">
      <svg width="52" height="52" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M12 9c.5-1.5 2-2.5 3.5-2.5s2.5 1 2.5 2.5c0 1.5-1 3-2.5 3.5C14 13 12.5 12 12 9zm0 6c-.5 1.5-2 2.5-3.5 2.5S6 16.5 6 15c0-1.5 1-3 2.5-3.5 1.5-.5 3 .5 3.5 3.5zm0-6c-.5-1.5-2-2.5-3.5-2.5S6 7.5 6 9c0 1.5 1 3 2.5 3.5 1.5.5 3-.5 3.5-3.5zm0 6c.5 1.5 2 2.5 3.5 2.5s2.5-1 2.5-2.5c0-1.5-1-3-2.5-3.5-1.5-.5-3 .5-3.5 3.5z" />
        <path d="M12 12c.5 1.5 1 3.5.5 5.5-.5 2-1.5 3.5-2.5 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>

    <div className="absolute -translate-x-14 -translate-y-8 text-[#34c759] opacity-80">
      <StarSVG size={18} />
    </div>
    <div className="absolute translate-x-14 translate-y-8 text-emerald-400 opacity-80">
      <StarSVG size={16} />
    </div>
    <div className="absolute translate-x-14 -translate-y-10 text-emerald-300 opacity-60">
      <StarSVG size={12} />
    </div>
    <div className="absolute -translate-x-10 translate-y-12 text-[#248a3d] opacity-80 animate-bounce">
      <StarSVG size={14} />
    </div>
  </div>
));

export const visualPromos: Announcement[] = [];

export const isDemoAnnouncement = (ann: Announcement): boolean => {
  const titleLower = ann.title?.toLowerCase() || '';
  const descLower = ann.description?.toLowerCase() || '';
  return (
    titleLower.includes('demo') ||
    titleLower.includes('test') ||
    titleLower.includes('deneme') ||
    titleLower.includes('kısa ve net') ||
    titleLower.includes('kisa ve net') ||
    titleLower.includes('bir başka duyuru') ||
    titleLower.includes('bir baska duyuru') ||
    descLower.includes('duyuru açıklaması') ||
    descLower.includes('duyuru aciklamasi') ||
    descLower.includes('kısa bir açıklama') ||
    descLower.includes('kisa bir aciklama')
  );
};

const PromoCard: React.FC<{ ann: Announcement, onShowPopup: (ann: Announcement) => void }> = React.memo(({ ann, onShowPopup }) => {
  const navigate = useNavigate();
  const { haptic } = useTelegram();
  const { t } = useTranslation();

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    haptic('light');
    
    try {
        await DatabaseService.incrementPromotionClick(ann.id);
    } catch (err) {
        console.warn("Click tracking error:", err);
    }

    if (ann.action_type === 'popup') onShowPopup(ann);
    else {
        let link = ann.button_link;
        if (!link) return;
        if (link.startsWith('@')) window.location.href = `https://t.me/${link.substring(1)}`;
        else if (link.startsWith('http')) window.location.href = link;
        else if (link.startsWith('/')) navigate(link);
        else window.location.href = `https://t.me/${link.replace('@','')}`;
    }
  };

  const isStars = ann.id === 'promo-stars' || ann.icon_name === 'stars' || ann.title.toLowerCase().includes('stars');
  const isTon = ann.id === 'promo-ton' || ann.icon_name === 'ton' || ann.title.toLowerCase().includes('ton');
  const isClover = ann.id === 'promo-clover' || ann.icon_name === 'clover' || ann.title.toLowerCase().includes('clover') || ann.title.toLowerCase().includes('gift') || ann.description.toLowerCase().includes('gift') || ann.description.toLowerCase().includes('lucky buy');

  let cardBgClass = "bg-[#f4f7f5] dark:bg-[#1a231d] border-[#e5ece8]/50 dark:border-white/5";
  let btnClass = "bg-[#34c759] hover:bg-[#2eb850] text-white shadow-emerald-500/10";

  if (isStars) {
    cardBgClass = "bg-[#fbf7ee] dark:bg-[#201d16] border-[#f3eccf]/50 dark:border-white/5";
    btnClass = "bg-[#ff9f0a] hover:bg-[#e08a00] text-white shadow-orange-500/10";
  } else if (isTon) {
    cardBgClass = "bg-[#f1f6fb] dark:bg-[#151c24] border-[#e3ebf4]/50 dark:border-white/5";
    btnClass = "bg-[#2f80ed] hover:bg-[#1b6cd5] text-white shadow-blue-500/10";
  }

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleAction}
        className={`w-full h-[185px] sm:h-[195px] shrink-0 rounded-[24px] border border-solid p-6 pb-5 sm:p-7 sm:pb-6 relative overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-305 hover:shadow-lg dark:hover:shadow-black/20 group backdrop-blur-md ${cardBgClass}`}
    >
        <div className="z-10 max-w-[58%] sm:max-w-[52%] flex flex-col items-start h-full justify-between">
            <div className="flex flex-col gap-1.5">
                <h3 className="text-[#0f172a] dark:text-white font-[900] text-[15px] sm:text-[17px] tracking-tight leading-snug font-sans group-hover:text-black dark:group-hover:text-slate-100 transition-colors">
                    {ann.title}
                </h3>
                <p className="text-[#64748b] dark:text-slate-400 text-[11px] sm:text-[12px] leading-snug sm:leading-[1.4] font-medium line-clamp-3">
                    {ann.description}
                </p>
            </div>

            <button 
                onClick={handleAction}
                className={`flex items-center gap-1.5 px-[15px] py-[7px] sm:px-[18px] sm:py-[8px] rounded-full text-xs sm:text-[13px] font-[900] tracking-wide transition-all active:scale-95 shadow-md ${btnClass}`}
            >
                <ArrowUpRight size={14} strokeWidth={3} className="shrink-0 scale-105" />
                <span>{ann.button_text}</span>
            </button>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-[42%] overflow-visible">
            {isStars && <StarVisual />}
            {isTon && <TonVisual />}
            {isClover && <CloverVisual />}
            
            {!isStars && !isTon && !isClover && ann.bg_image_url && (
                <div className="absolute right-[16px] top-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-[22px] overflow-hidden border border-black/5 dark:border-white/10 shadow-lg shrink-0 pointer-events-none">
                    <img 
                        src={ann.bg_image_url} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                        alt="" 
                        loading="lazy"
                    />
                </div>
            )}
        </div>
    </motion.div>
  );
});

const FeaturedBotsSlider: React.FC<{ bots: Bot[] }> = React.memo(({ bots }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const scroll = useDraggableScroll();
    const [activeType, setActiveType] = useState<'latest' | 'official' | 'featured'>('latest');
    const [scrollState, setScrollState] = useState({ left: false, right: true });

    const checkScroll = useCallback(() => {
        const el = scroll.ref.current;
        if (el) {
            const canScrollLeft = el.scrollLeft > 5;
            const canScrollRight = el.scrollLeft < (el.scrollWidth - el.clientWidth - 5);
            setScrollState({ left: canScrollLeft, right: canScrollRight });
        }
    }, [scroll.ref]);

    useEffect(() => {
        const el = scroll.ref.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            checkScroll(); // Initial check
            window.addEventListener('resize', checkScroll);
            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [checkScroll, scroll.ref, activeType]);

    const featuredBots = useMemo(() => {
        // En son eklenenler: If type is latest, show those flagged OR just the latest bots
        if (activeType === 'latest') {
            const flagged = bots.filter(b => b.promoted_type === 'latest');
            if (flagged.length > 0) return flagged;
            // Fallback: Show last 10 added bots
            return [...bots].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 10);
        }
        // Orjinal: Show official bots
        if (activeType === 'official') {
            const flagged = bots.filter(b => b.promoted_type === 'official');
            if (flagged.length > 0) return flagged;
            return bots.filter(b => b.is_official).sort((a, b) => Number(a.id) - Number(b.id));
        }
        // Market Özel: Show featured bots
        return bots.filter(b => b.promoted_type === 'featured');
    }, [bots, activeType]);

    const types = [
        { id: 'latest', label: t('home_latest_added') },
        { id: 'official', label: t('home_official') },
        { id: 'featured', label: t('home_market_special') }
    ];

    const cycleType = () => {
        const currentIndex = types.findIndex(t => t.id === activeType);
        const nextIndex = (currentIndex + 1) % types.length;
        setActiveType(types[nextIndex].id as any);
    };

    if (bots.length === 0) return null;

    return (
        <div className="home-search-bar latest-slider-container mb-6 md:mb-10 flex flex-col md:flex-row items-center !gap-[0.3rem] bg-[#ffffff] dark:bg-[#1e293b] px-4 md:px-[10px] !pt-[0.3rem] !pb-0 -mx-4 md:mx-0 rounded-none md:rounded-xl border-y md:border border-black/5 dark:border-white/5 relative overflow-hidden group !shadow-none">
            {/* Header Info */}
            <div className="flex flex-col shrink-0 min-w-full md:min-w-[180px] md:border-r border-black/5 dark:border-white/5 md:pr-6 h-full justify-center">
                <div 
                    className="flex items-center gap-1.5 mb-0.5 cursor-pointer md:cursor-default"
                    onClick={() => { if (window.innerWidth < 768) cycleType(); }}
                >
                    <h2 className="text-[17px] font-black text-slate-900 dark:text-white lowercase tracking-tight leading-none">
                        {types.find(t => t.id === activeType)?.label}
                    </h2>
                    <div className="text-slate-400">
                        <Info size={16} />
                    </div>
                </div>
                <div className="hidden md:flex flex-col">
                    {types.map(t => t.id !== activeType && (
                        <button 
                            key={t.id}
                            onClick={() => setActiveType(t.id as any)}
                            className="text-[14px] font-medium text-blue-500 lowercase hover:underline text-left transition-all"
                        >
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Slider Content */}
            <div className="relative flex-1 w-full overflow-hidden">
                {/* Left Blur & Button */}
                <AnimatePresence>
                    {scrollState.left && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#ffffff] dark:from-[#1e293b] via-[#ffffff]/80 dark:via-[#1e293b]/80 to-transparent z-40 pointer-events-none flex items-center pl-2"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll.ref.current?.scrollBy({ left: -300, behavior: 'smooth' }); }}
                                className="hidden md:flex w-8 h-8 bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-brand transition-all shadow-lg pointer-events-auto active:scale-95"
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Right Blur & Button */}
                <AnimatePresence>
                    {scrollState.right && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#ffffff] dark:from-[#1e293b] via-[#ffffff]/80 dark:via-[#1e293b]/80 to-transparent z-40 pointer-events-none flex items-center justify-end pr-2"
                        >
                            <button 
                                onClick={(e) => { e.stopPropagation(); scroll.ref.current?.scrollBy({ left: 300, behavior: 'smooth' }); }}
                                className="hidden md:flex w-8 h-8 bg-white dark:bg-slate-800 border border-black/5 dark:border-white/10 rounded-full items-center justify-center text-slate-400 hover:text-brand transition-all shadow-lg pointer-events-auto active:scale-95"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div 
                    ref={scroll.ref}
                    onMouseDown={scroll.onMouseDown}
                    onMouseUp={scroll.onMouseUp}
                    onMouseMove={scroll.onMouseMove}
                    onMouseLeave={scroll.onMouseLeave}
                    onContextMenu={scroll.onContextMenu}
                    className={`flex items-start gap-10 overflow-x-auto no-scrollbar py-2 transform-gpu will-change-transform ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    {featuredBots.map((bot) => (
                        <motion.div
                            key={bot.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => navigate(`/bot/${bot.slug}`)}
                            className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group/item w-20"
                        >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                    <div className="w-[58px] h-[58px] rounded-full p-[2px] bg-gradient-to-tr from-black/5 to-black/10 dark:from-white/5 dark:to-white/10 group-hover/item:from-blue-500/50 group-hover/item:to-brand/50 transition-all">
                                        <img 
                                            src={getLiveBotIcon(bot)} 
                                            className="w-full h-full rounded-full border border-black/5 dark:border-white/10 shadow-lg object-cover bg-white dark:bg-slate-800"
                                            onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                                            referrerPolicy="no-referrer"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200 tracking-tight leading-tight whitespace-nowrap overflow-hidden text-ellipsis w-full group-hover/item:text-blue-500 transition-colors">
                                        {bot.name.length > 9 ? bot.name.substring(0, 9) + '...' : bot.name}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                </div>
            </div>
        </div>
    );
});

const BotCard: React.FC<{ bot: Bot, tonRate: number, featuredRank?: number }> = React.memo(({ bot, tonRate, featuredRank }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const prices = useMemo(() => PriceService.convert(bot.price, tonRate), [bot.price, tonRate]);
  
  const haptic = (vibe: 'light' | 'medium') => {
    try {
      if (vibe === 'light') window.navigator.vibrate?.(10);
      else window.navigator.vibrate?.(20);
    } catch {}
  };

  const firstCatId = bot.category?.[0];
  const catLabelObj = categories.find(c => c.id === firstCatId);
  const catLabel = catLabelObj ? t(catLabelObj.label) : firstCatId;

  const formattedUserCount = useMemo(() => {
    if (!bot.user_count) return null;
    if (bot.user_count >= 1000000) {
      return (bot.user_count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (bot.user_count >= 1000) {
      return (bot.user_count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return bot.user_count.toString();
  }, [bot.user_count]);

  return (
    <div 
      onClick={() => navigate(`/bot/${bot.slug}`)} 
      className="flex flex-col p-5 bg-white dark:bg-[#0F1623] border border-black/[0.06] dark:border-white/[0.06] rounded-[16px] transition-all duration-[180ms] ease-out hover:border-black/[0.12] dark:hover:border-white/[0.12] shadow-none hover:shadow-none active:scale-[0.98] transform-gpu cursor-pointer select-none group w-full relative min-h-[175px]"
    >
        {/* Top: bot identity (avatar + name) + category badge inline */}
        <div className="flex items-start justify-between gap-3 w-full mb-3.5 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
                <img 
                    src={getLiveBotIcon(bot)} 
                    alt={bot.name} 
                    loading="lazy"
                    className="w-10 h-10 rounded-xl object-cover bg-slate-50 dark:bg-slate-800 border border-black/[0.04] dark:border-white/[0.06] shrink-0" 
                    onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
                />
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <h3 className="font-bold text-[15px] text-slate-900 dark:text-slate-50 truncate tracking-tight leading-none group-hover:text-blue-500 transition-colors">
                            {bot.name}
                        </h3>
                        {bot.is_official && (
                            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="text-[#139fec] shrink-0">
                                <path fillRule="evenodd" clipRule="evenodd" d="M7.408 1.2375C7.57933 1.11017 7.78667 1.0415 8 1.0415C8.21333 1.0415 8.42067 1.11017 8.592 1.23749L9.81067 2.14417C9.83467 2.16217 9.86133 2.1755 9.88933 2.18484C9.91733 2.19417 9.94733 2.19884 9.97733 2.19817L11.496 2.18084C11.7093 2.17817 11.918 2.24484 12.09 2.37017C12.2627 2.4955 12.39 2.6735 12.454 2.87684L12.9073 4.32617C12.916 4.35484 12.93 4.3815 12.9473 4.4055C12.9647 4.4295 12.986 4.45084 13.0107 4.46817L14.2493 5.34684C14.4233 5.47017 14.5527 5.64617 14.6187 5.8495C14.6847 6.05217 14.6833 6.27084 14.6153 6.4735L14.13 7.91284C14.1207 7.94084 14.1153 7.97084 14.1153 8.00017C14.1153 8.0295 14.12 8.0595 14.13 8.0875L14.6153 9.52684C14.6833 9.72884 14.6847 9.9475 14.6187 9.9475L14.6187 10.1508C14.5527 10.3535 14.4233 10.5302 14.2493 10.6535L13.0107 11.5322C12.9867 11.5495 12.9653 11.5702 12.9473 11.5948C12.93 11.6188 12.9167 11.6455 12.9073 11.6742L12.454 13.1235C12.3907 13.3268 12.2627 13.5048 12.09 13.6302C11.9173 13.7555 11.7093 13.8222 11.496 13.8195L9.97733 13.8022C9.94733 13.8015 9.918 13.8062 9.88933 13.8155C9.86133 13.8248 9.83467 13.8382 9.81067 13.8562L8.592 14.7628C8.42067 14.8902 8.21333 14.9588 8 14.9588C7.78667 14.9588 7.57933 14.8902 7.408 14.7628L6.18933 13.8562C6.16533 13.8382 6.13867 13.8248 6.11067 13.8155C6.08267 13.8062 6.05267 13.8015 6.02267 13.8022L4.504 13.8195C4.29067 13.8222 4.082 13.7555 3.91 13.6302C3.73733 13.5048 3.61 13.3268 3.546 13.1235L3.09267 11.6742C3.084 11.6455 3.07 11.6188 3.05267 11.5948C3.03533 11.5708 3.014 11.5495 2.98933 11.5322L1.75067 10.6535C1.57667 10.5302 1.44733 10.3542 1.38133 10.1508C1.31533 9.94817 1.31667 9.7295 1.38467 9.52684L1.87 8.00017C1.88067 8.0595 1.88533 8.03017 1.88533 8.00017C1.88533 7.97017 1.88067 7.94084 1.87067 7.91284L1.38533 6.4735C1.31733 6.2715 1.316 6.05284 1.382 5.8495C1.448 5.64684 1.57733 5.3475 1.75133 5.3475L1.75133 5.3475L2.99 4.46884C3.014 4.45084 3.03533 4.43017 3.05333 4.40617C3.07067 4.38217 3.084 4.3555 3.09333 4.32684L3.54667 2.8775C3.61 2.67417 3.738 2.49617 3.91067 2.37084C4.08333 2.2455 4.29133 2.17884 4.50467 2.1815L6.02333 2.19884C6.05333 2.1995 6.08266 2.19484 6.11133 2.1855C6.13933 2.17617 6.166 2.16284 6.19 2.14484L7.408 1.2375Z" fill="currentColor"></path>
                            </svg>
                        )}
                    </div>
                </div>
            </div>
            {catLabel && (
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.04] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 transition-opacity">
                    {catLabel}
                </span>
            )}
        </div>

        {/* Middle: 1 line "personality text" -> Handles Telegram automation in seconds */}
        <div className="mb-4 flex-1 min-h-[22px]">
            <p className="text-[13px] sm:text-[13.5px] text-slate-500/90 dark:text-slate-400/90 font-normal leading-normal line-clamp-1 truncate">
                {bot.description.startsWith('bot_') ? t(bot.description) : bot.description}
            </p>
        </div>

        {/* Bottom: usage signal (not stats noise) & primary CTA */}
        <div className="mt-auto pt-3 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-between gap-3">
            {/* Usage signal */}
            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 font-bold">
                <span className="text-slate-700 dark:text-slate-400">{formattedUserCount || bot.views || '1.1k'}</span>
                <span>{t('users') || 'users'}</span>
            </div>

            {/* CTA Button */}
            <button 
                className={featuredRank 
                    ? "px-4 py-1.5 bg-orange-500/10 hover:bg-orange-500 text-orange-600 hover:text-white dark:bg-orange-500/15 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white rounded-lg transition-all text-[12px] font-extrabold leading-none active:scale-95 border border-orange-500/20 flex items-center justify-center gap-1"
                    : "px-4 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white rounded-lg transition-all text-[12px] font-extrabold leading-none active:scale-95 border border-blue-500/20"}
                onClick={(e) => {
                    e.stopPropagation();
                    haptic('light');
                    if (bot.bot_link) {
                        window.open(bot.bot_link, '_blank', 'noopener,noreferrer');
                    } else {
                        navigate(`/bot/${bot.slug}`);
                    }
                }}
            >
                {featuredRank ? (
                    <>
                        <svg aria-hidden="true" className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
                            <use href="#solar.fire"></use>
                        </svg>
                        <span>öne çıkan #{featuredRank}</span>
                    </>
                ) : (t('run') || 'Run')}
            </button>
        </div>
    </div>
  );
});

const CategoryBotCard: React.FC<{ bot: Bot, rank: number }> = React.memo(({ bot, rank }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate(`/bot/${bot.slug}`)} 
      className="flex items-center cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-900/40 border border-transparent hover:border-black/[0.03] dark:hover:border-white/[0.03] transition-all duration-300 rounded-2xl p-3 select-none active:scale-[0.98] transform-gpu"
    >
        <div className="relative shrink-0 select-none">
            <img 
                src={getLiveBotIcon(bot)} 
                alt={bot.name} 
                loading="lazy"
                className="w-12 h-12 sm:w-[54px] sm:h-[54px] rounded-[11px] sm:rounded-[13px] object-cover bg-slate-100 dark:bg-slate-900 border border-black/[0.04] dark:border-white/[0.06] transition-transform" 
                onError={(e) => { (e.target as any).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bot.name)}&background=334155&color=fff&bold=true`; }}
            />
            <div className="absolute -right-1.5 -bottom-1.5 w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 flex items-center justify-center font-[900] text-[10px] sm:text-[11px] shadow-[0_2px_5px_rgba(0,0,0,0.12)] border border-slate-100 dark:border-slate-700/50">
                {rank}
            </div>
        </div>
        <div className="flex-1 ml-4 sm:ml-4.5 min-w-0 pr-1 select-none">
            <h3 className="font-extrabold text-[14px] sm:text-[15.5px] text-slate-900 dark:text-slate-50 font-sans tracking-tight leading-tight mb-1 flex items-center gap-1">
                <span className="truncate">{bot.name}</span>
                {bot.is_official && (
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="w-[14px] h-[14px] text-[#24a1de] dark:text-[#38bdf8] shrink-0">
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.408 1.2375C7.57933 1.11017 7.78667 1.0415 8 1.0415C8.21333 1.0415 8.42067 1.11017 8.592 1.2375L9.81067 2.14417C9.83467 2.16217 9.86133 2.1755 9.88933 2.18484C9.91733 2.19417 9.94733 2.19884 9.97733 2.19817L11.496 2.18084C11.7093 2.17817 11.918 2.24484 12.09 2.37017C12.2627 2.4955 12.39 2.6735 12.454 2.87684L12.9073 4.32617C12.916 4.35484 12.93 4.3815 12.9473 4.4055C12.9647 4.4295 12.986 4.45084 13.0107 4.46817L14.2493 5.34684C14.4233 5.47017 14.5527 5.64617 14.6187 5.8495C14.6847 6.05217 14.6833 6.27084 14.6153 6.4735L14.13 7.91284C14.1207 7.94084 14.1153 7.97084 14.1153 8.00017C14.1153 8.0295 14.12 8.0595 14.13 8.0875L14.6153 9.52684C14.6833 9.72884 14.6847 9.9475 14.6187 10.1508C14.5527 10.3535 14.4233 10.5302 14.2493 10.6535L13.0107 11.5322C12.9867 11.5495 12.9653 11.5702 12.9473 11.5948C12.93 11.6188 12.9167 11.6455 12.9073 11.6742L12.454 13.1235C12.3907 13.3268 12.2627 13.5048 12.09 13.6302C11.9173 13.7555 11.7093 13.8222 11.496 13.8195L9.97733 13.8022C9.94733 13.8015 9.918 13.8062 9.88933 13.8155C9.86133 13.8248 9.83467 13.8382 9.81067 13.8562L8.592 14.7628C8.42067 14.8902 8.21333 14.9588 8 14.9588C7.78667 14.9588 7.57933 14.8902 7.408 14.7628L6.18933 13.8562C6.16533 13.8382 6.13867 13.8248 6.11067 13.8155C6.08267 13.8062 6.05267 13.8015 6.02267 13.8022L4.504 13.8195C4.29067 13.8222 4.082 13.7555 3.91 13.6302C3.73733 13.5048 3.61 13.3268 3.546 13.1235L3.09267 11.6742C3.084 11.6455 3.07 11.6188 3.05267 11.5948C3.03533 11.5708 3.014 11.5495 2.98933 11.5322L1.75067 10.6535C1.57667 10.5302 1.44733 10.3542 1.38133 10.1508C1.31533 9.94817 1.31667 9.7295 1.38467 9.52684L1.87 8.00017C1.88067 8.0595 1.88533 8.03017 1.88533 8.00017C1.88533 7.97017 1.88067 7.94084 1.87067 7.91284L1.38533 6.4735C1.31733 6.2715 1.316 6.05284 1.382 5.8495C1.448 5.64684 1.57733 5.47084 1.75133 5.3475L2.99 4.46884C3.014 4.45084 3.03533 4.43017 3.05333 4.40617C3.07067 4.38217 3.084 4.3555 3.09333 4.32684L3.54667 2.8775C3.61 2.67417 3.738 2.49617 3.91067 2.37084C4.08333 2.2455 4.29133 2.17884 4.50467 2.1815L6.02333 2.19884C6.05333 2.1995 6.08266 2.19484 6.11133 2.1855C6.13933 2.17617 6.166 2.16284 6.19 2.14484L7.408 1.2375Z" fill="currentColor"></path>
                        <path fillRule="evenodd" clipRule="evenodd" d="M7.33334 10.6668C7.16267 10.6668 6.992 10.6015 6.862 10.4715L4.862 8.4715C4.60134 8.21083 4.60134 7.7895 4.862 7.52883C5.12267 7.26817 5.544 7.26817 5.80467 7.52883L7.33334 9.0575L10.1953 6.1955C10.456 5.93483 10.8773 5.93483 11.138 6.1955C11.3987 6.45617 11.3987 6.8775 11.138 7.13817L7.80467 10.4715C7.67467 10.6015 7.504 10.6668 7.33334 10.6668Z" fill="white"></path>
                    </svg>
                )}
            </h3>
            <p className="text-[12px] sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-[1.35] line-clamp-2">
                {bot.description}
            </p>
        </div>
    </div>
  );
});

const getMobileColumns = (bots: Bot[]) => {
  const list = bots.slice(0, 9);
  const cols = [];
  
  if (list.length <= 3) {
    for (let i = 0; i < list.length; i++) {
      cols.push([{ bot: list[i], rank: i + 1 }]);
    }
  } else if (list.length <= 6) {
    const row1 = list.slice(0, 3);
    const row2 = list.slice(3, 6);
    
    for (let i = 0; i < Math.max(row1.length, row2.length); i++) {
      const colItems = [];
      if (row1[i]) colItems.push({ bot: row1[i], rank: i + 1 });
      if (row2[i]) colItems.push({ bot: row2[i], rank: i + 4 });
      cols.push(colItems);
    }
  } else {
    const row1 = list.slice(0, 3);
    const row2 = list.slice(3, 6);
    const row3 = list.slice(6, 9);
    
    for (let i = 0; i < 3; i++) {
      const colItems = [];
      if (row1[i]) colItems.push({ bot: row1[i], rank: i + 1 });
      if (row2[i]) colItems.push({ bot: row2[i], rank: i + 4 });
      if (row3[i]) colItems.push({ bot: row3[i], rank: i + 7 });
      cols.push(colItems);
    }
  }
  return cols;
};


const NavMenu = ({ 
    isScrolled, 
    user, 
    unreadCount, 
    theme, 
    toggleTheme, 
    haptic, 
    isMenuOpen, 
    setIsMenuOpen, 
    setIsLoginModalOpen, 
    setWebAuthUser, 
    isLoginModalOpen,
    menuRef: parentMenuRef,
    openMenu,
    setOpenMenu,
    navState,
    setNavState,
    mobileModal,
    setMobileModal
}: { 
    isScrolled: boolean, 
    user: any, 
    unreadCount: number, 
    theme: string, 
    toggleTheme: () => void, 
    haptic: any, 
    isMenuOpen: boolean, 
    setIsMenuOpen: (v: boolean) => void,
    setIsLoginModalOpen: (v: boolean) => void,
    setWebAuthUser: (v: any) => void,
    isLoginModalOpen: boolean,
    menuRef: React.RefObject<HTMLDivElement>,
    openMenu: 'kesfet' | 'investors' | null,
    setOpenMenu: (v: 'kesfet' | 'investors' | null) => void,
    navState: 'main' | 'bots' | 'apps',
    setNavState: (v: 'main' | 'bots' | 'apps') => void,
    mobileModal: 'kesfet' | 'investors' | null,
    setMobileModal: (v: 'kesfet' | 'investors' | null) => void
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const internalMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (internalMenuRef.current && !internalMenuRef.current.contains(event.target as Node)) {
                setOpenMenu(null);
                setNavState('main');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const botsCategories = categories.filter(c => c.id !== 'apps' && c.id !== 'all');
    const appsCategories = appsSubCategories;

    const handleCategoryClick = (catId: string, mode: 'bots' | 'apps') => {
        haptic('light');
        navigate(`/search?mode=${mode}&category=${catId}`);
        setOpenMenu(null);
        setMobileModal(null);
        setNavState('main');
    };

    interface MenuItem {
        id: string;
        label: string;
        desc: string;
        icon: any;
        action?: () => void;
        path?: string;
    }

    const discoverItems: MenuItem[] = [
        { id: 'bots', label: 'Botlar', desc: 'Telegram Bot Marketi', icon: BotIcon, action: () => setNavState('bots') },
        { id: 'apps', label: 'Uygulamalar', desc: 'Web3 & TMA Uygulamaları', icon: LayoutGrid, action: () => setNavState('apps') },
        { id: 'channels', label: 'Kanallar', desc: 'Popüler Telegram Kanalları', icon: Megaphone, path: '/channels' },
        { id: 'ads', label: 'Reklam', desc: 'Projenizi Öne Çıkarın', icon: Share2, path: '/settings' },
    ];

    const investorItems: MenuItem[] = [
        { id: 'exchanges', label: 'Borsalar ve Takas', desc: 'CEX & DEX Platformları', icon: BarChart3 },
        { id: 'earn', label: 'Kazanç Uygulamaları', desc: 'Pasif Gelir Fırsatları', icon: Coins },
        { id: 'tools', label: 'Yatırım Araçları', desc: 'Analiz ve Takip Araçları', icon: Briefcase },
        { id: 'new', label: 'Yeni Keşifler', desc: 'Gelecek Vaadeden Projeler', icon: Compass },
    ];

    const simpleLinks = [
        { label: 'Hızlı Link 1', path: '#' },
        { label: 'Hızlı Link 2', path: '#' },
        { label: 'Hızlı Link 3', path: '#' },
    ];

    const renderMegaMenuContent = () => {
        if (openMenu === 'kesfet') {
            return (
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
                    <div className="col-span-8">
                        <AnimatePresence mode="wait">
                            {navState === 'main' ? (
                                <motion.div 
                                    key="main"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    {discoverItems.map(item => (
                                        <button 
                                            key={item.id}
                                            onClick={() => {
                                                if (item.action) item.action();
                                                else if (item.path) { navigate(item.path); setOpenMenu(null); }
                                            }}
                                            className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                                        >
                                            <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                <item.icon size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                                <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            ) : navState === 'bots' ? (
                                <motion.div 
                                    key="bots"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Bot Kategorileri</h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {botsCategories.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id, 'bots')}
                                                className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                                            >
                                                <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <cat.icon size={16} />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="apps"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col gap-6"
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                                        >
                                            <ArrowLeft size={20} />
                                        </button>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Uygulama Kategorileri</h3>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {appsCategories.map(cat => (
                                            <button 
                                                key={cat.id}
                                                onClick={() => handleCategoryClick(cat.id, 'apps')}
                                                className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                                            >
                                                <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                    <cat.icon size={16} />
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Hızlı Bağlantılar</span>
                        {simpleLinks.map((link, i) => (
                            <a 
                                key={i}
                                href={link.path}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-xs uppercase group"
                            >
                                {link.label}
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                        ))}
                    </div>
                </div>
            );
        }

        if (openMenu === 'investors') {
            return (
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
                    <div className="col-span-8">
                        <div className="grid grid-cols-2 gap-4">
                            {investorItems.map(item => (
                                <button 
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                                >
                                    <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <item.icon size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                        <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Yatırım Linkleri</span>
                        {simpleLinks.map((link, i) => (
                            <a 
                                key={i}
                                href={link.path}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all font-bold text-xs uppercase group"
                            >
                                {link.label}
                                <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                            </a>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <>
        <div className="sticky top-0 z-[1] bg-white dark:bg-slate-900 border-b border-[#f7f7f7] dark:border-white/5 w-full py-2.5 md:pb-2 transition-colors" ref={internalMenuRef}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
                {/* Left Section (Logo) */}
                <div className="hidden md:flex items-center w-48 shrink-0">
                    {isScrolled ? (
                        <Logo onClick={() => navigate('/')} className="cursor-pointer" />
                    ) : null}
                </div>

                {/* Center Section (Navigation) */}
                <div className="flex items-center justify-center gap-8 md:gap-14 flex-1">
                    {/* Discover / Keşfet */}
                    <button 
                        onClick={() => { haptic('light'); navigate('/'); }}
                        className="nav-menu-item grow-0 text-slate-600 dark:text-slate-400 hover:bg-blue-500/5"
                    >
                        {t('nav_explore')}
                    </button>

                    {/* Categories / Kategoriler */}
                    <div 
                        className="relative md:static"
                        onMouseEnter={() => { if (window.innerWidth >= 768) setOpenMenu('kesfet'); }}
                    >
                        <button 
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    haptic('light');
                                    setMobileModal('kesfet');
                                } else {
                                    setOpenMenu(openMenu === 'kesfet' ? null : 'kesfet');
                                }
                            }}
                            className={`nav-menu-item grow-0 ${openMenu === 'kesfet' ? 'text-slate-900 dark:text-white bg-blue-500/5' : 'text-slate-600 dark:text-slate-400 hover:bg-blue-500/5'}`}
                        >
                            Kategoriler <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openMenu === 'kesfet' ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* My Bots / Botlarım */}
                    <button 
                        onClick={() => { haptic('light'); navigate('/my-bots'); }}
                        className="nav-menu-item text-slate-600 dark:text-slate-400 hover:bg-blue-500/5"
                    >
                        {t('my_bots')}
                    </button>
                </div>

                {/* Profile Section */}
                <div className="flex items-center justify-end md:w-48 shrink-0">
                    <AnimatePresence mode="wait">
                        {isScrolled && (
                            <motion.div 
                                key="scrolled-actions"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="hidden md:flex items-center gap-2 md:gap-3"
                            >
                                {user && (
                                    <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl text-slate-900 dark:text-white active:scale-95 transition-all outline-none shrink-0">
                                        <Wallet size={18} />
                                    </button>
                                )}

                                <div className="relative font-sans" ref={parentMenuRef}>
                                    <button 
                                      onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                                      className={`h-10 px-3 flex items-center gap-2 border border-black/5 dark:border-white/5 text-slate-900 dark:text-white rounded-xl active:scale-95 transition-all relative ${isMenuOpen ? 'bg-slate-100 dark:bg-white/10' : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                    >
                                         <div className="flex md:hidden items-center gap-1.5">
                                             {user ? (
                                                 <span className="text-[11px] font-black uppercase tracking-wide">
                                                     {(user.username || user.first_name || user.name || '').slice(0, 5)}{(user.username || user.first_name || user.name || '').length > 5 ? '..' : ''}
                                                 </span>
                                             ) : (
                                                 <Menu size={18} className="text-slate-700 dark:text-slate-300" />
                                             )}
                                             <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                         </div>
                                         <div className="hidden md:flex items-center gap-1.5">
                                             {user ? (
                                                 <>
                                                     <span className="text-[11px] font-black uppercase tracking-wide">
                                                         {user.username || user.first_name || user.name || ''}
                                                     </span>
                                                     <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                                 </>
                                             ) : (
                                                 <Settings size={18} className="text-slate-700 dark:text-slate-300" />
                                             )}
                                         </div>
                                        {user && unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[8px] font-black text-white flex items-center justify-center px-1">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </div>
                                        )}
                                    </button>
                                    {isMenuOpen && (
                                        <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                            {user ? (
                                                <>
                                                    <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                                                        <div className="flex items-center gap-3">
                                                            {(user.photo_url || user.avatar) ? (
                                                                <img 
                                                                    src={user.photo_url || user.avatar} 
                                                                    alt={user.first_name || user.name}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black">
                                                                    {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                                                    {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 truncate">@{user.username || user.id}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button onClick={() => { haptic('light'); navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <Store size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('market')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('profile')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <BotIcon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('my_bots')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <Megaphone size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('my_channels')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <div className="flex items-center gap-3">
                                                            <Bell size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                            <span className="text-xs font-bold uppercase tracking-tight">{t('notifications')}</span>
                                                        </div>
                                                        {unreadCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/qa'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <MessageSquare size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">Soru Cevap & Q&A</span>
                                                    </button>

                                                    <div className="h-px bg-slate-100 dark:border-white/5 my-2" />

                                                    {/* Gece Modu & Add Your inside dropdown */}
                                                    <button onClick={() => { haptic('light'); toggleTheme(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        {theme === 'dark' ? (
                                                            <>
                                                                <Sun size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                                <span className="text-xs font-bold uppercase tracking-tight">{t('light_mode') || 'Gündüz Modu'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Moon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                                <span className="text-xs font-bold uppercase tracking-tight">{t('dark_mode') || 'Gece Modu'}</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <Plus size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('add_your')}</span>
                                                    </button>

                                                    <div className="h-px bg-slate-100 dark:border-white/5 my-2" />
                                                    
                                                    <button 
                                                        onClick={() => { 
                                                            const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
                                                            if (confirmed) {
                                                                haptic('medium'); 
                                                                setWebAuthUser(null);
                                                                setIsMenuOpen(false); 
                                                            }
                                                        }} 
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase text-left"
                                                    >
                                                        <LogOut size={18} /> 
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('home_logout')}</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => { haptic('light'); setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group font-bold text-left">
                                                        <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('login')}</span>
                                                    </button>

                                                    <button onClick={() => { haptic('light'); toggleTheme(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        {theme === 'dark' ? (
                                                            <>
                                                                <Sun size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                                <span className="text-xs font-bold uppercase tracking-tight">{t('light_mode') || 'Gündüz Modu'}</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Moon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                                <span className="text-xs font-bold uppercase tracking-tight">{t('dark_mode') || 'Gece Modu'}</span>
                                                            </>
                                                        )}
                                                    </button>

                                                    <button onClick={() => { haptic('light'); navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                                        <Plus size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                        <span className="text-xs font-bold uppercase tracking-tight">{t('add_your')}</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {!user && (
                                    <button 
                                        onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                                        className="nav-menu-item !px-5 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-[10px] transition-all active:scale-95 flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-500/25 border-none"
                                    >
                                        {t('home_login')}
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Desktop Mega Menu Dropdown */}
            <AnimatePresence>
                {openMenu && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-2xl z-[100] mega-menu-container"
                        onMouseLeave={() => { setOpenMenu(null); setNavState('main'); }}
                    >
                        {renderMegaMenuContent()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

        {/* Mobile Modal for Categories */}
        <AnimatePresence>
            {mobileModal && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:hidden">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setMobileModal(null); setNavState('main'); }}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden pt-4 pb-12 border-t border-black/10 dark:border-white/10"
                    >
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                        
                        <div className="flex justify-between items-center mb-6 px-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic">
                                {mobileModal === 'kesfet' ? 'KEŞFET' : 'YATIRIMCILAR'}
                            </h3>
                            <button onClick={() => { setMobileModal(null); setNavState('main'); }} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 active:scale-90 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="max-h-[70vh] overflow-y-auto px-6 pb-4">
                            <AnimatePresence mode="wait">
                                {navState === 'main' ? (
                                    <motion.div 
                                        key="mobile-main"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 gap-3"
                                    >
                                        {(mobileModal === 'kesfet' ? discoverItems : investorItems).map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (item.action) item.action();
                                                    else if (item.path) { navigate(item.path); setMobileModal(null); }
                                                }}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-all rounded-2xl border border-black/5 dark:border-white/5 group mobile-menu-item"
                                            >
                                                <div className={`mobile-menu-icon-container flex items-center justify-center rounded-xl shrink-0 ${mobileModal === 'kesfet' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                    <item.icon size={22} className="menu-item-icon" />
                                                </div>
                                                <div className="flex flex-col items-start min-w-0">
                                                    <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate w-full">
                                                        {item.label}
                                                    </span>
                                                </div>
                                                {item.action && <ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-700" />}
                                            </button>
                                        ))}
                                    </motion.div>
                                ) : navState === 'bots' ? (
                                    <motion.div 
                                        key="mobile-bots"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col gap-4"
                                    >
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                                        >
                                            <ArrowLeft size={16} /> Geri
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            {botsCategories.map(cat => (
                                                <button 
                                                    key={cat.id}
                                                    onClick={() => handleCategoryClick(cat.id, 'bots')}
                                                    className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item"
                                                >
                                                    <div className="mobile-menu-icon-container flex items-center justify-center text-blue-500">
                                                        <cat.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="mobile-apps"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col gap-4"
                                    >
                                        <button 
                                            onClick={() => setNavState('main')}
                                            className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                                        >
                                            <ArrowLeft size={16} /> Geri
                                        </button>
                                        <div className="grid grid-cols-2 gap-3">
                                            {appsCategories.map(cat => (
                                                <button 
                                                    key={cat.id}
                                                    onClick={() => handleCategoryClick(cat.id, 'apps')}
                                                    className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item"
                                                >
                                                    <div className="mobile-menu-icon-container flex items-center justify-center text-emerald-500">
                                                        <cat.icon size={20} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {navState === 'main' && (
                                <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 block mb-4">Hızlı Bağlantılar</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {simpleLinks.map((link, i) => (
                                            <a 
                                                key={i}
                                                href={link.path}
                                                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase"
                                            >
                                                {link.label}
                                                <ExternalLink size={14} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
};

const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, haptic, isTelegram, setWebAuthUser } = useTelegram();
  const { toggleTheme, theme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<'kesfet' | 'investors' | null>(null);
  const [navState, setNavState] = useState<'main' | 'bots' | 'apps'>('main');
  const [mobileModal, setMobileModal] = useState<'kesfet' | 'investors' | null>(null);
  const [bots, setBots] = useState<Bot[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(visualPromos);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [tonRate, setTonRate] = useState(250);
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { activeFilter } = useFilter();
  const [selectedAppsCategory, setSelectedAppsCategory] = useState('all');
  const [selectedBotsCategory, setSelectedBotsCategory] = useState('all');
  const [homeBlogs, setHomeBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    const handleScroll = () => {
        setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const annScroll = useDraggableScroll();
  const catScroll = useDraggableScroll();
  const botsCatScroll = useDraggableScroll();

  const botsCategories = categories.filter(c => c.id !== 'apps' && c.id !== 'all');

  const filteredBots = useMemo(() => {
    let result = [...bots];
    
    if (activeFilter === 'paid') result = result.filter(b => b.price > 0);
    else if (activeFilter === 'free') result = result.filter(b => b.price === 0);
    else if (activeFilter === 'popular') result = result.sort((a, b) => (b.views || 0) - (a.views || 0));
    else if (activeFilter === 'bhub') result = result.filter(b => b.is_official);
    
    return result;
  }, [bots, activeFilter]);

  const loadData = useCallback(async () => {
    // İlk yüklemede sadece botları, duyuruları ve son blogları çek, fiyatı arka planda güncelle
    const [botData, annData, blogData] = await Promise.all([
        DatabaseService.getBots(),
        DatabaseService.getAnnouncements(),
        DatabaseService.getBlogs(3)
    ]);
    
    setBots(botData);
    const activeAnns = annData.filter(a => a.is_active && !isDemoAnnouncement(a));
    const combinedAnns = [
        ...visualPromos,
        ...activeAnns.filter(dbAnn => !visualPromos.some(vp => vp.title.toLowerCase() === dbAnn.title.toLowerCase() || vp.id === dbAnn.id))
    ];
    setAnnouncements(combinedAnns);
    setHomeBlogs(blogData);
    setIsLoading(false);

    // Fiyat ve bildirimleri arka planda çek
    PriceService.getTonPrice().then(pData => setTonRate(pData.tonTry));
    
    if (user?.id) {
        DatabaseService.getNotifications(user.id.toString()).then(notes => {
            const unread = notes.filter(n => !n.isRead).length;
            setUnreadCount(unread);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    loadData();
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [loadData]);

  const categorizedBots = useMemo(() => {
    const result: Record<string, { featured: Bot[], slider: Bot[], total: number }> = {};
    const baseBots = [...filteredBots].sort((a, b) => (b.views || 0) - (a.views || 0));

    // Apps section
    const allApps = baseBots.filter(b => Array.isArray(b.category) ? b.category.includes('apps') : b.category === 'apps');
    
    // Top 3 (First 3 bots will be the dashboards selected featured bot or app, with fallbacks)
    const dashboardAppsFeatured = allApps.filter(b => b.promoted_type === 'featured');
    const remainingApps = allApps.filter(b => b.promoted_type !== 'featured');
    const appsFeatured = [...dashboardAppsFeatured, ...remainingApps].slice(0, 3);
    
    // Slider/List (Popular apps in selected category)
    let appsForList = allApps;
    if (selectedAppsCategory !== 'all') {
        const appsCategoryMap: Record<string, (b: Bot) => boolean> = {
            'trending': (b) => (b.views || 0) > 50,
            'editors_choice': (b) => b.promoted_type === 'featured',
            'new': (b) => !!b.isNew,
            'games_sub': (b) => Array.isArray(b.category) ? b.category.includes('games') : b.category === 'games',
            'ai_sub': (b) => Array.isArray(b.category) ? b.category.includes('ai_services') : b.category === 'ai_services',
            'trade': (b) => Array.isArray(b.category) ? b.category.includes('finance') : b.category === 'finance',
            'social': (b) => Array.isArray(b.category) ? b.category.includes('communication') : b.category === 'communication',
            'security_privacy': (b) => Array.isArray(b.category) ? b.category.includes('security') : b.category === 'security',
            'dev': (b) => Array.isArray(b.category) ? b.category.includes('utilities') : b.category === 'utilities',
            'art': (b) => Array.isArray(b.category) ? b.category.includes('content') : b.category === 'content',
            'earn': (b) => Array.isArray(b.category) ? b.category.includes('crypto') : b.category === 'crypto',
            'web3_general': (b) => Array.isArray(b.category) ? b.category.includes('crypto') || b.category.includes('finance') : b.category === 'crypto',
            'tma_bots': (b) => true,
            'ton_sites': (b) => true,
            'saas': (b) => Array.isArray(b.category) ? b.category.includes('productivity') : b.category === 'productivity'
        };
        if (appsCategoryMap[selectedAppsCategory]) {
            appsForList = allApps.filter(appsCategoryMap[selectedAppsCategory]);
        } else {
            appsForList = allApps.filter(b => 
                Array.isArray(b.category) 
                    ? b.category.includes(selectedAppsCategory) 
                    : b.category === selectedAppsCategory
            );
        }
    }
    const appsSlider = appsForList.slice(0, 9); // Limit to 9 as requested

    if (allApps.length > 0) {
        result['apps'] = {
            featured: appsFeatured,
            slider: appsSlider,
            total: allApps.length
        };
    }

    // Bots section (everything else)
    const allBots = baseBots.filter(b => Array.isArray(b.category) ? !b.category.includes('apps') : b.category !== 'apps');
    
    // Top 3 (First 3 bots will be the dashboards selected featured bot or app, with fallbacks)
    const dashboardBotsFeatured = allBots.filter(b => b.promoted_type === 'featured');
    const remainingBots = allBots.filter(b => b.promoted_type !== 'featured');
    const botsFeatured = [...dashboardBotsFeatured, ...remainingBots].slice(0, 3);
    
    // Slider/List (Popular bots in selected category)
    let botsForList = allBots;
    if (selectedBotsCategory !== 'all') {
        botsForList = allBots.filter(b => 
            Array.isArray(b.category) 
                ? b.category.includes(selectedBotsCategory) 
                : b.category === selectedBotsCategory
        );
    }
    const botsSlider = botsForList.slice(0, 9); // Limit to 9 as requested

    if (allBots.length > 0) {
        result['bots'] = {
            featured: botsFeatured,
            slider: botsSlider,
            total: allBots.length
        };
    }
    
    return result;
  }, [filteredBots, selectedAppsCategory, selectedBotsCategory]);

  interface MenuItem {
      id: string;
      label: string;
      desc: string;
      icon: any;
      action?: () => void;
      path?: string;
  }

  const discoverItems: MenuItem[] = [
      { id: 'bots', label: 'Botlar', desc: 'Telegram Bot Marketi', icon: BotIcon, action: () => setNavState('bots') },
      { id: 'apps', label: 'Uygulamalar', desc: 'Web3 & TMA Uygulamaları', icon: LayoutGrid, action: () => setNavState('apps') },
      { id: 'channels', label: 'Kanallar', desc: 'Popüler Telegram Kanalları', icon: Megaphone, path: '/channels' },
      { id: 'ads', label: 'Reklam', desc: 'Projenizi Öne Çıkarın', icon: Share2, path: '/settings' },
  ];

  const investorItems: MenuItem[] = [
      { id: 'exchanges', label: 'Borsalar ve Takas', desc: 'CEX & DEX Platformları', icon: BarChart3 },
      { id: 'earn', label: 'Kazanç Uygulamaları', desc: 'Pasif Gelir Fırsatları', icon: Coins },
      { id: 'tools', label: 'Yatırım Araçları', desc: 'Analiz ve Takip Araçları', icon: Briefcase },
      { id: 'new', label: 'Yeni Keşifler', desc: 'Gelecek Vaadeden Projeler', icon: Compass },
  ];

  const simpleLinks = [
      { label: 'Hızlı Link 1', path: '#' },
      { label: 'Hızlı Link 2', path: '#' },
      { label: 'Hızlı Link 3', path: '#' },
  ];

  const appsCategories = appsSubCategories;

  const handleCategoryClick = (catId: string, mode: 'bots' | 'apps') => {
      haptic('light');
      navigate(`/search?mode=${mode}&category=${catId}`);
      setOpenMenu(null);
      setMobileModal(null);
      setNavState('main');
  };

  const renderMegaMenuContent = () => {
      if (openMenu === 'kesfet') {
          return (
              <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
                  <div className="col-span-8">
                      <AnimatePresence mode="wait">
                          {navState === 'main' ? (
                              <motion.div 
                                  key="main"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: -20 }}
                                  className="grid grid-cols-2 gap-4"
                              >
                                  {discoverItems.map(item => (
                                      <button 
                                          key={item.id}
                                          onClick={() => {
                                              if (item.action) item.action();
                                              else if (item.path) { navigate(item.path); setOpenMenu(null); }
                                          }}
                                          className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                                      >
                                          <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                              <item.icon size={20} />
                                          </div>
                                          <div className="flex flex-col">
                                              <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                              <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                          </div>
                                      </button>
                                  ))}
                              </motion.div>
                          ) : navState === 'bots' ? (
                              <motion.div 
                                  key="bots"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  className="flex flex-col gap-6"
                              >
                                  <div className="flex items-center gap-4 mb-2">
                                      <button 
                                          onClick={() => setNavState('main')}
                                          className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                                      >
                                          <ArrowLeft size={20} />
                                      </button>
                                      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Bot Kategorileri</h3>
                                  </div>
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                      {botsCategories.map(cat => (
                                          <button 
                                              key={cat.id}
                                              onClick={() => handleCategoryClick(cat.id, 'bots')}
                                              className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                                          >
                                              <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                  <cat.icon size={16} />
                                              </div>
                                              <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                                          </button>
                                      ))}
                                  </div>
                              </motion.div>
                          ) : (
                              <motion.div 
                                  key="apps"
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  exit={{ opacity: 0, x: 20 }}
                                  className="flex flex-col gap-6"
                              >
                                  <div className="flex items-center gap-4 mb-2">
                                      <button 
                                          onClick={() => setNavState('main')}
                                          className="p-2 hover:bg-white/10 rounded-full text-slate-500 transition-colors"
                                      >
                                          <ArrowLeft size={20} />
                                      </button>
                                      <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Uygulama Kategorileri</h3>
                                  </div>
                                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                      {appsCategories.map(cat => (
                                          <button 
                                              key={cat.id}
                                              onClick={() => handleCategoryClick(cat.id, 'apps')}
                                              className="flex items-center gap-3 p-3 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-xl transition-all group text-left border border-transparent hover:border-black/5 dark:hover:border-white/10 w-full"
                                          >
                                              <div className="menu-icon-container !w-8 !h-8 px-0 shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                                  <cat.icon size={16} />
                                              </div>
                                              <span className="text-[11px] font-bold uppercase tracking-tight menu-item-text">{t(cat.label)}</span>
                                          </button>
                                      ))}
                                  </div>
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
                  <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Hızlı Bağlantılar</span>
                      {simpleLinks.map((link, i) => (
                          <a 
                              key={i}
                              href={link.path}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all font-bold text-xs uppercase group"
                          >
                              {link.label}
                              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                          </a>
                      ))}
                  </div>
              </div>
          );
      }

      if (openMenu === 'investors') {
          return (
              <div className="max-w-5xl mx-auto px-6 grid grid-cols-12 gap-8">
                  <div className="col-span-8">
                      <div className="grid grid-cols-2 gap-4">
                          {investorItems.map(item => (
                              <button 
                                  key={item.id}
                                  className="flex items-center gap-4 p-4 hover:bg-black/[0.02] dark:hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-black/5 dark:hover:border-white/10 text-left w-full"
                              >
                                  <div className="menu-icon-container shrink-0 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                                      <item.icon size={20} />
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="text-[14px] font-semibold menu-item-text">{item.label}</span>
                                      <span className="text-[12px] text-slate-500 dark:text-slate-400 font-normal">{item.desc}</span>
                                  </div>
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="col-span-4 border-l border-black/5 dark:border-white/5 pl-8 flex flex-col justify-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-2">Yatırım Linkleri</span>
                      {simpleLinks.map((link, i) => (
                          <a 
                              key={i}
                              href={link.path}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all font-bold text-xs uppercase group"
                          >
                              {link.label}
                              <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                          </a>
                      ))}
                  </div>
              </div>
          );
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-200 animate-in transition-colors duration-300 home-page">
      <SEO 
          title={t('home_seo_title')} 
          description={t('home_seo_desc')}
      />
      <svg xmlns="http://www.w3.org/2000/svg" className="hidden" style={{ display: 'none' }}>
        <symbol id="solar.fire" viewBox="0 0 24 24">
          <g fill="currentColor">
            <path d="M12 2C11.3 3.6 10.1 5.4 9.1 7.2C8.1 9 7.4 11.1 7.4 13C7.4 17.1 10.4 20.1 14.5 20.1C18.6 20.1 21.6 17.1 21.6 13C21.6 11.2 20.9 9.3 19.9 7.7C19 6.2 17.7 4.7 16.5 3.5C16.9 4.9 17 6.4 16.5 7.7C16 9.1 14.9 10.2 13.5 10.7C13.5 8.2 12 5.5 12 2Z"/>
            <path d="M11.6 9C11.6 9 10.2 10.2 9.4 11.7C8.6 13.2 8.1 15 8.1 16.5C8.1 19.5 10.5 22 13.6 22C16.7 22 19.1 19.5 19.1 16.5C19.1 15 18.6 13.2 17.8 11.7C17 10.2 15.6 9 15.6 9C15.6 11 14.5 12.5 13.1 13C11.8 13.5 11.6 10.5 11.6 9Z" opacity="0.6"/>
          </g>
        </symbol>
      </svg>
      {/* Top Background Wrapper (Sticky Header on Desktop and Mobile) */}
      <div 
        className="sticky top-0 z-[120] min-h-[64px] md:h-[72px] py-2 md:py-0 flex items-center bg-white dark:bg-slate-950 border-b border-black/[0.03] dark:border-white/5 transition-all shadow-sm"
        onMouseLeave={() => { setOpenMenu(null); setNavState('main'); }}
      >
        {/* Top Section */}
        <div className="w-full relative z-[120]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8">
              <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-1 gap-y-4 md:gap-x-6">
                <div className="flex items-center order-1 md:w-36 lg:w-48 shrink-0">
                    <Logo onClick={() => navigate('/')} className="cursor-pointer" />
                </div>

                  <div className="w-full md:flex-1 md:max-w-4xl order-3 md:order-2 flex items-center gap-4 lg:gap-8 font-sans justify-center">
                      {/* Search Bar Container */}
                      <div className="flex-1 md:max-w-[280px] lg:max-w-[320px] relative z-[130]">
                          <div className="relative flex items-center bg-[#eeefef] dark:bg-slate-800 rounded-xl group transition-all h-[42px] px-3">
                              <div 
                                onClick={() => navigate('/search')} 
                                className="flex items-center flex-1 min-w-0 cursor-pointer active:scale-[0.98] transition-transform"
                              >
                                  <Search size={16} className="text-[#8e8e93] dark:text-slate-400 group-hover:text-blue-500 transition-colors shrink-0 mr-2" />
                                  <div className="w-full text-[13px] text-[#2c2c2e] dark:text-slate-300 font-bold truncate min-w-0 tracking-wide">
                                      Herşeyi ara
                                  </div>
                              </div>
                              
                              {/* Vertical Divider */}
                              <div className="w-px h-5 bg-black/[0.08] dark:bg-white/[0.08] mx-1 shrink-0" />
                              
                              {/* Filter Menu */}
                              <div className="shrink-0 relative z-[140]">
                                  <FilterMenu />
                              </div>
                          </div>
                      </div>

                      {/* Header Navigation Links (Discover, Categories, My Bots) */}
                      <div className="hidden md:flex items-center gap-5 lg:gap-8 shrink-0">
                          {/* Discover / Keşfet */}
                          <button 
                              onClick={() => { haptic('light'); navigate('/'); }}
                              className="nav-menu-item text-slate-800 dark:text-white hover:opacity-80 flex items-center gap-1 transition-all font-semibold text-[14px] select-none tracking-tight py-2 border-b-2 border-transparent"
                          >
                              <span>{t('nav_explore')}</span>
                          </button>

                          {/* Categories / Kategoriler */}
                          <button 
                              onMouseEnter={() => { if (window.innerWidth >= 768) setOpenMenu('kesfet'); }}
                              onClick={() => { haptic('light'); setOpenMenu(openMenu === 'kesfet' ? null : 'kesfet'); }}
                              className={`nav-menu-item text-slate-800 dark:text-white hover:opacity-80 flex items-center gap-1 transition-all font-semibold text-[14px] select-none tracking-tight py-2 border-b-2 ${openMenu === 'kesfet' ? 'border-blue-500' : 'border-transparent'}`}
                          >
                              <span>Kategoriler</span>
                              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openMenu === 'kesfet' ? 'rotate-180' : ''}`} />
                          </button>

                          {/* My Bots / Botlarım */}
                          <button 
                              onClick={() => { haptic('light'); navigate('/my-bots'); }}
                              className="nav-menu-item text-slate-800 dark:text-white hover:opacity-80 flex items-center gap-1 transition-all font-semibold text-[14px] select-none tracking-tight py-2 border-b-2 border-transparent"
                          >
                              <span>{t('my_bots')}</span>
                          </button>
                      </div>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3 order-2 md:order-3 md:w-48 justify-end ml-auto shrink-0 font-sans">
                      {user && (
                          <button onClick={() => { haptic('medium'); navigate('/earnings'); }} className="hidden sm:flex w-10 h-10 items-center justify-center text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl active:scale-95 transition-all outline-none">
                              <Wallet size={18} />
                          </button>
                      )}

                      {!user && (
                          <button 
                              onClick={() => { haptic('light'); setIsLoginModalOpen(true); }}
                              className="px-5 h-10 bg-blue-500 hover:bg-blue-600 text-white text-[13px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center whitespace-nowrap shadow-lg shadow-blue-500/25"
                          >
                              {t('login')}
                          </button>
                      )}

                      <div className="relative" ref={menuRef}>
                          <button 
                            onClick={() => { haptic('light'); setIsMenuOpen(!isMenuOpen); }} 
                            className="h-10 px-3 flex items-center justify-center gap-1.5 text-slate-900 dark:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-black/5 dark:border-white/5 rounded-xl active:scale-95 transition-all relative outline-none select-none"
                          >
                                <div className="flex md:hidden items-center gap-1.5">
                                    {user ? (
                                        <span className="text-[11px] font-black uppercase tracking-wide">
                                            {(user.username || user.first_name || user.name || '').slice(0, 5)}{(user.username || user.first_name || user.name || '').length > 5 ? '..' : ''}
                                        </span>
                                    ) : (
                                        <Menu size={18} className="text-slate-700 dark:text-slate-300" />
                                    )}
                                    <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                </div>
                                <div className="hidden md:flex items-center gap-1.5">
                                    {user ? (
                                        <>
                                            <span className="text-[11px] font-black uppercase tracking-wide">
                                                {user.username || user.first_name || user.name || ''}
                                            </span>
                                            <ChevronDown size={12} className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                                        </>
                                    ) : (
                                        <Settings size={18} className="text-slate-700 dark:text-slate-300" />
                                    )}
                                </div>
                              {user && unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-slate-50 dark:border-slate-950 text-[8px] font-black text-white flex items-center justify-center px-1 badge-pop">
                                      {unreadCount > 9 ? '9+' : unreadCount}
                                  </div>
                              )}
                          </button>
                          {isMenuOpen && (
                              <div className="absolute right-0 top-full mt-4 w-60 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-white/5 rounded-2xl shadow-2xl p-2 z-[100] animate-in fade-in zoom-in-95 duration-200">
                                  {user ? (
                                      <>
                                          <div className="p-4 border-b border-slate-100 dark:border-white/5 mb-2">
                                              <div className="flex items-center gap-3">
                                                  {(user.photo_url || user.avatar) ? (
                                                      <img 
                                                          src={user.photo_url || user.avatar} 
                                                          alt={user.first_name || user.name}
                                                          className="w-10 h-10 rounded-full object-cover"
                                                      />
                                                  ) : (
                                                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-black">
                                                          {user.first_name ? user.first_name[0] : (user.name ? user.name[0] : 'U')}
                                                      </div>
                                                  )}
                                                  <div className="flex flex-col min-w-0">
                                                      <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate">
                                                          {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.name}
                                                      </span>
                                                      <span className="text-[10px] text-slate-500 truncate">@{user.username || user.id}</span>
                                                  </div>
                                              </div>
                                          </div>

                                          <button onClick={() => { haptic('light'); navigate('/'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <Store size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('market')}</span>
                                          </button>

                                          <button 
                                              onClick={() => { haptic('light'); setMobileModal('kesfet'); setIsMenuOpen(false); }} 
                                              className="flex md:hidden w-full flex-center items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group"
                                          >
                                              <Compass size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">Keşfet</span>
                                          </button>

                                          <button 
                                              onClick={() => { haptic('light'); setMobileModal('investors'); setIsMenuOpen(false); }} 
                                              className="flex md:hidden w-full flex-center items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group"
                                          >
                                              <Briefcase size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">Yatırımcılar</span>
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/profile'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('profile')}</span>
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/my-bots'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <BotIcon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('my_bots')}</span>
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/channels'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <Megaphone size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('my_channels')}</span>
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/notifications'); setIsMenuOpen(false); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <div className="flex items-center gap-3">
                                                  <Bell size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                  <span className="text-xs font-bold uppercase tracking-tight">{t('notifications')}</span>
                                              </div>
                                              {unreadCount > 0 && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/qa'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <MessageSquare size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('qa_forum') || 'Soru Cevap Forumu'}</span>
                                          </button>

                                          <div className="h-px bg-slate-100 dark:border-white/5 my-2" />

                                          {/* Night Mode & Add Your inside dropdown */}
                                          <button onClick={() => { haptic('light'); toggleTheme(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              {theme === 'dark' ? (
                                                  <>
                                                      <Sun size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                      <span className="text-xs font-bold uppercase tracking-tight">{t('light_mode') || 'Gündüz Modu'}</span>
                                                  </>
                                              ) : (
                                                  <>
                                                      <Moon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                      <span className="text-xs font-bold uppercase tracking-tight">{t('dark_mode') || 'Gece Modu'}</span>
                                                  </>
                                              )}
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <Plus size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('add_your')}</span>
                                          </button>

                                          <div className="h-px bg-slate-100 dark:border-white/5 my-2" />
                                          
                                          <button 
                                              onClick={() => { 
                                                  const confirmed = window.confirm("Çıkış yapmak istediğinize emin misiniz?");
                                                  if (confirmed) {
                                                      haptic('medium'); 
                                                      setWebAuthUser(null);
                                                      setIsMenuOpen(false); 
                                                  }
                                              }} 
                                              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-all font-bold text-xs uppercase text-left"
                                          >
                                              <LogOut size={18} /> 
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('home_logout')}</span>
                                          </button>
                                      </>
                                  ) : (
                                      <>
                                          <button onClick={() => { haptic('light'); setIsLoginModalOpen(true); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-all group font-bold text-left">
                                              <User size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('login')}</span>
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/'); setIsMenuOpen(false); }} className="flex md:hidden w-full flex-center items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <Store size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('market')}</span>
                                          </button>

                                          <button 
                                              onClick={() => { haptic('light'); setMobileModal('kesfet'); setIsMenuOpen(false); }} 
                                              className="flex md:hidden w-full flex-center items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group"
                                          >
                                              <Compass size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">Keşfet</span>
                                          </button>

                                          <button 
                                              onClick={() => { haptic('light'); setMobileModal('investors'); setIsMenuOpen(false); }} 
                                              className="flex md:hidden w-full flex-center items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group"
                                          >
                                              <Briefcase size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">Yatırımcılar</span>
                                          </button>

                                          <button onClick={() => { haptic('light'); toggleTheme(); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              {theme === 'dark' ? (
                                                  <>
                                                      <Sun size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                      <span className="text-xs font-bold uppercase tracking-tight">{t('light_mode') || 'Gündüz Modu'}</span>
                                                  </>
                                              ) : (
                                                  <>
                                                      <Moon size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                                      <span className="text-xs font-bold uppercase tracking-tight">{t('dark_mode') || 'Gece Modu'}</span>
                                                  </>
                                              )}
                                          </button>

                                          <button onClick={() => { haptic('light'); navigate('/settings'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-all group text-left">
                                              <Plus size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                                              <span className="text-xs font-bold uppercase tracking-tight">{t('add_your')}</span>
                                          </button>
                                      </>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
                  <LoginModal 
                      isOpen={isLoginModalOpen} 
                      onClose={() => setIsLoginModalOpen(false)} 
                      onAuth={(user) => setWebAuthUser(user)} 
                  />
                </div>
              </div>
          </div>
          
          {/* Desktop Mega Menu Dropdown */}
          <AnimatePresence>
              {openMenu && (
                  <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="hidden md:block absolute left-0 right-0 top-full bg-white dark:bg-slate-900/95 backdrop-blur-xl border-b border-black/5 dark:border-white/10 shadow-2xl z-[100] mega-menu-container"
                      onMouseLeave={() => { setOpenMenu(null); setNavState('main'); }}
                  >
                      {renderMegaMenuContent()}
                  </motion.div>
              )}
          </AnimatePresence>
      </div>
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
        ) : (
            <>
              {announcements.length > 0 && (
                  <div className="pb-8 pt-4 max-w-7xl mx-auto w-full px-5 sm:px-8 overflow-hidden select-none animate-in fade-in duration-500">
                      <AnnouncementsCarousel 
                          announcements={announcements} 
                          scroll={annScroll} 
                          onShowPopup={(a) => setSelectedAnn(a)} 
                      />
                  </div>
              )}
            </>
          )}



      {/* Bottom Section */}
      <div className="bg-white dark:bg-slate-950 w-full py-24 shadow-[0_-1px_0_0_rgba(0,0,0,0.015)]">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
              {!isLoading && (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10 text-center lg:text-left">
                        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.04em] md:leading-[1.1] leading-[1.2] text-slate-900 dark:text-white max-w-2xl">
                                {t('home_hero_title').includes(':') ? (
                                    <>
                                        {t('home_hero_title').split(':')[0]}: <span className="text-blue-500 dark:text-blue-400">{t('home_hero_title').split(':')[1]?.trim()}</span>
                                    </>
                                ) : t('home_hero_title')}
                            </h1>
                            <p className="mt-6 text-[15px] sm:text-[16px] text-slate-500/80 dark:text-slate-400/80 leading-[1.6] font-normal max-w-[55ch]">
                                {t('home_hero_desc')}
                            </p>
                            
                            {/* CTA Buttons - Premium, equal height, correct padding and style */}
                            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <button 
                                    onClick={() => { haptic('medium'); navigate('/search'); }}
                                    className="px-8 h-12 bg-blue-500 hover:bg-blue-600 text-white text-[14px] font-bold rounded-xl transition-all shadow-md shadow-blue-500/10 active:scale-95 flex items-center justify-center whitespace-nowrap"
                                >
                                    {t('explore_now') || 'Hemen Keşfet'}
                                </button>
                                <button 
                                    onClick={() => { haptic('light'); navigate('/settings'); }}
                                    className="px-8 h-12 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-slate-200 text-[14px] font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center whitespace-nowrap border border-black/5 dark:border-white/5"
                                >
                                    {t('add_your') || 'Botunu Ekle'}
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Premium mock-up preview UI */}
                        <div className="lg:col-span-5 hidden lg:block relative w-full">
                            <div className="relative p-6 rounded-[14px] border border-black/[0.06] dark:border-white/[0.06] bg-slate-50 dark:bg-[#0F1623] text-slate-900 dark:text-white overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                                
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.04] dark:border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">BOTLYHUB SYSTEM ACTIVE</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">v2.4.9</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#121C2E] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center font-bold text-xs shrink-0">
                                                AI
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Assistant Pro Bot</h4>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Natural language tool integration</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full shrink-0">ACTIVE</span>
                                    </div>

                                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#121C2E] border border-black/[0.04] dark:border-white/[0.05] flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center font-bold text-xs shrink-0">
                                                TN
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">TON Wallet Hub</h4>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Secure automated play flow</p>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full shrink-0">1.2M USERS</span>
                                    </div>

                                    <div className="pt-2 flex justify-between items-center text-[10px] font-mono text-slate-400">
                                        <span>Discover bots built for real use</span>
                                        <span className="text-blue-500 dark:text-blue-400 font-bold">Explore list →</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating subtle overlay badge */}
                            <div className="absolute -bottom-3 -right-2 p-3 rounded-lg bg-white dark:bg-[#121C2E] border border-black/[0.06] dark:border-white/[0.08] text-slate-800 dark:text-white flex items-center gap-2 shadow-xl">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-bold tracking-wider text-slate-600 dark:text-slate-300">Option A Active</span>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                <motion.div 
                    key={activeFilter}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Apps Section */}
                    {categorizedBots['apps'] && (() => {
                        const data = categorizedBots['apps'];
                        
                        const featuredBots = data.featured;
                        const sliderBots = data.slider;

                        const botChunks = [];
                        for (let i = 0; i < sliderBots.length; i += 3) {
                            botChunks.push(sliderBots.slice(i, i + 3));
                        }

                        return (
                            <div className="my-12 md:my-16 space-y-6 md:space-y-8">
                                <div className="flex flex-col gap-6 overflow-hidden">
                                    <div 
                                        className="flex flex-col gap-2 cursor-pointer group shrink-0"
                                        onClick={() => navigate(`/search?mode=apps&category=all`)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                Mini Apps
                                            </h2>
                                            <span className="text-xs font-semibold bg-blue-500/10 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full ml-1">
                                                {data.total}
                                            </span>
                                            <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <p className="hidden sm:block text-[14px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                                            {t('home_apps_desc')}
                                        </p>
                                    </div>

                                    {/* Top 3 Featured Cards for this section */}
                                    <div className="flex md:grid md:grid-cols-3 gap-5 mb-4 overflow-x-auto no-scrollbar pb-3 md:pb-0 snap-x snap-mandatory animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        {featuredBots.map((bot, index) => (
                                            <div key={bot.id} className="min-w-[280px] w-[85%] sm:min-w-[320px] md:w-full snap-center shrink-0">
                                                <BotCard bot={bot} tonRate={tonRate} featuredRank={index + 1} />
                                            </div>
                                        ))}
                                    </div>

                                    <div 
                                        ref={catScroll.ref}
                                        onMouseDown={catScroll.onMouseDown}
                                        onMouseUp={catScroll.onMouseUp}
                                        onMouseMove={catScroll.onMouseMove}
                                        onMouseLeave={catScroll.onMouseLeave}
                                        onContextMenu={catScroll.onContextMenu}
                                        className="category-filter-container no-scrollbar relative z-0"
                                    >
                                        <button 
                                            className={`category-filter-item ${selectedAppsCategory === 'all' ? 'active' : ''}`}
                                            onClick={() => { haptic('light'); setSelectedAppsCategory('all'); }}
                                        >
                                            {t('home_all')}
                                        </button>
                                        {appsSubCategories.map((subCat) => (
                                            <button 
                                                key={subCat.id} 
                                                className={`category-filter-item ${selectedAppsCategory === subCat.id ? 'active' : ''}`}
                                                onClick={() => { haptic('light'); setSelectedAppsCategory(subCat.id); }}
                                            >
                                                {t(subCat.label)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {(() => {
                                    const displayedBots = sliderBots.slice(0, 9);
                                    return (
                                        <>
                                            {/* Desktop Grid Layout (sm and up) */}
                                            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7 px-1 py-2">
                                                {displayedBots.map((bot, idx) => (
                                                    <CategoryBotCard key={bot.id} bot={bot} rank={idx + 1} />
                                                ))}
                                            </div>

                                            {/* Mobile Horizontal Carousel Layout (xs) */}
                                            <div className="sm:hidden relative -mx-4 px-4 overflow-hidden">
                                                <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                                                    {getMobileColumns(sliderBots).map((col, colIdx) => (
                                                        <div key={colIdx} className="flex flex-col gap-5 min-w-[85vw] snap-center first:pl-2">
                                                            {col.map(({ bot, rank }) => (
                                                                <CategoryBotCard key={bot.id} bot={bot} rank={rank} />
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        );
                    })()}


                    {/* Bots Section */}
                    {categorizedBots['bots'] && (() => {
                        const data = categorizedBots['bots'];
                        
                        const featuredBots = data.featured;
                        const sliderBots = data.slider;

                        const botChunks = [];
                        for (let i = 0; i < sliderBots.length; i += 3) {
                            botChunks.push(sliderBots.slice(i, i + 3));
                        }

                        return (
                            <div className="my-12 md:my-16 space-y-6 md:space-y-8">
                                <div className="flex flex-col gap-6 overflow-hidden">
                                    <div 
                                        className="flex flex-col gap-2 cursor-pointer group shrink-0"
                                        onClick={() => navigate(`/search?mode=bots&category=all`)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                                Botlar
                                            </h2>
                                            <span className="text-xs font-semibold bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full ml-1">
                                                {data.total}
                                            </span>
                                            <ChevronRight size={18} className="text-slate-400 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <p className="hidden sm:block text-[14px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                                            {t('home_bots_desc')}
                                        </p>
                                    </div>

                                    {/* Top 3 Featured Cards for this section */}
                                    <div className="flex md:grid md:grid-cols-3 gap-5 mb-4 overflow-x-auto no-scrollbar pb-3 md:pb-0 snap-x snap-mandatory animate-in fade-in slide-in-from-bottom-2 duration-700">
                                        {featuredBots.map((bot, index) => (
                                            <div key={bot.id} className="min-w-[280px] w-[85%] sm:min-w-[320px] md:w-full snap-center shrink-0">
                                                <BotCard bot={bot} tonRate={tonRate} featuredRank={index + 1} />
                                            </div>
                                        ))}
                                    </div>

                                    <div 
                                        ref={botsCatScroll.ref}
                                        onMouseDown={botsCatScroll.onMouseDown}
                                        onMouseUp={botsCatScroll.onMouseUp}
                                        onMouseMove={botsCatScroll.onMouseMove}
                                        onMouseLeave={botsCatScroll.onMouseLeave}
                                        onContextMenu={botsCatScroll.onContextMenu}
                                        className="category-filter-container no-scrollbar relative z-0"
                                    >
                                        <button 
                                            className={`category-filter-item ${selectedBotsCategory === 'all' ? 'active' : ''}`}
                                            onClick={() => { haptic('light'); setSelectedBotsCategory('all'); }}
                                        >
                                            {t('home_all')}
                                        </button>
                                        {botsCategories.map((cat) => (
                                            <button 
                                                key={cat.id} 
                                                className={`category-filter-item ${selectedBotsCategory === cat.id ? 'active' : ''}`}
                                                onClick={() => { haptic('light'); setSelectedBotsCategory(cat.id); }}
                                            >
                                                {t(cat.label)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                {(() => {
                                    const displayedBots = sliderBots.slice(0, 9);
                                    return (
                                        <>
                                            {/* Desktop Grid Layout (sm and up) */}
                                            <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-7 px-1 py-2">
                                                {displayedBots.map((bot, idx) => (
                                                    <CategoryBotCard key={bot.id} bot={bot} rank={idx + 1} />
                                                ))}
                                            </div>

                                            {/* Mobile Horizontal Carousel Layout (xs) */}
                                            <div className="sm:hidden relative -mx-4 px-4 overflow-hidden">
                                                <div className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4">
                                                    {getMobileColumns(sliderBots).map((col, colIdx) => (
                                                        <div key={colIdx} className="flex flex-col gap-5 min-w-[85vw] snap-center first:pl-2">
                                                            {col.map(({ bot, rank }) => (
                                                                <CategoryBotCard key={bot.id} bot={bot} rank={rank} />
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        );
                    })()}

                    {Object.keys(categorizedBots).length === 0 && (
                        <div className="py-24 text-center text-slate-400 dark:text-slate-700 font-bold uppercase text-xs tracking-widest animate-in fade-in zoom-in duration-500">
                             {t('home_no_items')}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {homeBlogs.length > 0 && (
                <div className="my-12 md:my-16 pt-12 md:pt-16 border-t border-black/[0.03] dark:border-white/[0.03]">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-[2px] bg-blue-500"></div>
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                                {t('blog_title')}
                            </h2>
                        </div>
                        <button 
                            onClick={() => { haptic('light'); navigate('/blog'); }}
                            className="text-[11px] font-bold text-slate-400 hover:text-blue-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                        >
                            {t('blog_all_articles')}
                            <ChevronRight size={14} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {homeBlogs.map((post) => (
                            <div 
                                key={post.id}
                                onClick={() => { haptic('light'); navigate(`/blog/${post.slug || post.id}`); }}
                                className="group cursor-pointer flex flex-col bg-slate-50 dark:bg-slate-900/10 border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden hover:border-blue-500/20 hover:scale-[1.01] transition-all duration-300"
                            >
                                <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-white/5">
                                    {post.image ? (
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/10 to-indigo-600/10 text-blue-500">
                                            <Sparkles size={24} />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-md text-slate-900 dark:text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-black/5 dark:border-white/5">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-blue-500 transition-colors duration-300">
                                            {post.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic line-clamp-2 mb-4">
                                            {post.excerpt || post.content.replace(/<[^>]*>/g, '').slice(0, 100) + '...'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-black/[0.03] dark:border-white/[0.03]">
                                        <div className="flex items-center gap-2 max-w-[70%]">
                                            <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 shrink-0">
                                                <img 
                                                    src={post.authorAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=334155&color=fff&bold=true`} 
                                                    alt="" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate">
                                                {post.author}
                                            </span>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight shrink-0">
                                            {post.readTime || '5 dk'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-20 mb-20 px-4 max-w-4xl mx-auto border-t border-black/[0.03] dark:border-white/[0.03] pt-20">
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic mb-6">
                        {t('home_about_title').includes(':') ? (
                            <>
                                {t('home_about_title').split(':')[0]}: <span className="text-blue-500">{t('home_about_title').split(':')[1]?.trim()}</span>
                            </>
                        ) : t('home_about_title')}
                    </h2>
                    <div className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic space-y-4">
                        <p>{t('home_about_p1')}</p>
                        <p>{t('home_about_p2')}</p>
                        <p>{t('home_about_p3')}</p>
                        <p>{t('home_about_p4')}</p>
                    </div>
                </div>
            </div>

            <div className="mt-20 mb-20 px-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-[2px] bg-blue-500"></div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                        {t('home_faq_title')}
                    </h2>
                </div>
                
                <div className="space-y-4">
                    {[
                        {
                            q: t('home_faq_1_q'),
                            a: t('home_faq_1_a')
                        },
                        {
                            q: t('home_faq_2_q'),
                            a: t('home_faq_2_a')
                        },
                        {
                            q: t('home_faq_3_q'),
                            a: t('home_faq_3_a')
                        },
                        {
                            q: t('home_faq_4_q'),
                            a: t('home_faq_4_a')
                        }
                    ].map((item, idx) => (
                        <details key={idx} className="group bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-xl transition-all overflow-hidden shadow-sm">
                            <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight italic">{item.q}</span>
                                <ChevronDown size={18} className="text-slate-400 group-open:rotate-180 transition-transform duration-300" />
                            </summary>
                            <div className="p-5 pt-0 text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic border-t border-black/[0.03] dark:border-white/[0.03] bg-[#00000004] dark:bg-black/20">
                                {item.a}
                            </div>
                        </details>
                    ))}
                </div>
                
                {/* FAQ Schema */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "BotlyHub nedir?",
                                "acceptedAnswer": {
                                    "@type": "AcceptedAnswer",
                                    "text": "BotlyHub, Telegram ekosistemindeki en iyi botları, kanalları ve uygulamaları keşfetmenizi sağlayan merkezi bir platformdur."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Kendi botumu nasıl ekleyebilirim?",
                                "acceptedAnswer": {
                                    "@type": "AcceptedAnswer",
                                    "text": "Sağ üstteki 'Bot Ekle' butonuna basarak veya admin paneli üzerinden projenizi sisteme kaydedebilirsiniz."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Premium üyelik avantajları nelerdir?",
                                "acceptedAnswer": {
                                    "@type": "AcceptedAnswer",
                                    "text": "Düşük komisyonlar, öne çıkan listeleme ve detaylı analizler sunar."
                                }
                            }
                        ]
                    })}
                </script>
            </div>

            <div className="mt-16">
                <div className="pb-32" />
            </div>
          </>
        )}
        </div>
      </div>

      <AnimatePresence>
        {selectedAnn && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl" onClick={() => setSelectedAnn(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-[min(calc(100vw-32px),384px)] rounded-xl overflow-hidden relative" 
              onClick={e => e.stopPropagation()}
            >
                <div className="relative h-44 overflow-hidden">
                    {selectedAnn.bg_image_url ? (
                        <>
                            <img src={selectedAnn.bg_image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent"></div>
                        </>
                    ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                            selectedAnn.color_scheme === 'purple' ? 'from-purple-600 to-indigo-700' :
                            selectedAnn.color_scheme === 'emerald' ? 'from-emerald-600 to-teal-700' :
                            selectedAnn.color_scheme === 'blue' ? 'from-blue-600 to-cyan-700' :
                            'from-orange-500 to-red-600'
                        } opacity-90`}>
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setSelectedAnn(null)} 
                        className="absolute top-6 right-6 flex items-center justify-center p-2 text-white/80 hover:text-white transition-all active:scale-90 drop-shadow-lg"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute bottom-6 left-8 flex items-center gap-2">
                        {selectedAnn.badge_text && (
                            selectedAnn.badge_text.toLowerCase() === 'sponsorlu' ? (
                                <div className="sponsored-badge flex items-center px-3 py-1 rounded-full shadow-lg">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedAnn.badge_text}</span>
                                </div>
                            ) : (
                                <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedAnn.badge_text}</span>
                                </div>
                            )
                        )}
                        {selectedAnn.tag && (
                            <div className="px-3 py-1 bg-brand border border-white/20 rounded-xl">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedAnn.tag}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 pt-2">
                    <div className="flex items-center gap-4 mb-4">
                        {selectedAnn.icon_name !== 'None' && (
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-center shrink-0">
                                {React.createElement(iconMap[selectedAnn.icon_name] || Sparkles, { size: 22, className: 'text-brand dark:text-brand-light' })}
                            </div>
                        )}
                        <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase leading-none truncate pr-2">
                            {selectedAnn.title}
                        </h3>
                    </div>

                    <div className="bg-slate-50 dark:bg-black/20 rounded-xl p-6 mb-8 border border-black/5 dark:border-white/5">
                        <p className="text-slate-600 dark:text-slate-400 text-[12px] leading-relaxed font-bold uppercase italic opacity-80 whitespace-pre-wrap">
                            {selectedAnn.content_detail || selectedAnn.description}
                        </p>
                    </div>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => { 
                                haptic('heavy'); 
                                const link = selectedAnn.button_link;
                                if (link.startsWith('@')) window.location.href = `https://t.me/${link.substring(1)}`;
                                else if (link.startsWith('http')) window.location.href = link;
                                else navigate(link);
                                setSelectedAnn(null); 
                            }} 
                            className="w-full h-14 bg-brand dark:bg-brand-light text-white text-[12px] font-black rounded-xl uppercase tracking-[0.2em] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group shadow-lg shadow-brand/20"
                        >
                            {selectedAnn.button_text || t('home_explore_now')} 
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        <button 
                            onClick={() => setSelectedAnn(null)} 
                            className="w-full py-4 text-slate-400 dark:text-slate-500 font-black text-[9px] uppercase tracking-[0.2em] hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            {t('home_maybe_later')}
                        </button>
                    </div>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Modal for Categories */}
      <AnimatePresence>
          {mobileModal && (
              <div className="fixed inset-0 z-[200] flex items-end justify-center p-0 md:hidden">
                  <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => { setMobileModal(null); setNavState('main'); }}
                      className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                  />
                  <motion.div 
                      initial={{ y: "100%" }}
                      animate={{ y: 0 }}
                      exit={{ y: "100%" }}
                      transition={{ type: "spring", damping: 30, stiffness: 300 }}
                      className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] overflow-hidden pt-4 pb-12 border-t border-black/10 dark:border-white/10"
                  >
                      {/* Drag Handle */}
                      <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8" />
                      
                      <div className="flex justify-between items-center mb-6 px-8">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase italic bg-transparent border-none outline-none">
                              {mobileModal === 'kesfet' ? 'KEŞFET' : 'YATIRIMCILAR'}
                          </h3>
                          <button onClick={() => { setMobileModal(null); setNavState('main'); }} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 active:scale-90 transition-all">
                              <X size={20} />
                          </button>
                      </div>
                      
                      <div className="max-h-[70vh] overflow-y-auto px-6 pb-4">
                          <AnimatePresence mode="wait">
                              {navState === 'main' ? (
                                  <motion.div 
                                      key="mobile-main"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      className="grid grid-cols-1 gap-3"
                                  >
                                      {(mobileModal === 'kesfet' ? discoverItems : investorItems).map((item) => (
                                          <button
                                              key={item.id}
                                              onClick={() => {
                                                  if (item.action) item.action();
                                                  else if (item.path) { navigate(item.path); setMobileModal(null); }
                                              }}
                                              className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-all rounded-2xl border border-black/5 dark:border-white/5 group mobile-menu-item"
                                          >
                                              <div className={`mobile-menu-icon-container flex items-center justify-center rounded-xl shrink-0 ${mobileModal === 'kesfet' ? 'text-blue-500' : 'text-emerald-500'}`}>
                                                  <item.icon size={22} className="menu-item-icon" />
                                              </div>
                                              <div className="flex flex-col items-start min-w-0">
                                                  <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate w-full">
                                                      {item.label}
                                                  </span>
                                              </div>
                                              {item.action && <ChevronRight size={16} className="ml-auto text-slate-300 dark:text-slate-700" />}
                                          </button>
                                      ))}
                                  </motion.div>
                              ) : navState === 'bots' ? (
                                  <motion.div 
                                      key="mobile-bots"
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      className="flex flex-col gap-4"
                                  >
                                      <button 
                                          onClick={() => setNavState('main')}
                                          className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                                      >
                                          <ArrowLeft size={16} /> Geri
                                      </button>
                                      <div className="grid grid-cols-2 gap-3">
                                          {botsCategories.map(cat => (
                                              <button 
                                                  key={cat.id}
                                                  onClick={() => handleCategoryClick(cat.id, 'bots')}
                                                  className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item"
                                              >
                                                  <div className="mobile-menu-icon-container flex items-center justify-center text-blue-500">
                                                      <cat.icon size={20} />
                                                  </div>
                                                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                                              </button>
                                          ))}
                                      </div>
                                  </motion.div>
                              ) : (
                                  <motion.div 
                                      key="mobile-apps"
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: 20 }}
                                      className="flex flex-col gap-4"
                                  >
                                      <button 
                                          onClick={() => setNavState('main')}
                                          className="flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[11px] mb-2"
                                      >
                                          <ArrowLeft size={16} /> Geri
                                      </button>
                                      <div className="grid grid-cols-2 gap-3">
                                          {appsCategories.map(cat => (
                                              <button 
                                                  key={cat.id}
                                                  onClick={() => handleCategoryClick(cat.id, 'apps')}
                                                  className="flex flex-col items-start gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 mobile-menu-item"
                                              >
                                                  <div className="mobile-menu-icon-container flex items-center justify-center text-emerald-500">
                                                      <cat.icon size={20} />
                                                  </div>
                                                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-700 dark:text-slate-300">{t(cat.label)}</span>
                                              </button>
                                          ))}
                                      </div>
                                  </motion.div>
                              )}
                          </AnimatePresence>
                          
                          {navState === 'main' && (
                              <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 block mb-4">Hızlı Bağlantılar</span>
                                  <div className="grid grid-cols-1 gap-2">
                                      {simpleLinks.map((link, i) => (
                                          <a 
                                              key={i}
                                              href={link.path}
                                              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase"
                                          >
                                              {link.label}
                                              <ExternalLink size={14} />
                                          </a>
                                      ))}
                                  </div>
                              </div>
                          )}
                      </div>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
};

const AnnouncementsCarousel: React.FC<{ 
    announcements: Announcement[], 
    scroll: any, 
    onShowPopup: (ann: Announcement) => void 
}> = React.memo(({ announcements, scroll, onShowPopup }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { t } = useTranslation();

    const handleScroll = useCallback(() => {
        if (scroll.ref.current) {
            const width = scroll.ref.current.offsetWidth;
            const index = Math.round(scroll.ref.current.scrollLeft / width);
            if (index !== currentIndex) {
                setCurrentIndex(index);
            }
        }
    }, [currentIndex, scroll.ref]);

    useEffect(() => {
        const el = scroll.ref.current;
        if (el) {
            el.addEventListener('scroll', handleScroll, { passive: true });
            return () => el.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, scroll.ref]);

    useEffect(() => {
        if (announcements.length <= 1) return;

        const interval = setInterval(() => {
            if (window.innerWidth < 768 && scroll.ref.current && !scroll.isDragging) {
                const nextIndex = (currentIndex + 1) % announcements.length;
                const width = scroll.ref.current.offsetWidth;
                scroll.ref.current.scrollTo({
                    left: nextIndex * width,
                    behavior: 'smooth'
                });
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentIndex, announcements.length, scroll.isDragging, scroll.ref]);

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="relative">
                <div 
                    ref={scroll.ref}
                    onMouseDown={scroll.onMouseDown}
                    onMouseUp={scroll.onMouseUp}
                    onMouseMove={scroll.onMouseMove}
                    onMouseLeave={scroll.onMouseLeave}
                    onContextMenu={scroll.onContextMenu}
                    className={`flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-x-visible no-scrollbar pb-3 scroll-smooth snap-x snap-mandatory ${scroll.isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    {announcements.map((ann) => (
                        <div 
                            key={ann.id} 
                            className="w-[84vw] sm:w-[50vw] md:w-full shrink-0 snap-center"
                        >
                            <PromoCard ann={ann} onShowPopup={onShowPopup} />
                        </div>
                    ))}
                </div>

                {announcements.length > 1 && (
                    <div className="md:hidden flex justify-center items-center gap-1.5 mt-3 pointer-events-none">
                        {announcements.map((_, i) => (
                            <div 
                                key={i} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-slate-800 dark:bg-white' : 'w-1.5 bg-slate-300 dark:bg-slate-700'}`} 
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

export default Home;
